"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Plus,
  Search,
  Edit2,
  Eye,
  X,
  Clock,
  DollarSign,
} from "lucide-react";
import styles from "./procedures.module.css";

interface Procedure {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  duration: number | null;
}

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/procedures")
      .then((r) => r.json())
      .then((data) => setProcedures(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const filtered = procedures.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const avgPrice =
    procedures.length > 0
      ? procedures.reduce((a, c) => a + Number(c.basePrice), 0) / procedures.length
      : 0;

  return (
    <main className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>Procedimentos</h1>
          <p>Gerencie os serviços oferecidos pela clínica</p>
        </div>
        <Link href="/procedures/new" className={styles.addButton}>
          <Plus size={17} />
          Novo Procedimento
        </Link>
      </header>

      {/* KPI */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} style={{ "--kpi-color": "var(--accent-primary)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total de Serviços</span>
            <div className={`${styles.kpiIcon} ${styles.wine}`}><Stethoscope size={16} /></div>
          </div>
          <span className={styles.kpiValue}>{procedures.length}</span>
        </div>

        <div className={styles.kpiCard} style={{ "--kpi-color": "var(--success)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Preço Médio</span>
            <div className={`${styles.kpiIcon} ${styles.green}`}><DollarSign size={16} /></div>
          </div>
          <span className={styles.kpiValue}>{fmt(avgPrice)}</span>
        </div>

        <div className={styles.kpiCard} style={{ "--kpi-color": "var(--info)" } as React.CSSProperties}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Duração Média</span>
            <div className={`${styles.kpiIcon} ${styles.blue}`}><Clock size={16} /></div>
          </div>
          <span className={styles.kpiValue}>
            {procedures.length > 0
              ? Math.round(
                  procedures.filter((p) => p.duration).reduce((a, c) => a + (c.duration ?? 0), 0) /
                    procedures.filter((p) => p.duration).length || 0
                ) + " min"
              : "—"}
          </span>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className={styles.tableContainer}>
        {/* TOOLBAR */}
        <div className={styles.tableToolbar}>
          <span className={styles.resultCount}>
            {filtered.length} procedimento{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar procedimento..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Procedimento</th>
                <th>Duração</th>
                <th>Preço</th>
                <th>Descrição</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    <Stethoscope size={38} style={{ opacity: 0.12, display: "block", margin: "0 auto 0.75rem" }} />
                    <p>{search ? "Nenhum resultado para a busca" : "Nenhum procedimento cadastrado"}</p>
                    {!search && (
                      <Link href="/procedures/new" className={styles.emptyBtn}>
                        <Plus size={14} /> Adicionar procedimento
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((proc) => (
                  <tr key={proc.id} className={styles.row}>
                    <td className={styles.procName}>{proc.name}</td>
                    <td>
                      {proc.duration ? (
                        <span className={styles.badge}>
                          <Clock size={11} /> {proc.duration} min
                        </span>
                      ) : (
                        <span className={styles.noData}>—</span>
                      )}
                    </td>
                    <td className={styles.priceCell}>{fmt(Number(proc.basePrice))}</td>
                    <td className={styles.descCell}>
                      {proc.description || <span className={styles.noData}>—</span>}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/procedures/${proc.id}`}
                          className={styles.actionBtn}
                          title="Ver detalhes"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/procedures/${proc.id}/edit`}
                          className={styles.actionBtn}
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
