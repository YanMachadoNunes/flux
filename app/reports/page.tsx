import { prisma } from "@/app/lib/prisma"
import { getClinicId } from "@/app/lib/clinic"
import { Users, Calendar, TrendingUp, Stethoscope, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import styles from "./reports.module.css"

function delta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export default async function ReportsPage() {
  const clinicId = await getClinicId()

  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    patientsThisMonth,
    patientsLastMonth,
    apptsThisMonth,
    apptsLastMonth,
    incomeThisMonth,
    incomeLastMonth,
    topProcedures,
    recentAppointments,
  ] = await Promise.all([
    prisma.patient.count({ where: { clinicId, createdAt: { gte: startThisMonth } } }),
    prisma.patient.count({ where: { clinicId, createdAt: { gte: startLastMonth, lte: endLastMonth } } }),

    prisma.appointment.count({ where: { clinicId, dateTime: { gte: startThisMonth } } }),
    prisma.appointment.count({ where: { clinicId, dateTime: { gte: startLastMonth, lte: endLastMonth } } }),

    prisma.financialRecord.aggregate({
      where: { clinicId, type: "INCOME", dueDate: { gte: startThisMonth } },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { clinicId, type: "INCOME", dueDate: { gte: startLastMonth, lte: endLastMonth } },
      _sum: { amount: true },
    }),

    prisma.appointment.groupBy({
      by: ["procedureId"],
      where: { clinicId, procedureId: { not: null }, status: "FINALIZADO" },
      _count: { procedureId: true },
      orderBy: { _count: { procedureId: "desc" } },
      take: 5,
    }),

    prisma.appointment.findMany({
      where: { clinicId },
      orderBy: { dateTime: "desc" },
      take: 8,
      include: { patient: true, procedure: true },
    }),
  ])

  // Busca nomes dos procedimentos mais realizados
  const procedureIds = topProcedures.map((p) => p.procedureId!).filter(Boolean)
  const procedures = await prisma.procedure.findMany({
    where: { id: { in: procedureIds } },
    select: { id: true, name: true },
  })
  const procMap = Object.fromEntries(procedures.map((p) => [p.id, p.name]))

  const revenueThis = Number(incomeThisMonth._sum.amount ?? 0)
  const revenueLast = Number(incomeLastMonth._sum.amount ?? 0)

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

  const monthName = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const kpis = [
    {
      label: "Novos pacientes",
      value: patientsThisMonth,
      prev: patientsLastMonth,
      icon: Users,
      color: "var(--accent-secondary)",
    },
    {
      label: "Consultas",
      value: apptsThisMonth,
      prev: apptsLastMonth,
      icon: Calendar,
      color: "var(--info)",
    },
    {
      label: "Receita",
      value: fmt(revenueThis),
      prev: revenueLast,
      rawCurrent: revenueThis,
      icon: TrendingUp,
      color: "var(--success)",
    },
  ]

  const statusColor: Record<string, string> = {
    AGENDADO:   "var(--info)",
    FINALIZADO: "var(--success)",
    CANCELADO:  "var(--error)",
    FALTOU:     "#f59e0b",
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Relatório</h1>
          <p className={styles.subtitle}>Resumo de {monthName}</p>
        </div>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const d = delta(kpi.rawCurrent ?? (kpi.value as number), kpi.prev)
          const up = d > 0
          const neutral = d === 0

          return (
            <div key={kpi.label} className={styles.kpiCard} style={{ "--kpi-color": kpi.color } as React.CSSProperties}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <div className={styles.kpiIcon}><Icon size={16} /></div>
              </div>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <div className={`${styles.kpiDelta} ${neutral ? styles.neutral : up ? styles.up : styles.down}`}>
                {neutral ? <Minus size={12} /> : up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {neutral ? "igual ao mês anterior" : `${Math.abs(d)}% vs mês anterior`}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.grid}>
        {/* PROCEDIMENTOS MAIS REALIZADOS */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><Stethoscope size={14} /> Top procedimentos</span>
          </div>
          {topProcedures.length === 0 ? (
            <p className={styles.empty}>Nenhum procedimento finalizado ainda.</p>
          ) : (
            <div className={styles.procList}>
              {topProcedures.map((p, i) => {
                const name = procMap[p.procedureId!] ?? "Procedimento"
                const count = p._count.procedureId
                const max = topProcedures[0]._count.procedureId
                return (
                  <div key={p.procedureId} className={styles.procItem}>
                    <span className={styles.procRank}>#{i + 1}</span>
                    <div className={styles.procInfo}>
                      <div className={styles.procRow}>
                        <span className={styles.procName}>{name}</span>
                        <span className={styles.procCount}>{count}x</span>
                      </div>
                      <div className={styles.procBar}>
                        <div className={styles.procBarFill} style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* CONSULTAS RECENTES */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><Calendar size={14} /> Consultas recentes</span>
          </div>
          {recentAppointments.length === 0 ? (
            <p className={styles.empty}>Nenhuma consulta registrada.</p>
          ) : (
            <div className={styles.apptList}>
              {recentAppointments.map((a) => (
                <div key={a.id} className={styles.apptItem}>
                  <div className={styles.apptDot} style={{ background: statusColor[a.status] ?? "var(--border-color)" }} />
                  <div className={styles.apptInfo}>
                    <span className={styles.apptPatient}>{a.patient.name}</span>
                    {a.procedure && <span className={styles.apptProc}>{a.procedure.name}</span>}
                  </div>
                  <span className={styles.apptDate}>
                    {a.dateTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
