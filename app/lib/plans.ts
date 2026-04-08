export type PlanType = "FREE" | "STARTER" | "PRO"
export type PaidPlanType = "STARTER" | "PRO"

export interface Plan {
  id: PlanType
  name: string
  description: string
  price: number
  features: string[]
  color: string
  limits: {
    patients: number | "unlimited"
    appointments: number | "unlimited"
  }
}

export const PLANS: Record<PlanType, Plan> = {
  FREE: {
    id: "FREE",
    name: "Trial",
    description: "Período de avaliação",
    price: 0,
    color: "#6b7280",
    limits: { patients: 20, appointments: 50 },
    features: [],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    description: "Para clínicas em crescimento",
    price: 97,
    color: "#8b1e1e",
    limits: { patients: 500, appointments: "unlimited" },
    features: [
      "Até 500 pacientes",
      "Agendamentos ilimitados",
      "Prontuário básico",
      "Dashboard financeiro",
      "Controle de procedimentos",
      "Suporte por e-mail",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "Para clínicas consolidadas",
    price: 197,
    color: "#c44444",
    limits: { patients: "unlimited", appointments: "unlimited" },
    features: [
      "Pacientes ilimitados",
      "Agendamentos ilimitados",
      "Prontuário completo",
      "Relatórios avançados",
      "Exportação de dados",
      "Multi-usuários",
      "Suporte prioritário",
    ],
  },
}

export const PLAN_ORDER: PaidPlanType[] = ["STARTER", "PRO"]
