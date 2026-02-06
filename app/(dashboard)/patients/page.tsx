import Link from "next/link";
import { prisma } from "@/app/lib/prisma"; // Conectando ao banco
import styles from "./patients.module.css";

export default async function PatientsPage() {
  // BUSCANDO DADOS REAIS DO BANCO
  const patients = await prisma.patient.findMany({
    orderBy: {
      name: "asc", // Ordenar por nome (A-Z)
    },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Botão de Voltar (Consistência de Navegação) */}
          <Link href="/" className={styles.backLink}>
            &larr; Voltar ao Dashboard
          </Link>

          <h1 className={styles.title}>Meus Pacientes</h1>
        </div>

        <Link href="/patients/new" className={styles.newPatientBtn}>
          + Novo Paciente
        </Link>
      </header>

      <div className={styles.tableContainer}>
        {patients.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>E-mail</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className={styles.tableRow}>
                  <td className={styles.patientName}>{patient.name}</td>
                  {/* Usamos '|| "-"' para caso o campo esteja vazio no banco */}
                  <td>{patient.phone || "-"}</td>
                  <td>{patient.email || "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/patients/${patient.id}`}
                      className={styles.viewLink}
                    >
                      Ver Ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Estado Vazio (Se não tiver ninguém no banco) */
          <div className={styles.emptyState}>
            <p>Nenhum paciente cadastrado ainda.</p>
            <p>
              Clique em "+ Novo Paciente" para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
