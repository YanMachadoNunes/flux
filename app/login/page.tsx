"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./auth.module.css"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError("E-mail ou senha incorretos.")
    } else {
      router.replace("/")
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Flux</span>
          <span className={styles.brandSub}>Gestão de Clínica</span>
        </div>

        <h1 className={styles.title}>Entrar</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className={styles.footer}>
          Não tem conta?{" "}
          <Link href="/register" className={styles.link}>
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}
