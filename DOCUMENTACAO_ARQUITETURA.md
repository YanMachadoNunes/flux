# DOCUMENTAÇÃO DO PROJETO FLUX - ARQUITETURA COMPLETA

## 1. ESTRUTURA DE PASTAS

```
app/
├── (dashboard)/              # Grupo de rotas do dashboard
│   ├── patients/
│   │   ├── page.tsx         # Lista de pacientes
│   │   ├── patients.module.css
│   │   └── new/
│   │       ├── page.tsx     # Formulário novo paciente
│   │       └── patients.module.css
│   ├── procedures/
│   │   ├── page.tsx         # Lista de procedimentos
│   │   ├── procedures.module.css
│   │   └── new/
│   │       └── page.tsx     # Formulário novo procedimento
│   └── agenda/
│       ├── page.tsx         # Visualização da agenda
│       ├── agenda.module.css
│       └── new/
│           └── page.tsx     # Formulário novo agendamento
├── components/
│   ├── Shell.tsx            # Layout principal com sidebar
│   ├── Sidebar.tsx          # Menu lateral navegação
│   └── sidebar.module.css
├── context/
│   ├── ThemeContext.tsx     # Gerenciamento de tema light/dark
│   └── SidebarContext.tsx   # Controle de colapso da sidebar
├── financial/
│   ├── page.tsx             # Dashboard financeiro
│   ├── financial.module.css
│   └── CashFlowChart.tsx    # Gráfico de fluxo de caixa
├── lib/
│   ├── actions.ts           # Server Actions (CRUD)
│   └── prisma.ts            # Configuração do Prisma
├── settings/
│   ├── page.tsx             # Página de configurações
│   └── settings.module.css
├── globals.css              # Estilos globais e variáveis CSS
├── layout.tsx               # Root layout da aplicação
├── home.module.css          # Estilos da página inicial
└── page.tsx                 # Dashboard inicial

prisma/
└── schema.prisma            # Schema do banco de dados

public/                      # Assets estáticos
```

---

## 2. CONTEXTO DE TEMA (ThemeContext.tsx)

**Local:** `app/context/ThemeContext.tsx`

**Funcionalidade:** Gerencia o tema light/dark da aplicação

**API:**
```typescript
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// Hook para usar o tema
const { theme, toggleTheme } = useTheme();
```

**Como funciona:**
- Salva preferência no localStorage
- Aplica atributo `data-theme` no HTML
- Detecta preferência do sistema automaticamente

**Uso:**
```tsx
<button onClick={toggleTheme}>
  {theme === "light" ? "🌙" : "☀️"}
</button>
```

---

## 3. VARIÁVEIS CSS (globals.css)

**Local:** `app/globals.css`

**Tema Light:**
```css
:root {
  --bg-primary: #f9f5f2;      /* Fundo creme */
  --bg-secondary: #f4efeb;    /* Fundo secundário */
  --bg-card: #ffffff;         /* Cards */
  --bg-hover: #fffaf7;        /* Hover */
  
  --text-primary: #2d1a1a;    /* Texto principal */
  --text-secondary: #634d4d;  /* Texto secundário */
  --text-muted: #8c7b7b;      /* Texto apagado */
  
  --border-color: #e5dada;    /* Bordas */
  --border-light: #f4efeb;    /* Bordas leves */
  
  --accent-primary: #4a0e0e;  /* Vinho principal */
  --accent-secondary: #8b1e1e;/* Vinho destaque */
  --accent-hover: #6e1b1b;    /* Vinho hover */
  
  --success: #059669;         /* Verde sucesso */
  --success-bg: #d1fae5;      /* Fundo sucesso */
  --error: #dc2626;           /* Vermelho erro */
  --error-bg: #fee2e2;        /* Fundo erro */
  --info: #2563eb;            /* Azul info */
  --info-bg: #dbeafe;         /* Fundo info */
  
  --shadow-color: rgba(74, 14, 14, 0.05);
  --shadow-color-strong: rgba(74, 14, 14, 0.1);
}
```

**Tema Dark:**
```css
[data-theme="dark"] {
  --bg-primary: #1a1212;
  --bg-secondary: #251a1a;
  --bg-card: #2d2020;
  --bg-hover: #3d2a2a;
  
  --text-primary: #f4efeb;
  --text-secondary: #c9b8b8;
  --text-muted: #9c8a8a;
  
  --border-color: #3d2a2a;
  --border-light: #251a1a;
  
  --accent-primary: #c44444;
  --accent-secondary: #d66666;
  --accent-hover: #e88888;
  
  --success: #34d399;
  --success-bg: #064e3b;
  --error: #f87171;
  --error-bg: #7f1d1d;
  --info: #60a5fa;
  --info-bg: #1e3a8a;
  
  --shadow-color: rgba(0, 0, 0, 0.3);
  --shadow-color-strong: rgba(0, 0, 0, 0.5);
}
```

