"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getClinicId } from "../lib/clinic";

const PatientSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cpf: z
    .string()
    .optional()
    .transform((val) => val?.replace(/\D/g, "") || undefined)
    .refine((val) => !val || val.length === 11, "CPF deve ter 11 dígitos"),
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
  duration: z.coerce.number().int().positive(),
  description: z.string().optional(),
});

const Transaction = z.object({
  description: z.string(),
  type: z.string(),
  date: z.string(),
  amount: z.string(),
});

export async function createPatient(formData: FormData): Promise<void> {
  const clinicId = await getClinicId();
  const rawData = Object.fromEntries(formData.entries());
  const validated = PatientSchema.safeParse(rawData);

  if (!validated.success) redirect("/patients/new");

  const { email, ...rest } = validated.data;
  await prisma.patient.create({
    data: { ...rest, email: email || null, clinicId },
  });

  revalidatePath("/patients");
  redirect("/patients");
}

export async function createAppointment(formData: FormData): Promise<void> {
  const clinicId = await getClinicId();
  const rawData = Object.fromEntries(formData.entries());
  const validated = AppointmentSchema.safeParse(rawData);

  if (!validated.success) redirect("/agenda/new");

  const { date, time, type, ...rest } = validated.data;
  const combinedDateTime = new Date(`${date}T${time}:00`);

  await prisma.appointment.create({
    data: {
      ...rest,
      dateTime: combinedDateTime,
      status: "AGENDADO",
      notes: rest.notes ? `[${type}] ${rest.notes}` : type,
      clinicId,
    },
  });

  revalidatePath("/agenda");
  redirect("/agenda");
}

export async function createProcedure(formData: FormData): Promise<void> {
  const clinicId = await getClinicId();
  const rawData = Object.fromEntries(formData.entries());
  const validated = ProcedureSchema.safeParse(rawData);

  if (!validated.success) redirect("/procedures/new");

  const { price, ...rest } = validated.data;
  await prisma.procedure.create({
    data: { ...rest, basePrice: price, clinicId },
  });

  revalidatePath("/procedures");
  redirect("/procedures");
}

export async function updateProcedure(id: string, formData: FormData): Promise<void> {
  const clinicId = await getClinicId();
  const rawData = Object.fromEntries(formData.entries());
  const validated = ProcedureSchema.safeParse(rawData);

  if (!validated.success) redirect(`/procedures/${id}/edit`);

  const { price, ...rest } = validated.data;
  await prisma.procedure.update({
    where: { id, clinicId }, // garante que o procedimento é desta clínica
    data: { ...rest, basePrice: price },
  });

  revalidatePath("/procedures");
  redirect(`/procedures/${id}`);
}

export async function createTransaction(formData: FormData): Promise<void> {
  const clinicId = await getClinicId();
  const rawData = Object.fromEntries(formData.entries());
  const validated = Transaction.safeParse(rawData);

  if (!validated.success) redirect("/financial");

  await prisma.financialRecord.create({
    data: {
      description: validated.data.description,
      type: validated.data.type,
      dueDate: new Date(validated.data.date),
      amount: Number(validated.data.amount.replace(",", ".")),
      status: "PAID",
      clinicId,
    },
  });

  revalidatePath("/financial");
  redirect("/financial");
}
