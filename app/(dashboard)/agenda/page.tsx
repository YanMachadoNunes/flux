import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { AgendaCalendar } from "./AgendaCalendar";
import styles from "./agenda.module.css";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

const statusColor: Record<string, string> = {
  AGENDADO:   "var(--info)",
  FINALIZADO: "var(--success)",
  CANCELADO:  "var(--error)",
  FALTOU:     "#f59e0b",
};

const statusLabel: Record<string, string> = {
  AGENDADO:   "Agendado",
  FINALIZADO: "Finalizado",
  CANCELADO:  "Cancelado",
  FALTOU:     "Faltou",
};

function fmt2(n: number) {
  return String(n).padStart(2, "0");
}

export default async function AgendaPage({ searchParams }: Props) {
  const params = await searchParams;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${fmt2(today.getMonth() + 1)}-${fmt2(today.getDate())}`;
  const selectedDate = params.date ?? todayStr;

  const [year, month, day] = selectedDate.split("-").map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay   = new Date(year, month - 1, day, 23, 59, 59, 999);

  // First and last day of the selected month (for calendar dots)
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth   = new Date(year, month, 0, 23, 59, 59, 999);

  const [appointments, monthAppointments] = await Promise.all([
    prisma.appointment.findMany({
      where: { dateTime: { gte: startOfDay, lte: endOfDay } },
      orderBy: { dateTime: "asc" },
      include: { patient: true, procedure: true },
    }),
    prisma.appointment.findMany({
      where: { dateTime: { gte: startOfMonth, lte: endOfMonth } },
      select: { dateTime: true },
    }),
  ]);

  // Unique "YYYY-MM-DD" strings for the month
  const activeDates = [
    ...new Set(
      monthAppointments.map((a) => {
        const d = a.dateTime;
        return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;
      })
    ),
  ];

  const selectedLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Agenda</h1>
          <p className={styles.pageSubtitle} style={{ textTransform: "capitalize" }}>
            {selectedLabel}
          </p>
        </div>
        <Link href="/agenda/new" className={styles.newBtn}>
          <Plus size={16} /> Agendar
        </Link>
      </header>

      {/* Split layout */}
      <div className={styles.pageLayout}>
        {/* Left: calendar */}
        <aside>
          <AgendaCalendar activeDates={activeDates} selectedDate={selectedDate} />
        </aside>

        {/* Right: appointment list */}
        <section className={styles.apptSection}>
          <div className={styles.apptHeader}>
            <span className={styles.apptCount}>
              {appointments.length} consulta{appointments.length !== 1 ? "s" : ""}
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={40} style={{ opacity: 0.1 }} />
              <p>Nenhuma consulta neste dia</p>
              <Link href="/agenda/new" className={styles.emptyLink}>
                + Agendar consulta
              </Link>
            </div>
          ) : (
            <div className={styles.apptList}>
              {appointments.map((appt) => (
                <div key={appt.id} className={styles.apptCard}>
                  <div
                    className={styles.apptAccent}
                    style={{ background: statusColor[appt.status] ?? "var(--border-color)" }}
                  />
                  <div className={styles.apptBody}>
                    <div className={styles.apptTop}>
                      <span className={styles.apptPatient}>{appt.patient.name}</span>
                      <span
                        className={styles.apptBadge}
                        style={{
                          color: statusColor[appt.status] ?? "var(--text-muted)",
                          background: `color-mix(in srgb, ${statusColor[appt.status] ?? "var(--text-muted)"} 10%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${statusColor[appt.status] ?? "var(--text-muted)"} 25%, transparent)`,
                        }}
                      >
                        {statusLabel[appt.status] ?? appt.status}
                      </span>
                    </div>

                    <div className={styles.apptMeta}>
                      <span className={styles.apptMetaItem}>
                        <Clock size={12} />
                        {appt.dateTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {appt.procedure && (
                        <span className={styles.apptMetaItem}>
                          <User size={12} />
                          {appt.procedure.name}
                        </span>
                      )}
                    </div>

                    {appt.notes && (
                      <p className={styles.apptNotes}>{appt.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