---

## 4. COMPONENTE SHELL (Shell.tsx)

**Local:** `app/components/Shell.tsx`

**Função:** Layout principal que envolve todas as páginas

**Estrutura:**
```tsx
<ThemeProvider>
  <SidebarProvider>
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  </SidebarProvider>
</ThemeProvider>
```

**CSS:**
```css
.layout {
  display: flex;
  min-height: 100vh;
}

.main {
  flex: 1;
  margin-left: 260px; /* Largura da sidebar */
  transition: margin-left 0.3s;
}

/* Quando sidebar está colapsada */
.main_collapsed {
  margin-left: 80px;
}
```

---

## 5. COMPONENTE SIDEBAR (Sidebar.tsx)

**Local:** `app/components/Sidebar.tsx` e `sidebar.module.css`

**Função:** Menu lateral de navegação

**Funcionalidades:**
- Links para: Dashboard, Pacientes, Procedimentos, Agenda, Financeiro, Configurações
- Botão de colapsar/expandir
- Indicador de página ativa
- Informações do usuário no footer

**Links:**
```typescript
const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/procedures", label: "Procedimentos", icon: Stethoscope },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/financial", label: "Financeiro", icon: DollarSign },
  { href: "/settings", label: "Configurações", icon: Settings },
];
```

**Estados:**
- `collapsed`: boolean - Controla se a sidebar está expandida ou não
- Classes CSS dinâmicas para estado ativo

---

## 6. PÁGINAS E SEUS ESTILOS

### 6.1 Dashboard (page.tsx)
**Local:** `app/page.tsx` e `home.module.css`

**Funcionalidades:**
- Cards de estatísticas (KPIs)
- Próximo paciente em destaque
- Atalhos rápidos
- Data atual formatada

**Componentes principais:**
- `.statCard` - Cards de estatísticas
- `.nextCard` - Card do próximo paciente (gradiente)
- `.shortcutCard` - Atalhos de navegação

### 6.2 Pacientes (patients/page.tsx)
**Local:** `app/(dashboard)/patients/page.tsx`

**Funcionalidades:**
- Lista de pacientes em tabela
- Botão "Novo Paciente"
- Link "Ver Ficha" para cada paciente
- Estado vazio quando não há pacientes

**Estrutura da tabela:**
- Nome
- Contato (telefone)
- E-mail
- Ações

### 6.3 Novo Paciente (patients/new/page.tsx)
**Local:** `app/(dashboard)/patients/new/page.tsx`

**Formulário:**
- Nome Completo (input text, required)
- Telefone/WhatsApp (input text)
- CPF (input text)
- E-mail (input email)

**Action:** `createPatient` (de app/lib/actions.ts)

### 6.4 Procedimentos (procedures/page.tsx)
**Local:** `app/(dashboard)/procedures/page.tsx`

**Funcionalidades:**
- Grid de cards com procedimentos
- Cada card mostra: Nome, Preço, Duração, Descrição
- Botão "Novo Procedimento"

### 6.5 Novo Procedimento (procedures/new/page.tsx)
**Local:** `app/(dashboard)/procedures/new/page.tsx`

**Formulário:**
- Nome do Procedimento
- Preço (number)
- Duração (em minutos)
- Descrição (textarea)

### 6.6 Agenda (agenda/page.tsx)
**Local:** `app/(dashboard)/agenda/page.tsx`

**Funcionalidades:**
- Visualização em timeline/linha do tempo
- Cards de agendamentos por horário
- Cores por status:
  - Verde: Confirmado
  - Laranja: Pendente
  - Cinza: Finalizado
- Slots vazios clicáveis para agendar

**Status:**
- CONFIRMED
- PENDING
- FINISHED

### 6.7 Novo Agendamento (agenda/new/page.tsx)
**Local:** `app/(dashboard)/agenda/new/page.tsx`

**Formulário:**
- Paciente (select dropdown)
- Procedimento (select dropdown)
- Data (input date)
- Horário (input time)
- Observações (textarea)

### 6.8 Financeiro (financial/page.tsx)
**Local:** `app/financial/page.tsx`

**Funcionalidades:**
- KPIs: Receitas, Despesas, Saldo Líquido
- Gráfico de evolução financeira
- Lista de transações recentes
- Formulário rápido para adicionar transação

**Gráfico:** Recharts (CashFlowChart.tsx)

