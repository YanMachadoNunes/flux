import { prisma } from "@/app/lib/prisma";
import { getClinicId } from "@/app/lib/clinic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit2, Clock, DollarSign, FileText, Calendar } from "lucide-react";
import styles from "./detail.module.css";

export default async function ProcedureDetailPage({ params }: { params: { id: string } }) {
  const clinicId = await getClinicId();
  const proc = await prisma.procedure.findUnique({
    where: { id: params.id, clinicId },
    include: {
      appointments: {
        where: { clinicId },
        include: { patient: true },
        orderBy: { dateTime: "desc" },
        take: 5,
      },
    },
  });

  if (!proc) notFound();

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <main className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <Link href="/procedures" className={styles.backBtn}>
          <ArrowLeft size={16} /> Procedimentos
        </Link>
        <Link href={`/procedures/${proc.id}/edit`} className={styles.editBtn}>
          <Edit2 size={15} /> Editar
        </Link>
      </header>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <FileText size={28} />
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.title}>{proc.name}</h1>
          <p className={styles.description}>{proc.description || "Sem descrição cadastrada."}</p>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }}>
            <DollarSign size={18} />
          </div>
          <div>
            <span className={styles.statLabel}>Preço Base</span>
            <strong className={styles.statValue}>{fmt(Number(proc.basePrice))}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "color-mix(in srgb, var(--info) 12%, transparent)", color: "var(--info)" }}>
            <Clock size={18} />
          </div>
          <div>
            <span className={styles.statLabel}>Duração</span>
            <strong className={styles.statValue}>{proc.duration ? `${proc.duration} min` : "—"}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)", color: "var(--accent-primary)" }}>
            <Calendar size={18} />
          </div>
          <div>
            <span className={styles.statLabel}>Agendamentos</span>
            <strong className={styles.statValue}>{proc.appointments.length}</strong>
          </div>
        </div>
      </div>

      {/* RECENT APPOINTMENTS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Últimos Agendamentos</h2>
        <div className={styles.card}>
          {proc.appointments.length === 0 ? (
            <p className={styles.empty}>Nenhum agendamento ainda para este procedimento.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {proc.appointments.map((a) => (
                  <tr key={a.id}>
                    <td className={styles.patientName}>{a.patient.name}</td>
                    <td className={styles.dateCell}>
                      {a.dateTime.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[a.status.toLowerCase()] ?? ""}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
