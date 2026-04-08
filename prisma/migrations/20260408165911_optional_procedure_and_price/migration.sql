-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_procedureId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "procedureId" DROP NOT NULL,
ALTER COLUMN "finalPrice" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
