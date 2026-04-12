import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("admin123", 10)

  const clinic = await prisma.clinic.upsert({
    where: { id: "admin-clinic-001" },
    update: {},
    create: { id: "admin-clinic-001", name: "Clínica Admin" },
  })

  const user = await prisma.user.upsert({
    where: { email: "admin123@hotmail.com" },
    update: { password: hash, plan: "PRO", clinicId: clinic.id },
    create: {
      email: "admin123@hotmail.com",
      name: "Admin",
      password: hash,
      plan: "PRO",
      trialUsed: false,
      clinicId: clinic.id,
    },
  })
  console.log("Admin criado:", user.id, user.email, "→ clínica:", clinic.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
