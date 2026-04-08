"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

export function CashFlowChart({ data }: { data: ChartData[] }) {
  return (
    <div style={{ width: "100%", height: 280, padding: "1.25rem 1rem 1rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#059669" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border-color)"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            tickFormatter={(v) =>
              v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
            }
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: "10px 14px",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              boxShadow: "0 8px 24px var(--shadow-color-strong)",
            }}
            formatter={(value: number | undefined, name: string | undefined) => [
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(value ?? 0),
              name === "income" ? "Entradas" : "Saídas",
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#059669"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradIncome)"
            name="income"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#dc2626"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradExpense)"
            name="expense"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
