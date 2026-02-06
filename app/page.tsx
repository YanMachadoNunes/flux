import Link from "next/link";
import { prisma } from "@/app/lib/prisma"; // Mantendo sua importação original
import styles from "./home.module.css";

export default async function DashboardPage() {
  // Definindo o intervalo de "Hoje"
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // BUSCANDO TUDO NO BANCO (Agora incluindo as Transações)
  const [patientCount, appointmentsToday, nextAppointment, incomeTransactions] =
    await Promise.all([
      // 1. Total de Pacientes
      prisma.patient.count(),

      // 2. Consultas Hoje
      prisma.appointment.count({
        where: {
          dateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      // 3. A Próxima Consulta
      prisma.appointment.findFirst({
        where: {
          dateTime: {
            gte: new Date(),
          },
          status: { not: "canceled" },
        },
        orderBy: { dateTime: "asc" },
        include: { patient: true },
      }),

      // 4. (NOVO) Buscar Transações de Entrada (INCOME)
      prisma.transaction.findMany({
        where: {
          type: "INCOME",
        },
      }),
    ]);

  // --- LÓGICA FINANCEIRA ---
  // Somar os valores
  const totalRevenue = incomeTransactions.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );

  // Formatar para Real (R$ 500,00)
  const formattedRevenue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalRevenue);
  // -------------------------

  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? "Bom dia" : hours < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{greeting}, Doutor.</h1>
          <p className={styles.subtitle}>
            Como iremos começar o dia hoje?
          </p>
        </div>
        <div className={styles.dateBadge}>
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total de Pacientes</span>
          <strong className={styles.statValue}>{patientCount}</strong>
          <Link href="/patients" className={styles.statLink}>
            Ver lista &rarr;
          </Link>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Agenda Hoje</span>
          <strong className={styles.statValue}>{appointmentsToday}</strong>
          <span className={styles.statSub}>consultas agendadas</span>
        </div>

        {/* CARD FATURAMENTO ATUALIZADO */}
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Faturamento (Total)</span>

          {/* Aqui entra o valor formatado */}
          <strong className={styles.statValue} style={{ color: "#16a34a" }}>
            {formattedRevenue}
          </strong>

          <span className={styles.statSub}>Acumulado</span>
        </div>
      </div>

      <section className={styles.highlightSection}>
        <h2 className={styles.sectionTitle}>Próximo Atendimento</h2>

        {nextAppointment ? (
          <div className={styles.nextCard}>
            <div className={styles.nextTime}>
              {nextAppointment.dateTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className={styles.nextInfo}>
              <h3 className={styles.nextName}>
                {nextAppointment.patient.name}
              </h3>
              <p className={styles.nextType}>Consulta</p>
              {nextAppointment.notes && (
                <p className={styles.nextNotes}>📝 {nextAppointment.notes}</p>
              )}
            </div>
            <div className={styles.nextActions}>
              <Link href={`/agenda`} className={styles.actionBtn}>
                Ver na Agenda
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum atendimento próximo. Hora de um café? ☕</p>
            <Link href="/agenda/new" className={styles.createBtn}>
              + Agendar Agora
            </Link>
          </div>
        )}
      </section>

      <div className={styles.shortcuts}>
        <Link href="/patients/new" className={styles.shortcutCard}>
          <span className={styles.icon}>👤</span> Novo Paciente
        </Link>
        <Link href="/agenda/new" className={styles.shortcutCard}>
          <span className={styles.icon}>📅</span> Agendar
        </Link>
        <Link href="/procedures" className={styles.shortcutCard}>
          <span className={styles.icon}>📋</span> Procedimentos
        </Link>
      </div>
    </div>
  );
}
