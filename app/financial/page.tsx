import { prisma } from "@/app/lib/prisma";
import { createTransaction } from "@/app/lib/actions";
import { CashFlowChart } from "./CashFlowChart"; // Importe o gráfico
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import styles from "./financial.module.css";

export default async function FinancialPage() {
  // 1. Buscar transações
  const records = await prisma.financialRecord.findMany({
    orderBy: { dueDate: "desc" },
    take: 50, // Pegar as últimas 50 para o histórico
  });

  // 2. Calcular KPIs (Indicadores)
  const totalIncome = records
    .filter((r) => r.type === "INCOME")
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const totalExpense = records
    .filter((r) => r.type === "EXPENSE")
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const balance = totalIncome - totalExpense;

  // 3. Preparar dados para o gráfico (Agrupar por mês/dia seria o ideal, aqui faremos simples)
  // Revertemos o array para o gráfico ficar cronológico (Esquerda -> Direita)
  const chartData = [...records].reverse().map((r) => ({
    date: r.dueDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    income: r.type === "INCOME" ? Number(r.amount) : 0,
    expense: r.type === "EXPENSE" ? Number(r.amount) : 0,
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Fluxo de Caixa</h1>
        <div className={styles.actions}>
          {/* Formulário Rápido de Adicionar (Inline) */}
          <form action={createTransaction} className={styles.quickAddForm}>
            <input
              type="text"
              name="description"
              placeholder="Descrição"
              required
              className={styles.input}
            />
            <input
              type="number"
              name="amount"
              placeholder="Valor"
              step="0.01"
              required
              className={styles.inputSmall}
            />
            <input
              type="date"
              name="date"
              required
              className={styles.inputSmall}
            />
            <select name="type" className={styles.select}>
              <option value="INCOME">Entrada (+)</option>
              <option value="EXPENSE">Saída (-)</option>
            </select>
            <button type="submit" className={styles.addBtn}>
              + Adicionar
            </button>
          </form>
        </div>
      </header>

      {/* KPIs - Os Cards do Topo */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.iconBox} ${styles.greenIcon}`}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span className={styles.kpiLabel}>Receitas</span>
            <h3 className={styles.kpiValue} style={{ color: "#10b981" }}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalIncome)}
            </h3>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.iconBox} ${styles.redIcon}`}>
            <TrendingDown size={24} />
          </div>
          <div>
            <span className={styles.kpiLabel}>Despesas</span>
            <h3 className={styles.kpiValue} style={{ color: "#ef4444" }}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalExpense)}
            </h3>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.iconBox} ${styles.blueIcon}`}>
            <Wallet size={24} />
          </div>
          <div>
            <span className={styles.kpiLabel}>Saldo Líquido</span>
            <h3
              className={styles.kpiValue}
              style={{ color: balance >= 0 ? "#1f2937" : "#ef4444" }}
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(balance)}
            </h3>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* O Gráfico */}
        <section className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Evolução Financeira</h2>
          <div className={styles.chartContainer}>
            <CashFlowChart data={chartData} />
          </div>
        </section>

        {/* Lista de Recentes */}
        <section className={styles.listSection}>
          <h2 className={styles.sectionTitle}>Transações Recentes</h2>
          <div className={styles.transactionList}>
            {records.length === 0 && (
              <p className={styles.empty}>Nenhuma transação ainda.</p>
            )}

            {records.map((rec) => (
              <div key={rec.id} className={styles.transactionItem}>
                <div className={styles.transInfo}>
                  <strong className={styles.transDesc}>
                    {rec.description}
                  </strong>
                  <span className={styles.transDate}>
                    {rec.dueDate.toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <span
                  className={`${styles.transAmount} ${rec.type === "INCOME" ? styles.plus : styles.minus}`}
                >
                  {rec.type === "INCOME" ? "+" : "-"}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(rec.amount))}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
