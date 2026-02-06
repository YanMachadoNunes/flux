import { prisma } from "../../../lib/prisma";
import { createAppointment } from "../../../lib/actions";
import Link from "next/link";
import styles from "../agenda.module.css"; // Reutilizando o estilo base

export default async function NewAppointmentPage() {
  // Busca pacientes para preencher o dropdown
  const patients = await prisma.patient.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Novo Agendamento</h1>
        <Link href="/agenda" className={styles.secondaryButton}>
          Cancelar
        </Link>
      </header>

      <form action={createAppointment} className={styles.formCard}>
        {/* Seleção de Paciente */}
        <div className={styles.inputGroup}>
          <label htmlFor="patientId">Paciente</label>
          <select name="patientId" required className={styles.selectInput}>
            <option value="">Selecione um paciente...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (CPF: {p.cpf || "N/A"})
              </option>
            ))}
          </select>
        </div>

        {/* Data e Hora */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="date">Data</label>
            <input type="date" name="date" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="time">Hora</label>
            <input type="time" name="time" required />
          </div>
        </div>

        {/* Tipo e Status */}
        <div className={styles.inputGroup}>
          <label htmlFor="type">Tipo de Consulta</label>
          <select name="type" className={styles.selectInput}>
            <option value="Primeira Consulta">Primeira Consulta</option>
            <option value="Retorno">Retorno</option>
            <option value="Exame">Exame</option>
            <option value="Cirurgia">Cirurgia</option>
          </select>
        </div>

        {/* Notas */}
        <div className={styles.inputGroup}>
          <label htmlFor="notes">Observações Iniciais</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Queixa principal ou detalhes..."
            className={styles.textarea}
          />
        </div>

        <button type="submit" className={styles.primaryButton}>
          Agendar Horário
        </button>
      </form>
    </div>
  );
}
