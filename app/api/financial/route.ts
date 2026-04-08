import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const records = await prisma.financialRecord.findMany({
    orderBy: { dueDate: "desc" },
    take: 100,
  });
  return NextResponse.json(records);
}
