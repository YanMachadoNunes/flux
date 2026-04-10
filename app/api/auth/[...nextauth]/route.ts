import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, plan: user.plan }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name ?? undefined },
          create: {
            email: user.email,
            name: user.name || "Usuário",
            plan: "FREE",
            trialEndsAt,
          },
        })
        user.id = dbUser.id
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plan = (user as any).plan
      }
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, planExpiresAt: true, trialEndsAt: true, clinicId: true },
        })
        if (dbUser) {
          const now = new Date()

          const planExpired =
            dbUser.plan !== "FREE" &&
            dbUser.planExpiresAt != null &&
            dbUser.planExpiresAt < now

          const trialExpired =
            dbUser.plan === "FREE" &&
            dbUser.trialEndsAt != null &&
            dbUser.trialEndsAt < now

          token.plan = planExpired ? "FREE" : dbUser.plan
          token.trialEndsAt = dbUser.trialEndsAt?.toISOString() ?? null
          token.trialExpired = trialExpired
          token.clinicId = dbUser.clinicId ?? null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).plan = token.plan
        ;(session.user as any).trialEndsAt = token.trialEndsAt
        ;(session.user as any).trialExpired = token.trialExpired
        ;(session.user as any).clinicId = token.clinicId
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
