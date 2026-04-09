import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getClinicId } from "@/app/lib/clinic";
import {
  Users,
  Calendar,
  TrendingUp,
  Stethoscope,
  Plus,
  ArrowRight,
  Clock,
  DollarSign,
  UserPlus,
} from "lucide-react";
import { RevenueChart } from "./components/RevenueChart";
import styles from "./home.module.css";

export default async function DashboardPage() {
  const clinicId = await getClinicId();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    patientCount,
    procedureCount,
    appointmentsToday,
    financialRecords,
    recentAppointments,
    recentPatients,
  ] = await Promise.all([
    prisma.patient.count({ where: { clinicId } }),
    prisma.procedure.count({ where: { clinicId } }),
    prisma.appointment.count({
      where: { clinicId, dateTime: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.financialRecord.findMany({
      where: { clinicId, type: "INCOME" },
      orderBy: { dueDate: "asc" },
    }),
    prisma.appointment.findMany({
      where: { clinicId, dateTime: { gte: startOfDay, lte: endOfDay } },
      orderBy: { dateTime: "asc" },
      include: { patient: true },
      take: 6,
    }),
    prisma.patient.findMany({
      where: { clinicId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Agrupa receitas por mês (últimos 6 meses)
  const monthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    monthMap.set(key, 0);
  }
  financialRecords.forEach((r) => {
    const key = r.dueDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + Number(r.amount));
  });
  const monthlyRevenue = Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue }));

  const totalRevenue = financialRecords.reduce((a, r) => a + Number(r.amount), 0);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const hours = new Date().getHours();
  const greeting = hours < 12 ? "Bom dia" : hours < 18 ? "Boa tarde" : "Boa noite";

  const statusColor: Record<string, string> = {
    AGENDADO:   "var(--info)",
    FINALIZADO: "var(--success)",
    CANCELADO:  "var(--error)",
    FALTOU:     "#f59e0b",
  };

  const avatarColors = ["#8b1e1e","#4a0e0e","#6e1b1b","#c44444","#d66666"];
  const avatarBg = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <main className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{greeting}, Doutor.</h1>
          <p>Aqui está o resumo da clínica</p>
        </div>
        <span className={styles.dateBadge}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </header>

      {/* KPI GRID */}
      <div className={styles.kpiGrid}>
        <Link href="/patients" className={styles.kpiCard} style={{ "--kpi-color": "var(--accent-secondary)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Pacientes</span>
            <div className={`${styles.kpiIcon} ${styles.wine}`}><Users size={17} /></div>
          </div>
          <span className={styles.kpiValue}>{patientCount}</span>
        </Link>

        <Link href="/agenda" className={styles.kpiCard} style={{ "--kpi-color": "var(--info)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Consultas Hoje</span>
            <div className={`${styles.kpiIcon} ${styles.blue}`}><Calendar size={17} /></div>
          </div>
          <span className={styles.kpiValue}>{appointmentsToday}</span>
        </Link>

        <Link href="/procedures" className={styles.kpiCard} style={{ "--kpi-color": "var(--accent-primary)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Procedimentos</span>
            <div className={`${styles.kpiIcon} ${styles.wine}`}><Stethoscope size={17} /></div>
          </div>
          <span className={styles.kpiValue}>{procedureCount}</span>
        </Link>

        <Link href="/financial" className={styles.kpiCard} style={{ "--kpi-color": "var(--success)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Faturamento</span>
            <div className={`${styles.kpiIcon} ${styles.green}`}><TrendingUp size={17} /></div>
          </div>
          <span className={styles.kpiValue} style={{ fontSize: "1.5rem" }}>{fmt(totalRevenue)}</span>
        </Link>
      </div>

      {/* MAIN GRID: gráfico + ações rápidas */}
      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><TrendingUp size={14} /> Receita Mensal</span>
            <Link href="/financial" className={styles.viewAll}>Ver financeiro <ArrowRight size={13} /></Link>
          </div>
          <div className={styles.chartContainer}>
            <RevenueChart data={monthlyRevenue} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><Clock size={14} /> Ações Rápidas</span>
          </div>
          <div className={styles.quickActions}>
            <Link href="/agenda/new" className={`${styles.actionBtn} ${styles.actionWine}`}>
              <div className={styles.actionIcon}><Calendar size={18} /></div>
              <span>Agendar</span>
            </Link>
            <Link href="/patients/new" className={`${styles.actionBtn} ${styles.actionBlue}`}>
              <div className={styles.actionIcon}><UserPlus size={18} /></div>
              <span>Novo Paciente</span>
            </Link>
            <Link href="/procedures/new" className={`${styles.actionBtn} ${styles.actionPurple}`}>
              <div className={styles.actionIcon}><Stethoscope size={18} /></div>
              <span>Procedimento</span>
            </Link>
            <Link href="/financial" className={`${styles.actionBtn} ${styles.actionGreen}`}>
              <div className={styles.actionIcon}><DollarSign size={18} /></div>
              <span>Financeiro</span>
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID: agendamentos + pacientes recentes */}
      <div className={styles.bottomGrid}>
        {/* AGENDA HOJE */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><Calendar size={14} /> Agenda de Hoje</span>
            <Link href="/agenda/new" className={styles.viewAll}>
              <Plus size={13} /> Novo <ArrowRight size={13} />
            </Link>
          </div>
          <div className={styles.cardBody}>
            {recentAppointments.length === 0 ? (
              <div className={styles.emptyState}>
                <Calendar size={32} style={{ opacity: 0.12 }} />
                <p>Nenhuma consulta hoje</p>
              </div>
            ) : (
              recentAppointments.map((appt) => (
                <div key={appt.id} className={styles.listItem}>
                  <div className={styles.itemLeft}>
                    <div className={styles.itemAvatar} style={{ background: avatarBg(appt.patient.name) }}>
                      {appt.patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{appt.patient.name}</h4>
                      <p>{appt.dateTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <span
                    className={styles.statusPill}
                    style={{
                      color: statusColor[appt.status] ?? "var(--text-muted)",
                      background: `color-mix(in srgb, ${statusColor[appt.status] ?? "var(--text-muted)"} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${statusColor[appt.status] ?? "var(--text-muted)"} 25%, transparent)`,
                    }}
                  >
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PACIENTES RECENTES */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><Users size={14} /> Pacientes Recentes</span>
            <Link href="/patients" className={styles.viewAll}>Ver todos <ArrowRight size={13} /></Link>
          </div>
          <div className={styles.cardBody}>
            {recentPatients.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={32} style={{ opacity: 0.12 }} />
                <p>Nenhum paciente cadastrado</p>
              </div>
            ) : (
              recentPatients.map((p) => (
                <div key={p.id} className={styles.listItem}>
                  <div className={styles.itemLeft}>
                    <div className={styles.itemAvatar} style={{ background: avatarBg(p.name) }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{p.name}</h4>
                      <p>{p.phone ?? p.email ?? "Sem contato"}</p>
                    </div>
                  </div>
                  <Link href={`/patients`} className={styles.itemLink}>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
