import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    // Cria clínica e usuário numa transação
    await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: { name: `Clínica de ${name.trim()}` },
      })

      await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashed,
          plan: "FREE",
          trialUsed: true,
          trialEndsAt,
          clinicId: clinic.id,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[REGISTER]", error)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
