-- CreateTable Clinic
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- Add clinicId to User
ALTER TABLE "User" ADD COLUMN "clinicId" TEXT;

-- Create a default clinic for existing data
INSERT INTO "Clinic" ("id", "name", "createdAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Clínica Padrão', NOW());

-- Assign all existing users to the default clinic
UPDATE "User" SET "clinicId" = '00000000-0000-0000-0000-000000000001';

-- Add clinicId to Patient (with default)
ALTER TABLE "Patient" ADD COLUMN "clinicId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

-- Drop old CPF unique, add compound unique
ALTER TABLE "Patient" DROP CONSTRAINT IF EXISTS "Patient_cpf_key";
CREATE UNIQUE INDEX "Patient_clinicId_cpf_key" ON "Patient"("clinicId", "cpf") WHERE "cpf" IS NOT NULL;

-- Add clinicId to Procedure
ALTER TABLE "Procedure" ADD COLUMN "clinicId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

-- Add clinicId to Appointment
ALTER TABLE "Appointment" ADD COLUMN "clinicId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

-- Add clinicId to FinancialRecord
ALTER TABLE "FinancialRecord" ADD COLUMN "clinicId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

-- Add clinicId to Transaction
ALTER TABLE "Transaction" ADD COLUMN "clinicId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

-- Remove defaults (now that existing rows are backfilled)
ALTER TABLE "Patient" ALTER COLUMN "clinicId" DROP DEFAULT;
ALTER TABLE "Procedure" ALTER COLUMN "clinicId" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "clinicId" DROP DEFAULT;
ALTER TABLE "FinancialRecord" ALTER COLUMN "clinicId" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "clinicId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
