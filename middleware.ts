import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/((?!login|register|plans|api/auth|api/asaas-webhook|_next|favicon.ico).*)",
  ],
}
