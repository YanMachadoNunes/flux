import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateProcedure } from "@/app/lib/actions";
import styles from "../../new/form.module.css";

export default async function EditProcedurePage({ params }: { params: { id: string } }) {
  const proc = await prisma.procedure.findUnique({ where: { id: params.id } });
  if (!proc) notFound();

  const action = updateProcedure.bind(null, proc.id);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <Link href={`/procedures/${proc.id}`} className={styles.backLink}>
            <ArrowLeft size={16} /> Voltar ao detalhe
          </Link>
          <h1 className={styles.title}>Editar Procedimento</h1>
        </div>
      </header>

      <form action={action} className={styles.formCard}>
        <div className={styles.inputGroup}>
          <label>Nome do Procedimento</label>
          <input name="name" type="text" defaultValue={proc.name} required />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Preço (R$)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={Number(proc.basePrice)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Duração (minutos)</label>
            <input
              name="duration"
              type="number"
              defaultValue={proc.duration ?? ""}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Descrição (Opcional)</label>
          <textarea name="description" rows={3} defaultValue={proc.description ?? ""} />
        </div>

        <div className={styles.formActions}>
          <Link href={`/procedures/${proc.id}`} className={styles.cancelBtn}>
            Cancelar
          </Link>
          <button type="submit" className={styles.primaryButton}>
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
