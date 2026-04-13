"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Check, Zap, Crown, AlertTriangle, ArrowLeft, Shield,
  RefreshCw, Clock, LogOut,
} from "lucide-react"
import styles from "./plans.module.css"

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    desc: "Para clínicas em crescimento",
    price: 97,
    color: "#8b1e1e",
    icon: <Zap size={22} />,
    features: [
      "Até 500 pacientes",
      "Agendamentos ilimitados",
      "Prontuário completo",
      "Dashboard financeiro",
      "Controle de procedimentos",
      "Relatório mensal",
      "Suporte por e-mail",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    desc: "Para clínicas consolidadas",
    price: 197,
    color: "#c44444",
    icon: <Crown size={22} />,
    featured: true,
    features: [
      "Tudo do Starter",
      "Pacientes ilimitados",
      "Relatórios avançados",
      "Exportação de dados",
      "Multi-usuários",
      "Suporte prioritário",
    ],
  },
]

const COMPARISON = [
  ["Agenda com calendário",         true,  true],
  ["Cadastro de pacientes",         true,  true],
  ["Prontuário completo",           true,  true],
  ["Controle de procedimentos",     true,  true],
  ["Dashboard financeiro",          true,  true],
  ["Relatório mensal",              true,  true],
  ["Até 500 pacientes",             true,  false],
  ["Pacientes ilimitados",          false, true],
  ["Relatórios avançados",          false, true],
  ["Exportação de dados",           false, true],
  ["Multi-usuários",                false, true],
  ["Suporte prioritário",           false, true],
]

function PlansContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isExpired = searchParams.get("expired") === "1"
  const [loading, setLoading] = useState<string | null>(null)
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [error, setError] = useState("")

  const currentPlan = (session?.user as any)?.plan ?? "FREE"

  async function handleSubscribe(planId: string) {
    if (!(session?.user as any)?.id) {
      router.push("/login")
      return
    }

    setLoading(planId)
    setError("")

    const res = await fetch("/api/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, cpfCnpj: cpfCnpj || undefined }),
    })

    const data = await res.json()
    setLoading(null)

    if (!res.ok) {
      setError(data.error || "Erro ao iniciar assinatura.")
      return
    }

    if (data.paymentUrl) window.location.href = data.paymentUrl
  }

  return (
    <div className={styles.page}>
      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroNav}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut size={14} /> Sair
          </button>
        </div>

        {isExpired && (
          <div className={styles.expiredAlert}>
            <AlertTriangle size={16} />
            <span>Seu período de teste encerrou. Assine um plano para continuar usando o Flux.</span>
          </div>
        )}

        <div className={styles.heroContent}>
          <div className={styles.trialPill}>
            <Clock size={13} />
            7 dias grátis · sem cartão de crédito
          </div>
          <h1 className={styles.title}>
            {isExpired ? "Seu trial expirou" : "Escolha seu plano"}
          </h1>
          <p className={styles.subtitle}>
            {isExpired
              ? "Escolha um plano para continuar com acesso completo ao Flux."
              : "Agenda, prontuário e financeiro em um só lugar. Cancele quando quiser."}
          </p>
        </div>
      </div>

      {/* CARDS */}
      <div className={styles.grid}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id

          return (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.featured ? styles.featured : ""} ${isCurrent ? styles.current : ""}`}
              style={{ "--plan-color": plan.color } as React.CSSProperties}
            >
              {plan.featured && !isCurrent && <div className={styles.badge}>Mais popular</div>}
              {isCurrent && <div className={styles.badgeCurrent}>Plano atual</div>}

              <div className={styles.icon} style={{ background: plan.color + "22", color: plan.color }}>
                {plan.icon}
              </div>

              <h2 className={styles.planName}>{plan.name}</h2>
              <p className={styles.planDesc}>{plan.desc}</p>

              <div className={styles.priceRow}>
                <span className={styles.price}>R$ {plan.price}</span>
                <span className={styles.per}>/mês</span>
              </div>

              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <Check size={14} strokeWidth={3} style={{ color: plan.color, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className={styles.cpfWrap}>
                <input
                  type="text"
                  className={styles.cpfInput}
                  placeholder="CPF ou CNPJ (opcional)"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                />
              </div>

              <button
                className={`${styles.cta} ${isCurrent ? styles.ctaCurrent : ""}`}
                style={!isCurrent ? { background: plan.color } : undefined}
                onClick={() => !isCurrent && handleSubscribe(plan.id)}
                disabled={loading === plan.id || isCurrent}
              >
                {isCurrent ? "Plano atual" : loading === plan.id ? "Aguarde…" : "Assinar agora"}
              </button>
            </div>
          )
        })}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* TRUST */}
      <div className={styles.trustRow}>
        <div className={styles.trustItem}><Shield size={15} /> Pagamento 100% seguro</div>
        <div className={styles.trustItem}><RefreshCw size={15} /> Cancele quando quiser</div>
        <div className={styles.trustItem}><Clock size={15} /> 7 dias grátis sem cobrança</div>
      </div>

      {/* TABELA COMPARATIVA */}
      <div className={styles.tableSection}>
        <h2 className={styles.tableTitle}>Compare os planos</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thFeature}>Recurso</th>
                <th style={{ color: "#8b1e1e" }}>Starter</th>
                <th className={styles.thFeatured}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([label, starter, pro]) => (
                <tr key={label as string}>
                  <td className={styles.tdFeature}>{label as string}</td>
                  <td className={styles.tdCenter}>
                    {starter ? <Check size={16} color="#8b1e1e" strokeWidth={3} /> : <span className={styles.tdX}>—</span>}
                  </td>
                  <td className={`${styles.tdCenter} ${styles.tdFeatured}`}>
                    {pro ? <Check size={16} color="#c44444" strokeWidth={3} /> : <span className={styles.tdX}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className={styles.note}>
        Após clicar em "Assinar agora" você será redirecionado para o checkout do Asaas.
        O acesso é liberado imediatamente após a confirmação do pagamento.
      </p>
    </div>
  )
}

export default function PlansPage() {
  return (
    <Suspense fallback={null}>
      <PlansContent />
    </Suspense>
  )
}
