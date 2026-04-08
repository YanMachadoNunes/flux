# 🏥 FLUX

**Sistema de Gestão Inteligente para Clínicas e Consultórios**

O **FLUX** é uma plataforma moderna e de alta performance desenvolvida para otimizar a gestão de clínicas médicas, consultórios e profissionais de saúde. Construído com as tecnologias mais recentes do ecossistema Web, o sistema oferece uma experiência fluida (daí o nome *Flux*) para o gerenciamento de pacientes, agendamentos, procedimentos e finanças.

---

## 🚀 Tecnologias de Ponta

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Frontend:** [React 19](https://react.dev/) com TypeScript
- **Estilização:** CSS Modules com suporte nativo a temas (Vinho/Creme)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **Gráficos:** [Recharts](https://recharts.org/) para visualização financeira
- **Validação:** [Zod](https://zod.dev/) para integridade de dados
- **Testes:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## ✨ Funcionalidades Principais

### 👥 Gestão de Pacientes
- Cadastro completo e centralizado.
- Histórico de agendamentos e fichas detalhadas.
- Validação inteligente de documentos (CPF).

### 📅 Agenda Dinâmica
- Visualização em linha do tempo (Timeline).
- Status coloridos para fácil identificação (Pendente, Confirmado, Finalizado).
- Fluxo simplificado para novos agendamentos.

### 💰 Inteligência Financeira
- Dashboard com KPIs (Receitas, Despesas, Saldo Líquido).
- Gráficos de evolução de fluxo de caixa.
- Registro rápido de transações de entrada e saída.

### 🏥 Catálogo de Procedimentos
- Gerenciamento de serviços com preços e durações personalizáveis.

### 🌙 Personalização & Interface
- Sistema de temas Light e Dark (persistente).
- Design focado em usabilidade e produtividade.
- Sidebar colapsável para maior aproveitamento de tela.

---

## 📂 Estrutura do Projeto

```text
├── app/
│   ├── (dashboard)/    # Módulos principais (Agenda, Pacientes, Procedimentos)
│   ├── components/     # UI Components (Shell, Sidebar, etc.)
│   ├── context/        # Gerenciamento de Estado (Tema, Sidebar)
│   ├── financial/      # Módulo Financeiro e Gráficos
│   ├── lib/            # Server Actions e Integração com Prisma
│   └── globals.css     # Variáveis CSS e Estilos Globais
├── prisma/             # Schema e Migrations do Banco de Dados
├── public/             # Ativos Estáticos
└── tests/              # Testes Automatizados
```

---

## 🏁 Como Começar

### Pré-requisitos
- **Node.js** (LTS recomendado)
- **Docker** (para o banco de dados PostgreSQL)

### Instalação e Execução

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o ambiente:**
   Crie um arquivo `.env` na raiz:
   ```env
   DATABASE_URL="postgresql://yan_flux:yan_password_123@localhost:5433/flux_db_new"
   ```

3. **Suba o Banco de Dados (Docker):**
   ```bash
   docker-compose up -d
   ```

4. **Prepare o Prisma:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:3000`

---

## 📖 Documentação Adicional

Para detalhes técnicos sobre a arquitetura, padrões de CSS e como criar novas funcionalidades, consulte a [Documentação de Arquitetura](./DOCUMENTACAO_ARQUITETURA.md).

---

## 🛠️ Scripts Úteis

- `npm run dev`: Inicia o ambiente de desenvolvimento.
- `npm run build`: Gera a versão de produção.
- `npm run test`: Executa a suíte de testes.
- `npx prisma studio`: Abre a interface visual para gerenciar o banco de dados.

---

Desenvolvido por **Yan Machado Nunes**
