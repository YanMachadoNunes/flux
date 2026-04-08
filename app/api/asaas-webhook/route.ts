import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { PlanType } from "@/app/lib/plans"

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("asaas-access-token")
    if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      console.warn("[ASAAS-WEBHOOK] Token inválido")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    console.log("[ASAAS-WEBHOOK]", JSON.stringify(data))

    const { event, payment, subscription } = data

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const subscriptionId = payment?.subscription
      if (subscriptionId) {
        const sub = await prisma.subscription.findUnique({
          where: { mpSubscriptionId: subscriptionId },
        })
        if (sub) {
          const nextBillingDate = payment?.dueDate ? new Date(payment.dueDate) : null

          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "authorized", nextBillingDate },
          })

          await prisma.user.update({
            where: { id: sub.userId },
            data: { plan: sub.plan as PlanType, trialUsed: true },
          })

          console.log(`[ASAAS-WEBHOOK] Plano ativado: ${sub.userId} → ${sub.plan}`)
        }
      }
    }

    if (event === "SUBSCRIPTION_DELETED" || event === "SUBSCRIPTION_INACTIVATED") {
      const subscriptionId = subscription?.id
      if (subscriptionId) {
        const sub = await prisma.subscription.findUnique({
          where: { mpSubscriptionId: subscriptionId },
        })
        if (sub) {
          const dbUser = await prisma.user.findUnique({
            where: { id: sub.userId },
            select: { trialEndsAt: true },
          })
          const now = new Date()
          const inTrial = dbUser?.trialEndsAt && dbUser.trialEndsAt > now
          const planExpiresAt = inTrial
            ? dbUser!.trialEndsAt!
            : (sub.nextBillingDate ?? null)

          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "cancelled" },
          })

          await prisma.user.update({
            where: { id: sub.userId },
            data: { planExpiresAt },
          })

          console.log(`[ASAAS-WEBHOOK] Assinatura cancelada: ${sub.userId}`)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ASAAS-WEBHOOK]", error)
    return NextResponse.json({ success: true })
  }
}