### 6.9 Configurações (settings/page.tsx)
**Local:** `app/settings/page.tsx`

**Funcionalidades:**
- Toggle de tema light/dark
- Configurações da clínica (nome, telefone)
- Preferências do sistema

---

## 7. SERVER ACTIONS (actions.ts)

**Local:** `app/lib/actions.ts`

**Funções disponíveis:**

### Pacientes
```typescript
async function createPatient(formData: FormData)
// Campos: name, phone, cpf, email
// Retorna: redireciona para /patients
```

### Procedimentos
```typescript
async function createProcedure(formData: FormData)
// Campos: name, price, duration, description
// Retorna: redireciona para /procedures
```

### Agendamentos
```typescript
async function createAppointment(formData: FormData)
// Campos: patientId, procedureId, date, time, notes
// Retorna: redireciona para /agenda

async function updateAppointmentStatus(id: string, status: string)
// Atualiza status: CONFIRMED, PENDING, FINISHED, CANCELLED
```

### Financeiro
```typescript
async function createTransaction(formData: FormData)
// Campos: description, amount, date, type (INCOME/EXPENSE)
// Retorna: redireciona para /financial
```

---

## 8. BANCO DE DADOS (Prisma)

**Local:** `prisma/schema.prisma`

**Modelos:**

### Patient
```prisma
model Patient {
  id        String   @id @default(uuid())
  name      String
  phone     String?
  email     String?
  cpf       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  appointments Appointment[]
}
```

### Procedure
```prisma
model Procedure {
  id          String   @id @default(uuid())
  name        String
  price       Decimal
  duration    Int      // em minutos
  description String?
  createdAt   DateTime @default(now())
  
  appointments Appointment[]
}
```

### Appointment
```prisma
model Appointment {
  id          String   @id @default(uuid())
  patientId   String
  procedureId String
  date        DateTime
  status      String   @default("PENDING") // CONFIRMED, PENDING, FINISHED, CANCELLED
  notes       String?
  createdAt   DateTime @default(now())
  
  patient     Patient     @relation(fields: [patientId], references: [id])
  procedure   Procedure   @relation(fields: [procedureId], references: [id])
}
```

### FinancialRecord
```prisma
model FinancialRecord {
  id          String   @id @default(uuid())
  description String
  amount      Decimal
  type        String   // INCOME ou EXPENSE
  dueDate     DateTime
  createdAt   DateTime @default(now())
}
```

---

## 9. PADRÕES DE CSS MODULE

**Exemplo padrão de página:**
```css
/* Container principal */
.container {
    min-height: 100vh;
    background-color: var(--bg-primary);
    padding: 2rem;
}

/* Header com título e botão */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1000px;
    margin: 0 auto 2rem auto;
}

.title {
    color: var(--text-primary);
    font-size: 2rem;
    font-weight: 700;
}

/* Botão primário */
.primaryBtn {
    background-color: var(--accent-primary);
    color: #fff;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.primaryBtn:hover {
    background-color: var(--accent-hover);
}

/* Card */
.card {
    background: var(--bg-card);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 10px var(--shadow-color);
}

/* Formulário */
.inputGroup {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
}

.inputGroup label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.inputGroup input {
    padding: 0.8rem 1rem;
    border: 1.5px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-card);
    color: var(--text-primary);
    transition: all 0.2s ease;
}

.inputGroup input:focus {
    outline: none;
    border-color: var(--accent-secondary);
    box-shadow: 0 0 0 3px rgba(139, 30, 30, 0.1);
}

/* Para dark mode */
[data-theme="dark"] .inputGroup input:focus {
    box-shadow: 0 0 0 3px rgba(196, 68, 68, 0.2);
}
```

---

## 10. COMO CRIAR UMA NOVA PÁGINA

**Passo 1:** Criar pasta e arquivo page.tsx
```
app/(dashboard)/nova-pagina/page.tsx
```

**Passo 2:** Criar arquivo de estilos
```
app/(dashboard)/nova-pagina/nova-pagina.module.css
```

**Passo 3:** Estrutura básica do componente
```tsx
import styles from "./nova-pagina.module.css";

export default function NovaPagina() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Título da Página</h1>
      </header>
      
      <div className={styles.content}>
        {/* Conteúdo aqui */}
      </div>
    </div>
  );
}
```

**Passo 4:** Adicionar link na Sidebar (se necessário)
Editar `app/components/Sidebar.tsx` e adicionar novo item no array `links`.

---

## 11. COMO CRIAR UMA NOVA SERVER ACTION

**Passo 1:** Abrir `app/lib/actions.ts`

