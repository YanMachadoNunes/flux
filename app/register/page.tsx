"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "../login/auth.module.css"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Erro ao criar conta.")
      setLoading(false)
      return
    }

    // Auto login
    await signIn("credentials", { email, password, redirect: false })
    router.replace("/plans")
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Flux</span>
          <span className={styles.brandSub}>Gestão de Clínica</span>
        </div>

        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.subtitle}>7 dias grátis · sem cartão de crédito</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Criando conta…" : "Criar conta grátis"}
          </button>
        </form>

        <p className={styles.footer}>
          Já tem conta?{" "}
          <Link href="/login" className={styles.link}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
