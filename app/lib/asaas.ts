export const ASAAS_BASE_URL =
  process.env.ASAAS_SANDBOX === "true"
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/v3"

export function asaasHeaders() {
  return {
    "Content-Type": "application/json",
    access_token: process.env.ASAAS_API_KEY!,
  }
}

export async function findOrCreateAsaasCustomer(params: {
  name: string
  email: string
  userId: string
  existingCustomerId?: string | null
  cpfCnpj?: string
}): Promise<string> {
  const { name, email, userId, existingCustomerId, cpfCnpj } = params

  if (existingCustomerId) {
    if (cpfCnpj) {
      await fetch(`${ASAAS_BASE_URL}/customers/${existingCustomerId}`, {
        method: "PUT",
        headers: asaasHeaders(),
        body: JSON.stringify({ cpfCnpj }),
      }).catch(() => {})
    }
    return existingCustomerId
  }

  const res = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: "POST",
    headers: asaasHeaders(),
    body: JSON.stringify({
      name,
      email,
      externalReference: userId,
      ...(cpfCnpj && { cpfCnpj }),
    }),
  })

  const data = await res.json()
  if (!data.id) throw new Error(`Asaas customer error: ${JSON.stringify(data)}`)
  return data.id
}

export async function getAsaasSubscriptionPaymentUrl(
  subscriptionId: string,
): Promise<string | null> {
  const res = await fetch(
    `${ASAAS_BASE_URL}/subscriptions/${subscriptionId}/payments`,
    { headers: asaasHeaders() },
  )
  const data = await res.json()
  const firstPayment = data.data?.[0]
  return firstPayment?.invoiceUrl ?? null
}
