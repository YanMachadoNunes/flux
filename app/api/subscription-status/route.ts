import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const userId = (session!.user as any).id

  const [sub, dbUser] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, trialEndsAt: true, planExpiresAt: true },
    }),
  ])

  if (!sub) {
    return NextResponse.json({
      status: null,
      plan: dbUser?.plan ?? "FREE",
      trialEndsAt: dbUser?.trialEndsAt ?? null,
    })
  }

  // Se pendente e dentro do trial, retorna como authorized
  if (sub.status === "pending") {
    const inTrial = dbUser?.trialEndsAt && new Date() < new Date(dbUser.trialEndsAt)
    if (inTrial) {
      return NextResponse.json({
        status: "authorized",
        plan: sub.plan,
        trialEndsAt: dbUser?.trialEndsAt,
        nextBillingDate: sub.nextBillingDate,
      })
    }
  }

  const accessUntil =
    sub.nextBillingDate ?? dbUser?.planExpiresAt ?? dbUser?.trialEndsAt ?? null

  return NextResponse.json({
    status: sub.status,
    plan: sub.plan,
    trialEndsAt: dbUser?.trialEndsAt,
    nextBillingDate: accessUntil,
  })
}
