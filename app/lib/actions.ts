"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// Importamos o tipo de erro do Prisma para o TypeScript entender
import { Prisma } from "@prisma/client";

export async function createPatient(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const cpf = formData.get("cpf") as string;

  if (!name) return { error: "O nome é obrigatório." };

  try {
    await prisma.patient.create({
      data: { name, phone, email, cpf },
    });
  } catch (error) {
    // AQUI ESTÁ A MÁGICA DA UNICIDADE
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 é o código de erro para "Unique constraint failed"
      if (error.code === "P2002") {
        console.error("Erro: E-mail ou CPF já cadastrado.");
        // Em um mundo ideal, retornamos isso para a tela exibir um alerta
        return { error: "Este paciente já existe no sistema." };
      }
    }

    console.error("Erro genérico:", error);
    return { error: "Erro ao salvar no banco." };
  }

  revalidatePath("/patients");
  redirect("/patients");
}

// ... imports anteriores (zod, prisma, revalidatePath, redirect)

// Action de Agendamento
export async function createAppointment(formData: FormData) {
  const patientId = formData.get("patientId") as string;
  const dateStr = formData.get("date") as string; // Vem como "2024-02-05"
  const timeStr = formData.get("time") as string; // Vem como "14:30"
  const type = formData.get("type") as string;
  const notes = formData.get("notes") as string;

  // Validação simples
  if (!patientId || !dateStr || !timeStr) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  // Combinar Data e Hora em um objeto ISO-8601 DateTime
  // Criamos uma string "2024-02-05T14:30:00"
  const combinedDateTime = new Date(`${dateStr}T${timeStr}:00`);

  try {
    await prisma.appointment.create({
      data: {
        patientId,
        date: combinedDateTime,
        type,
        notes,
        status: "pending", // Padrão
      },
    });
  } catch (error) {
    console.error("Erro ao agendar:", error);
    return { error: "Erro ao criar agendamento." };
  }

  revalidatePath("/agenda");
  redirect("/agenda");
}
// Adicione isso no final do seu actions.ts

export async function createProcedure(formData: FormData) {
  const name = formData.get("name") as string;
  const priceStr = formData.get("price") as string;
  const durationStr = formData.get("duration") as string;
  const description = formData.get("description") as string;

  if (!name || !priceStr || !durationStr) {
    return { error: "Campos obrigatórios faltando." };
  }

  try {
    await prisma.procedure.create({
      data: {
        name,
        // Converte "150.00" para 150.00 (Decimal)
        price: Number(priceStr.replace(",", ".")),
        // Converte "60" para 60 (Int)
        durationMin: Number(durationStr),
        description,
      },
    });
  } catch (error) {
    console.error("Erro ao criar procedimento:", error);
    return { error: "Erro no banco de dados." };
  }

  revalidatePath("/procedures");
  redirect("/procedures");
}

// ... imports anteriores
// Adicione no topo se não tiver:
// import { revalidatePath } from "next/cache";

export async function createTransaction(formData: FormData) {
  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const type = formData.get("type") as string; // "INCOME" ou "EXPENSE"
  const dateStr = formData.get("date") as string;

  if (!description || !amountStr || !dateStr) {
    return { error: "Preencha tudo." };
  }

  try {
    await prisma.financialRecord.create({
      data: {
        description,
        amount: Number(amountStr.replace(",", ".")), // Trata R$
        type,
        dueDate: new Date(dateStr),
        status: "PAID", // Vamos assumir pago por enquanto
      },
    });
  } catch (error) {
    console.error("Erro financeiro:", error);
    return { error: "Erro ao salvar." };
  }

  revalidatePath("/financial");
  // Não precisa redirect, pode ficar na mesma página ou voltar
}
