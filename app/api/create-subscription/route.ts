import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { PLANS, PlanType } from "@/app/lib/plans"
import { prisma } from "@/app/lib/prisma"
import {
  ASAAS_BASE_URL,
  asaasHeaders,
  findOrCreateAsaasCustomer,
  getAsaasSubscriptionPaymentUrl,
} from "@/app/lib/asaas"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const userId = (session!.user as any).id
    const { planId, cpfCnpj } = await req.json()

    const planType = planId as PlanType
    if (!["STARTER", "PRO"].includes(planType)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    const plan = PLANS[planType]

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, asaasCustomerId: true, trialUsed: true },
    })

    if (!dbUser?.email) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Bloqueia assinatura ativa existente
    const existing = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (existing?.status === "authorized") {
      return NextResponse.json({ error: "Você já possui uma assinatura ativa." }, { status: 409 })
    }

    // Cancela assinatura pendente anterior no Asaas
    if (existing?.status === "pending" && existing.provider === "asaas") {
      await fetch(`${ASAAS_BASE_URL}/subscriptions/${existing.mpSubscriptionId}`, {
        method: "DELETE",
        headers: asaasHeaders(),
      }).catch(() => {})
    }

    // Cria ou reutiliza cliente no Asaas
    const asaasCustomerId = await findOrCreateAsaasCustomer({
      name: dbUser.name,
      email: dbUser.email,
      userId,
      existingCustomerId: dbUser.asaasCustomerId,
      cpfCnpj,
    })

    // Trial: 7 dias na primeira assinatura, cobrança imediata nas demais
    const trialUsed = dbUser.trialUsed ?? false
    const daysUntilCharge = trialUsed ? 1 : 7
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + daysUntilCharge)
    const nextDueDateStr = nextDueDate.toISOString().split("T")[0]

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(!dbUser.asaasCustomerId && { asaasCustomerId }),
        ...(!trialUsed && {
          trialEndsAt: nextDueDate,
          trialUsed: true,
          plan: planType,
        }),
      },
    })

    // Cria assinatura no Asaas
    const subRes = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
      method: "POST",
      headers: asaasHeaders(),
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: "UNDEFINED",
        value: plan.price,
        nextDueDate: nextDueDateStr,
        cycle: "MONTHLY",
        description: `Plano ${plan.name} Mensal - Flux`,
        externalReference: userId,
      }),
    })

    const subData = await subRes.json()
    console.log("[CREATE-SUBSCRIPTION] Asaas response:", JSON.stringify(subData))

    if (!subData.id) {
      return NextResponse.json(
        { error: subData.errors?.[0]?.description || "Erro ao criar assinatura no Asaas" },
        { status: 500 },
      )
    }

    const paymentUrl = await getAsaasSubscriptionPaymentUrl(subData.id)

    if (!paymentUrl) {
      return NextResponse.json(
        { error: "Não foi possível obter o link de pagamento" },
        { status: 500 },
      )
    }

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        mpSubscriptionId: subData.id,
        provider: "asaas",
        plan: planType,
        status: "pending",
      },
      update: {
        mpSubscriptionId: subData.id,
        provider: "asaas",
        plan: planType,
        status: "pending",
      },
    })

    return NextResponse.json({ success: true, paymentUrl })
  } catch (error: any) {
    console.error("[CREATE-SUBSCRIPTION]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