**Passo 2:** Adicionar função
```typescript
"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function novaAction(formData: FormData) {
  const campo1 = formData.get("campo1") as string;
  const campo2 = formData.get("campo2") as string;
  
  await prisma.novoModel.create({
    data: {
      campo1,
      campo2,
    },
  });
  
  revalidatePath("/rota");
  redirect("/rota");
}
```

**Passo 3:** Usar no formulário
```tsx
import { novaAction } from "@/app/lib/actions";

<form action={novaAction}>
  <input name="campo1" required />
  <input name="campo2" />
  <button type="submit">Salvar</button>
</form>
```

---

## 12. DEPENDÊNCIAS IMPORTANTES

**package.json:**
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@prisma/client": "^6.x",
    "prisma": "^6.x",
    "lucide-react": "^0.x",    // Ícones
    "recharts": "^2.x",        // Gráficos
    "tailwindcss": "^4.x"      // Disponível mas não usado no CSS Modules
  }
}
```

---

## 13. COMANDOS ÚTEIS

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Gerar cliente Prisma após mudar schema
npx prisma generate

# Rodar migrações
npx prisma migrate dev

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Build para produção
npm run build

# Iniciar em produção
npm start
```

---

## 14. DICAS E BOAS PRÁTICAS

1. **Sempre use as variáveis CSS** - Nunca hardcode cores, sempre use `var(--nome-da-variavel)`

2. **Transições suaves** - Todas as mudanças de cor devem ter `transition: all 0.2s ease` ou `transition: background-color 0.3s ease`

3. **Responsividade** - Sempre adicione media queries para mobile:
```css
@media (max-width: 768px) {
  .container { padding: 1rem; }
  .header { flex-direction: column; }
}
```

4. **Server Components por padrão** - Next.js 15 usa Server Components por padrão. Só use `"use client"` quando necessário (interatividade, hooks, browser APIs)

5. **Formulários** - Sempre use Server Actions com `action={nomeDaAction}` nos forms

6. **Ícones** - Use Lucide React: `import { IconName } from "lucide-react"`

7. **Cores do tema** - O tema é baseado em tons de vinho/creme:
   - Light: Fundo creme (#f9f5f2), texto vinho escuro, acentos vinho (#4a0e0e)
   - Dark: Fundo vinho escuro (#1a1212), texto claro, acentos vinho claro (#c44444)

---

## 15. EXEMPLO COMPLETO: NOVA FUNCIONALIDADE

### Cenário: Criar uma página de relatórios

**1. Criar estrutura:**
```
app/(dashboard)/reports/
├── page.tsx
└── reports.module.css
```

**2. Criar Server Action em `app/lib/actions.ts`:**
```typescript
export async function generateReport(formData: FormData) {
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  
  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      patient: true,
      procedure: true,
    },
  });
  
  return appointments;
}
```

**3. Criar página `page.tsx`:**
```tsx
import { generateReport } from "@/app/lib/actions";
import styles from "./reports.module.css";

export default function ReportsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Relatórios</h1>
      </header>
      
      <form action={generateReport} className={styles.formCard}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Data Inicial</label>
            <input type="date" name="startDate" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Data Final</label>
            <input type="date" name="endDate" required />
          </div>
        </div>
        <button type="submit" className={styles.primaryBtn}>
          Gerar Relatório
        </button>
      </form>
    </div>
  );
}
```

**4. Criar estilos `reports.module.css`:**
```css
.container {
    min-height: 100vh;
    background-color: var(--bg-primary);
    padding: 2rem;
}

.header {
    max-width: 1000px;
    margin: 0 auto 2rem auto;
}

.title {
    color: var(--text-primary);
    font-size: 2rem;
    font-weight: 700;
}

.formCard {
    background: var(--bg-card);
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 10px var(--shadow-color);
}

.row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.inputGroup {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
}

.inputGroup label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.inputGroup input {
    padding: 0.8rem 1rem;
    border: 1.5px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-card);
    color: var(--text-primary);
    transition: all 0.2s ease;
}

.inputGroup input:focus {
    outline: none;
    border-color: var(--accent-secondary);
    box-shadow: 0 0 0 3px rgba(139, 30, 30, 0.1);
}

.primaryBtn {
    width: 100%;
    padding: 1rem;
    background-color: var(--accent-primary);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.primaryBtn:hover {
    background-color: var(--accent-hover);
}

@media (max-width: 768px) {
    .row {
        grid-template-columns: 1fr;
    }
}
```

**5. Adicionar link na Sidebar:**
Editar `app/components/Sidebar.tsx`:
```typescript
const links = [
  // ... links existentes
  { href: "/reports", label: "Relatórios", icon: FileText },
];
```

---

FIM DA DOCUMENTAÇÃO
