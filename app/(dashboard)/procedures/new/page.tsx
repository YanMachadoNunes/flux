import Link from "next/link";
import { createProcedure } from "@/app/lib/actions";
import styles from "../procedures.module.css"; // Reutiliza o estilo

export default function NewProcedurePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Novo Procedimento</h1>
        <Link href="/procedures" className={styles.secondaryBtn}>
          Voltar
        </Link>
      </header>

      <form action={createProcedure} className={styles.formCard}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome do Procedimento</label>
          <input
            name="name"
            type="text"
            placeholder="Ex: Limpeza Dental Completa"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="price">Preço (R$)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              placeholder="0,00"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="duration">Duração (minutos)</label>
            <input
              name="duration"
              type="number"
              placeholder="Ex: 60"
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="description">Descrição (Opcional)</label>
          <textarea
            name="description"
            rows={3}
            className={styles.textarea}
            placeholder="Detalhes do serviço..."
          />
        </div>

        <button type="submit" className={styles.primaryBtn}>
          Salvar Serviço
        </button>
      </form>
    </div>
  );
}
