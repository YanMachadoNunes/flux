import { prisma } from "@/app/lib/prisma"
import { getClinicId } from "@/app/lib/clinic"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import styles from "./detail.module.css"

const STATUS_LABEL: Record<string, string> = {
  AGENDADO:   "Agendado",
  FINALIZADO: "Finalizado",
  CANCELADO:  "Cancelado",
  FALTOU:     "Faltou",
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  AGENDADO:   <Clock size={13} />,
  FINALIZADO: <CheckCircle size={13} />,
  CANCELADO:  <XCircle size={13} />,
  FALTOU:     <AlertCircle size={13} />,
}

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const clinicId = await getClinicId()

  const patient = await prisma.patient.findFirst({
    where: { id: params.id, clinicId },
    include: {
      appointments: {
        orderBy: { dateTime: "desc" },
        include: { procedure: true },
      },
    },
  })

  if (!patient) notFound()

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

  const totalAppointments = patient.appointments.length
  const finalized = patient.appointments.filter((a) => a.status === "FINALIZADO")
  const totalSpent = finalized.reduce((acc, a) => acc + Number(a.finalPrice ?? 0), 0)
  const lastVisit = finalized[0]?.dateTime ?? null

  const age = patient.birthDate
    ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/patients" className={styles.back}>
          <ArrowLeft size={16} /> Pacientes
        </Link>
        <h1 className={styles.title}>Prontuário</h1>
      </header>

      {/* DADOS DO PACIENTE */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>{patient.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className={styles.patientName}>{patient.name}</h2>
            {age !== null && <span className={styles.age}>{age} anos</span>}
          </div>
        </div>

        <div className={styles.infoGrid}>
          {patient.phone && (
            <div className={styles.infoItem}>
              <Phone size={14} className={styles.infoIcon} />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className={styles.infoItem}>
              <Mail size={14} className={styles.infoIcon} />
              <span>{patient.email}</span>
            </div>
          )}
          {patient.cpf && (
            <div className={styles.infoItem}>
              <FileText size={14} className={styles.infoIcon} />
              <span>{patient.cpf}</span>
            </div>
          )}
          {patient.birthDate && (
            <div className={styles.infoItem}>
              <Calendar size={14} className={styles.infoIcon} />
              <span>{new Date(patient.birthDate).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
        </div>
      </section>

      {/* KPIs */}
      <div className={styles.kpiRow}>
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>{totalAppointments}</span>
          <span className={styles.kpiLabel}>Consultas</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>{finalized.length}</span>
          <span className={styles.kpiLabel}>Realizadas</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>{fmt(totalSpent)}</span>
          <span className={styles.kpiLabel}>Total gasto</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiValue}>
            {lastVisit ? lastVisit.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—"}
          </span>
          <span className={styles.kpiLabel}>Última visita</span>
        </div>
      </div>

      {/* HISTÓRICO */}
      <section className={styles.historyCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Histórico de Consultas</h3>
          <Link href={`/agenda/new?patientId=${patient.id}`} className={styles.newBtn}>
            + Agendar
          </Link>
        </div>

        {patient.appointments.length === 0 ? (
          <div className={styles.empty}>
            <Calendar size={32} style={{ opacity: 0.12 }} />
            <p>Nenhuma consulta registrada</p>
          </div>
        ) : (
          <div className={styles.timeline}>
            {patient.appointments.map((appt) => (
              <div key={appt.id} className={styles.timelineItem}>
                <div className={styles.timelineDot} data-status={appt.status} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTop}>
                    <span className={styles.timelineDate}>
                      {appt.dateTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      {" · "}
                      {appt.dateTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={styles.statusBadge} data-status={appt.status}>
                      {STATUS_ICON[appt.status]}
                      {STATUS_LABEL[appt.status] ?? appt.status}
                    </span>
                  </div>
                  {appt.procedure && (
                    <span className={styles.procedureName}>{appt.procedure.name}</span>
                  )}
                  {appt.notes && (
                    <p className={styles.notes}>{appt.notes}</p>
                  )}
                  {appt.finalPrice && (
                    <span className={styles.price}>{fmt(Number(appt.finalPrice))}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
