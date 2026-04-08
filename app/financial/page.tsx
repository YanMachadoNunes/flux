import { prisma } from "@/app/lib/prisma";
import { createTransaction } from "@/app/lib/actions";
import { CashFlowChart } from "./CashFlowChart";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import styles from "./financial.module.css";

export default async function FinancialPage() {
  const records = await prisma.financialRecord.findMany({
    orderBy: { dueDate: "desc" },
    take: 60,
  });

  const totalIncome = records
    .filter((r) => r.type === "INCOME")
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const totalExpense = records
    .filter((r) => r.type === "EXPENSE")
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const balance = totalIncome - totalExpense;

  // Agrupa por mês para o gráfico
  const monthMap = new Map<string, { income: number; expense: number }>();
  [...records].reverse().forEach((r) => {
    const key = r.dueDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const cur = monthMap.get(key) ?? { income: 0, expense: 0 };
    if (r.type === "INCOME") cur.income += Number(r.amount);
    else cur.expense += Number(r.amount);
    monthMap.set(key, cur);
  });

  const chartData = Array.from(monthMap.entries()).map(([month, v]) => ({
    month,
    ...v,
  }));

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Financeiro</h1>
          <p className={styles.subtitle}>Fluxo de caixa e controle de receitas</p>
        </div>
      </header>

      {/* KPI */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} style={{ "--kpi-color": "var(--success)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Receitas</span>
            <div className={`${styles.kpiIcon} ${styles.green}`}><TrendingUp size={16} /></div>
          </div>
          <span className={styles.kpiValue}>{fmt(totalIncome)}</span>
        </div>

        <div className={styles.kpiCard} style={{ "--kpi-color": "var(--error)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Despesas</span>
            <div className={`${styles.kpiIcon} ${styles.red}`}><TrendingDown size={16} /></div>
          </div>
          <span className={styles.kpiValue}>{fmt(totalExpense)}</span>
        </div>

        <div
          className={styles.kpiCard}
          style={{ "--kpi-color": balance >= 0 ? "var(--success)" : "var(--error)" } as React.CSSProperties}
        >
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Saldo Líquido</span>
            <div className={`${styles.kpiIcon} ${balance >= 0 ? styles.green : styles.red}`}>
              <Wallet size={16} />
            </div>
          </div>
          <span className={styles.kpiValue} style={{ color: balance >= 0 ? "var(--success)" : "var(--error)" }}>
            {fmt(balance)}
          </span>
        </div>
      </div>

      {/* MAIN GRID: gráfico + formulário */}
      <div className={styles.mainGrid}>
        {/* GRÁFICO */}
        <section className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Evolução por Período</span>
            <span className={styles.cardSub}>{chartData.length} períodos</span>
          </div>
          <CashFlowChart data={chartData} />
        </section>

        {/* FORMULÁRIO NOVA TRANSAÇÃO */}
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Nova Transação</span>
            <div className={styles.formIcon}><Plus size={14} /></div>
          </div>
          <form action={createTransaction} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Descrição</label>
              <input type="text" name="description" placeholder="Ex: Consulta Dr. Ana" required />
            </div>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Valor (R$)</label>
                <input type="number" name="amount" placeholder="0,00" step="0.01" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Data</label>
                <input type="date" name="date" defaultValue={today} required />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Tipo</label>
              <div className={styles.typeButtons}>
                <label className={styles.typeOption}>
                  <input type="radio" name="type" value="INCOME" defaultChecked />
                  <span className={styles.typeLabel} data-type="income">
                    <ArrowUpRight size={14} /> Entrada
                  </span>
                </label>
                <label className={styles.typeOption}>
                  <input type="radio" name="type" value="EXPENSE" />
                  <span className={styles.typeLabel} data-type="expense">
                    <ArrowDownRight size={14} /> Saída
                  </span>
                </label>
              </div>
            </div>
            <button type="submit" className={styles.submitBtn}>
              Registrar
            </button>
          </form>
        </section>
      </div>

      {/* TABELA DE TRANSAÇÕES */}
      <section className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Transações Recentes</span>
          <span className={styles.cardSub}>{records.length} registros</span>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Data</th>
                <th style={{ textAlign: "right" }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.empty}>
                    Nenhuma transação registrada ainda.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className={styles.row}>
                    <td className={styles.descCell}>{rec.description}</td>
                    <td>
                      <span className={`${styles.typeBadge} ${rec.type === "INCOME" ? styles.income : styles.expense}`}>
                        {rec.type === "INCOME" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {rec.type === "INCOME" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {rec.dueDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className={`${styles.amountCell} ${rec.type === "INCOME" ? styles.amountIncome : styles.amountExpense}`}>
                      {rec.type === "INCOME" ? "+" : "−"}{fmt(Number(rec.amount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
