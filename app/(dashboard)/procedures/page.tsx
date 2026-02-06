import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import styles from "./procedures.module.css";

export default async function ProceduresPage() {
  const procedures = await prisma.procedure.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Procedimentos</h1>
        <Link href="/procedures/new" className={styles.newBtn}>
          + Novo Serviço
        </Link>
      </header>

      <div className={styles.grid}>
        {procedures.map((proc) => (
          <div key={proc.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.procName}>{proc.name}</h2>
              <span className={styles.price}>
                {/* Formata para R$ */}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(proc.price))}
              </span>
            </div>

            <div className={styles.meta}>
              <span className={styles.duration}>⏱ {proc.durationMin} min</span>
            </div>

            <p className={styles.description}>
              {proc.description || "Sem descrição definida."}
            </p>
          </div>
        ))}

        {/* Card vazio para incentivar cadastro se não tiver nada */}
        {procedures.length === 0 && (
          <div className={styles.emptyState}>
            <p>Nenhum procedimento cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
