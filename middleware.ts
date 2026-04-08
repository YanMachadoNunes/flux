import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token as any

    // Páginas que não precisam de verificação de trial
    const freePaths = ["/plans", "/login", "/register"]
    if (freePaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.next()
    }

    const plan: string = token?.plan ?? "FREE"
    const trialExpired: boolean = token?.trialExpired === true
    const trialEndsAt: string | null = token?.trialEndsAt ?? null

    // Plano pago ativo → libera
    if (plan === "STARTER" || plan === "PRO") {
      return NextResponse.next()
    }

    // Trial expirado (flag do JWT ou verificação direta)
    const expired =
      trialExpired ||
      (trialEndsAt != null && new Date(trialEndsAt) < new Date())

    if (expired) {
      const url = req.nextUrl.clone()
      url.pathname = "/plans"
      url.searchParams.set("expired", "1")
      return NextResponse.redirect(url)
    }

    // Trial ativo → libera
    if (trialEndsAt) return NextResponse.next()

    // Sem trial e sem plano → manda para /plans
    const url = req.nextUrl.clone()
    url.pathname = "/plans"
    return NextResponse.redirect(url)
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: [
    "/((?!login|register|plans|api/auth|api/asaas-webhook|_next|favicon\\.ico).*)",
  ],
}
