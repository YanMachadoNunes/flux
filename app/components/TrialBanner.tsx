"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Clock, X } from "lucide-react"
import { useState } from "react"
import styles from "./trialBanner.module.css"

function daysLeft(trialEndsAt: string): number {
  const end = new Date(trialEndsAt)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function TrialBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)

  const user = session?.user as any
  const plan: string = user?.plan ?? "FREE"
  const trialEndsAt: string | null = user?.trialEndsAt ?? null

  // Só mostra para plano FREE com trial ativo
  if (plan !== "FREE" || !trialEndsAt || dismissed) return null

  const remaining = daysLeft(trialEndsAt)
  if (remaining <= 0) return null

  const urgent = remaining <= 2

  return (
    <div className={`${styles.banner} ${urgent ? styles.urgent : ""}`}>
      <div className={styles.inner}>
        <Clock size={14} className={styles.icon} />
        <span className={styles.text}>
          {remaining === 1
            ? "Último dia do seu período de teste."
            : `${remaining} dias restantes no seu período de teste.`}
        </span>
        <Link href="/plans" className={styles.cta}>
          Assinar agora
        </Link>
      </div>
      <button
        className={styles.close}
        onClick={() => setDismissed(true)}
        aria-label="Fechar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
