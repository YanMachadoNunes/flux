import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

/** Retorna o clinicId do usuário autenticado. Redireciona para /login se não autenticado. */
export async function getClinicId(): Promise<string> {
  const session = await getServerSession(authOptions)
  const clinicId = (session?.user as any)?.clinicId as string | undefined
  if (!clinicId) redirect("/login")
  return clinicId
}
