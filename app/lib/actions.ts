'"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// Importamos o tipo de erro do Prisma para o TypeScript entender
import { Prisma } from "@prisma/client";
import { z } from "zod";

const PatientSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
});
const AppointmentSchema = z.object({
  patientId: z.string().uuid(),
  date: z.string(),
  time: z.string(),
  type: z.string(),
  notes: z.string().optional(),
});
const ProcedureSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  price: z.preprocess(
    (val) => Number(String(val).replace(",", ".")),
    z.number().positive(),
  ),
  durationMin: z.coerce.number().int().positive(),
  description: z.string().optional(),
});
const Transaction = z.object({
  description: z.string(),
  type: z.string(),
  dateStr: z.string(),
  amountStr: z.string(),
});

export async function createPatient(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = PatientSchema.safeParse(rawData);

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await prisma.patient.create({ data: validated.data });
  } catch (e) {
    return { message: "Erro ao persistir no banco." };
  }

  revalidatePath("/patients");
  redirect("/patients");
}

export async function createAppointment(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = AppointmentSchema.safeParse(rawData);

  if (!validated.success) return { error: "Dados inválidos" };

  const { date, time, ...rest } = validated.data;
  const combinedDateTime = new Date(`${date}T${time}:00`);

  try {
    await prisma.appointment.create({
      data: { ...rest, date: combinedDateTime, status: "pending" },
    });
  } catch (e) {
    return { error: "Falha no agendamento" };
  }

  revalidatePath("/agenda");
  redirect("/agenda");
}
export async function createProcedure(formData: FormData) {
  // 1. Pegamos todos os dados de uma vez
  const rawData = Object.fromEntries(formData.entries());

  // 2. Passamos pelo "filtro" do Zod
  const validated = ProcedureSchema.safeParse(rawData);

  // 3. Se falhar, retornamos os erros
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  // 4. Se passar, usamos validated.data (que já tem os números convertidos!)
  try {
    await prisma.procedure.create({
      data: validated.data, // O Zod já limpou tudo aqui
    });
  } catch (error) {
    return { error: "Erro no banco de dados." };
  }

  revalidatePath("/procedures");
  redirect("/procedures");
}

export async function createTransaction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  // Note: Use o nome correto do schema (TransactionSchema)
  const validated = TransactionSchema.safeParse(rawData);

  if (!validated.success) return { error: "Preencha tudo corretamente." };

  try {
    await prisma.financialRecord.create({
      data: {
        description: validated.data.description,
        type: validated.data.type,
        dueDate: new Date(validated.data.dateStr),
        // Aqui usamos o tratamento de string para número
        amount: Number(validated.data.amountStr.replace(",", ".")),
        status: "PAID",
      },
    });
  } catch (error) {
    return { error: "Erro ao salvar financeiro." };
  }

  revalidatePath("/financial");
}'
