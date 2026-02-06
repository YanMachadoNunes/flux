import Link from "next/link";
import { prisma } from "@/app/lib/prisma"; // Importando o banco
import styles from "./agenda.module.css";

export default async function AgendaPage() {
  // 1. Buscando dados REAIS do banco
  // Pegamos apenas os agendamentos de hoje, ordenados por hora
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      dateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      dateTime: "asc", // Do mais cedo para o mais tarde
    },
    include: {
      patient: true, // Precisamos do nome do paciente
    },
  });

  // Formatando a data para o título (ex: "Quinta-feira, 05 de Fevereiro")
  const todayFormatted = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={styles.container}>
      {/* Cabeçalho da Agenda */}
      <header className={styles.header}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {/* --- AQUI ESTÁ A CORREÇÃO: O BOTÃO VOLTAR --- */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#8b1e1e",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            &larr; Voltar ao Dashboard
          </Link>

          <div>
            <h1 className={styles.title}>Agenda do Dia</h1>
            <p className={styles.subtitle}>{todayFormatted}</p>
          </div>
        </div>

        <Link href="/agenda/new" className={styles.newAppointmentBtn}>
          + Agendar
        </Link>
      </header>

      {/* Linha do Tempo */}
      <div className={styles.timeline}>
        {appointments.length > 0 ? (
          appointments.map((apt) => (
            <div key={apt.id} className={styles.timeSlot}>
              {/* Coluna da Hora */}
              <div className={styles.timeColumn}>
                <span className={styles.time}>
                  {/* Formatando a hora (ex: 14:30) */}
                  {apt.dateTime.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Card do Agendamento */}
              <div className={`${styles.card} ${styles[apt.status]}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.patientName}>{apt.patient.name}</span>
                  <span
                    className={`${styles.statusBadge} ${styles[apt.status + "Badge"]}`}
                  >
                    {translateStatus(apt.status)}
                  </span>
                </div>
                <p className={styles.appointmentType}>{apt.type}</p>

                <div className={styles.actions}>
                  {/* Futuramente faremos a página de detalhes */}
                  <button className={styles.actionBtn}>Ver Detalhes</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Caso não tenha nada hoje */
          <div className={styles.emptySlot} style={{ marginTop: "2rem" }}>
            <p>Nenhum agendamento para hoje. A agenda está livre! 🍃</p>
          </div>
        )}

        {/* Slot Visual de "Livre" (Opcional, só visual) */}
        <div className={styles.timeSlot}>
          <div className={styles.timeColumn}>
            <span className={styles.time}>--:--</span>
          </div>
          <div className={styles.emptySlot}>
            <span>Horários Livres</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar simples para traduzir
function translateStatus(status: string) {
  const map: Record<string, string> = {
    confirmed: "Confirmado",
    pending: "Pendente",
    finished: "Finalizado",
    canceled: "Cancelado",
  };
  return map[status] || status;
}
