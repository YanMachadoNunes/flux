"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Check, Zap, Crown } from "lucide-react"
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
      "Dashboard financeiro",
      "Controle de procedimentos",
      "Agenda com calendário",
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
      "Pacientes ilimitados",
      "Agendamentos ilimitados",
      "Tudo do plano Starter",
      "Relatórios avançados",
      "Exportação de dados",
      "Multi-usuários",
      "Suporte prioritário",
    ],
  },
]

export default function PlansPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [error, setError] = useState("")

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

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Escolha seu plano</h1>
        <p className={styles.subtitle}>
          7 dias grátis · Cancele quando quiser · Sem fidelidade
        </p>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.card} ${plan.featured ? styles.featured : ""}`}
            style={{ "--plan-color": plan.color } as React.CSSProperties}
          >
            {plan.featured && (
              <div className={styles.badge}>Mais popular</div>
            )}

            <div
              className={styles.icon}
              style={{ background: plan.color + "22", color: plan.color }}
            >
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
              className={styles.cta}
              style={{ background: plan.color }}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
            >
              {loading === plan.id ? "Aguarde…" : "Assinar agora"}
            </button>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.note}>
        Após clicar em "Assinar agora" você será redirecionado para o checkout do Asaas para concluir o pagamento.
        O acesso ao sistema é liberado imediatamente após a confirmação.
      </p>
    </div>
  )
}
