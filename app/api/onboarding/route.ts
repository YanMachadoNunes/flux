import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const userId = (session.user as any).id as string
  if (!userId) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 })
  }

  const { clinicName } = await req.json()
  if (!clinicName?.trim()) {
    return NextResponse.json({ error: "Nome da clínica é obrigatório." }, { status: 400 })
  }

  // Verifica se já tem clínica
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { clinicId: true },
  })

  if (existing?.clinicId) {
    return NextResponse.json({ error: "Clínica já configurada." }, { status: 409 })
  }

  await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: { name: clinicName.trim() },
    })
    await tx.user.update({
      where: { id: userId },
      data: { clinicId: clinic.id },
    })
  })

  return NextResponse.json({ success: true })
}
