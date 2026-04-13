"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Stethoscope } from "lucide-react"
import styles from "./onboarding.module.css"

export default function OnboardingPage() {
  const router = useRouter()
  const [clinicName, setClinicName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicName }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Erro ao criar clínica.")
      setLoading(false)
      return
    }

    router.replace("/")
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <Stethoscope size={28} />
        </div>

        <h1 className={styles.title}>Bem-vindo ao Flux</h1>
        <p className={styles.subtitle}>Antes de começar, como se chama sua clínica?</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nome da clínica</label>
            <input
              type="text"
              className={styles.input}
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Ex: Clínica São Lucas"
              required
              autoFocus
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Criando…" : "Entrar no Flux"}
          </button>
        </form>
      </div>
    </div>
  )
}
