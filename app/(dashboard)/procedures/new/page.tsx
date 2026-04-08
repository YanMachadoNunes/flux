import Link from "next/link";
import { createProcedure } from "@/app/lib/actions";
import { ArrowLeft } from "lucide-react";
import styles from "./form.module.css";

export default function NewProcedurePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/procedures" className={styles.backLink}>
          <ArrowLeft size={16} /> Procedimentos
        </Link>
        <h1 className={styles.title}>Novo Procedimento</h1>
      </header>

      <form action={createProcedure} className={styles.formCard}>
        <div className={styles.inputGroup}>
          <label>Nome do Procedimento</label>
          <input name="name" type="text" placeholder="Ex: Limpeza Dental Completa" required />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Preço (R$)</label>
            <input name="price" type="number" step="0.01" placeholder="0,00" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Duração (minutos)</label>
            <input name="duration" type="number" placeholder="Ex: 60" />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Descrição (Opcional)</label>
          <textarea name="description" rows={3} placeholder="Detalhes do serviço..." />
        </div>

        <div className={styles.formActions}>
          <Link href="/procedures" className={styles.cancelBtn}>Cancelar</Link>
          <button type="submit" className={styles.primaryButton}>Salvar Serviço</button>
        </div>
      </form>
    </div>
  );
}
