import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { ASAAS_BASE_URL, asaasHeaders } from "@/app/lib/asaas"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const userId = (session!.user as any).id

    const sub = await prisma.subscription.findUnique({ where: { userId } })

    if (!sub || sub.status === "cancelled") {
      return NextResponse.json({ error: "Nenhuma assinatura ativa." }, { status: 400 })
    }

    await fetch(`${ASAAS_BASE_URL}/subscriptions/${sub.mpSubscriptionId}`, {
      method: "DELETE",
      headers: asaasHeaders(),
    }).catch(() => {})

    await prisma.subscription.update({
      where: { userId },
      data: { status: "cancelled" },
    })

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { trialEndsAt: true },
    })

    const wasPaid = sub.status === "authorized"
    const now = new Date()
    const inTrial = dbUser?.trialEndsAt && dbUser.trialEndsAt > now

    let planExpiresAt: Date | null = null

    if (wasPaid) {
      planExpiresAt = sub.nextBillingDate ?? null
    } else if (inTrial) {
      planExpiresAt = dbUser!.trialEndsAt!
    }

    await prisma.user.update({
      where: { id: userId },
      data: { planExpiresAt, ...(!wasPaid && !inTrial && { plan: "FREE" }) },
    })

    return NextResponse.json({ success: true, planExpiresAt })
  } catch (error: any) {
    console.error("[CANCEL-SUBSCRIPTION]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
