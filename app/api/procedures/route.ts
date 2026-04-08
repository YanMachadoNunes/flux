import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const procedures = await prisma.procedure.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(procedures);
}
