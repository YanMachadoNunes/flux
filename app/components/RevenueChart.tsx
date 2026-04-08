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

interface Props {
  data: { month: string; revenue: number }[];
}

export function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--accent-primary)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          dy={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
          width={52}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "8px 14px",
            fontSize: "0.82rem",
            color: "var(--text-primary)",
            boxShadow: "0 8px 24px var(--shadow-color-strong)",
          }}
          formatter={(v: number | undefined) => [
            new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0),
            "Receita",
          ]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--accent-primary)"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#dashGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
