import { createPatient } from "@/app/lib/actions";
import Link from "next/link";
import styles from "./patients.module.css";

export default function NewPatientPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cadastrar Paciente</h1>
        <Link href="/patients" className={styles.secondaryButton}>
          Voltar
        </Link>
      </header>

      <form action={createPatient} className={styles.formCard}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome Completo</label>
          <input
            name="name"
            type="text"
            placeholder="Ex: Maria Souza"
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Telefone / WhatsApp</label>
            <input name="phone" type="text" placeholder="(11) 99999-9999" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="cpf">CPF</label>
            <input name="cpf" type="text" placeholder="000.000.000-00" />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input name="email" type="email" placeholder="paciente@email.com" />
        </div>

        <button type="submit" className={styles.primaryButton}>
          Salvar no Flux
        </button>
      </form>
    </div>
  );
}
