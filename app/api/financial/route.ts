import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  const clinicId = (session?.user as any)?.clinicId as string | undefined
  if (!clinicId) return NextResponse.json([], { status: 401 })

  const records = await prisma.financialRecord.findMany({
    where: { clinicId },
    orderBy: { dueDate: "desc" },
  })

  return NextResponse.json(records)
}
