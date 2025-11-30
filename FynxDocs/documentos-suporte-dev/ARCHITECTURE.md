# Arquitetura do Sistema Fynx

Este documento descreve a arquitetura do sistema, as stacks utilizadas no frontend, no backend e o estado atual do banco de dados, de forma didática e completa.

## Visão Geral

O projeto está estruturado como um monorepo com dois principais módulos:

- `FynxV2/`: Aplicação frontend (React + Vite)
- `FynxApi/`: API backend (Express + TypeScript)

Ambiente de desenvolvimento:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Proxy de desenvolvimento: requisições do frontend para `"/api"` são redirecionadas para o backend (`vite.config.ts`)
- Base da API: `"/api/v1"`

### Diagrama de Alto Nível

```
┌──────────────────────┐     /api (proxy)     ┌──────────────────────┐
│  Frontend (React 18) │ ───────────────────▶ │ Backend (Express 5)  │
│  Vite Dev Server     │                      │ /api/v1               │
└─────────┬────────────┘                      └─────────┬────────────┘
          │                                            │
          │ React Query (cache)                        │ Controllers
          │ RHF + Zod (forms)                          │ Services (regras)
          │ shadcn/ui + Tailwind                       │ Dados Mock (memória)
          ▼                                            ▼
      UI/Pages                                   Respostas JSON Tipadas
```

---

## Frontend (FynxV2)

### Stack Principal
- `React 18` e `TypeScript 5`
- `Vite 5` com plugin `@vitejs/plugin-react-swc`
- `TailwindCSS 3` + `tailwindcss-animate` + `tailwind-merge`
- `shadcn/ui` (sobre `Radix UI`) com `CVA` para variantes
- `TanStack React Query 5` para estado do servidor e cache
- `React Hook Form` + `Zod` + `@hookform/resolvers` para formulários e validação
- `React Router DOM 6` para rotas
- Gráficos: `Recharts`
- Ícones: `lucide-react`
- Animações: `framer-motion`
- Datas: `date-fns`
- Acessórios de UI: `cmdk`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`, `vaul`, `react-github-contribution-calendar`, `input-otp`
- Temas: `next-themes`

### Arquitetura e Organização
- `src/pages/`: páginas principais (Dashboard `/`, Ranking `/ranking`, Goals `/goals`, NotFound `*`)
- `src/components/`: componentes UI (baseados em shadcn/ui + Radix)
- `src/hooks/`: hooks como `useDashboard`, `useRanking` para consumo da API
- `src/lib/`: utilidades e helpers (`cn`, formatações, etc.)
- Alias de import: `@/*` mapeado para `./src/*` via `tsconfig` e `vite.config`
- Estilos: `Tailwind` com tokens CSS (`index.css`, `tailwind.config.ts`) e modo escuro/claro

### Roteamento
```
Routes:
├── "/" → Index (Dashboard)
├── "/ranking" → Ranking
├── "/goals" → Goal
└── "*" → NotFound (404)
```

### Fluxo de Dados no Frontend
- Chamadas HTTP para `"/api"` (proxy Vite) → redirecionadas ao backend em `localhost:3001`
- React Query gerencia cache, estados de loading/error e revalidação
- Formulários usam `react-hook-form` com validação `zod` (schemas tipados)
- Componentização reutilizável com `shadcn/ui` e acessibilidade via `Radix UI`

### Scripts (package.json)
```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

---

## Backend (FynxApi)

### Stack Principal
- `Node.js` (ESM) + `TypeScript`
- `Express 5` (`^5.1.0`)
- `cors` para CORS
- `dotenv` para variáveis de ambiente
- Execução em dev com `ts-node` (`node --watch --loader ts-node/esm`)

### Arquitetura e Organização
- Entrypoint: `src/server.ts`
  - Middlewares: `cors`, `express.json()`
  - Monta as rotas em `"/api/v1"`
- `src/routes/index.ts`: agrega módulos
  - `dashboard/`
  - `transactions/`
  - `goals/`
  - `ranking/`
  - `spending-limits/`
- Padrão Controller → Service
  - Controllers tratam `Request/Response`, validação leve e status codes
  - Services concentram a regra de negócio e acesso aos dados (mock)
- Tipos TS em `*.types.ts` para contratos, filtros e payloads
- Configurações de build: `tsconfig.json` com `module: NodeNext`, `outDir: dist`

### Base de API
- Base: `"/api/v1"`
- Exemplos de rotas:
  - `GET /api/v1/dashboard` (dados do dashboard)
  - `GET /api/v1/transactions` (lista com filtros e paginação)
  - `POST /api/v1/transactions` (cria transação)
  - `GET /api/v1/goals/spending-goals` (metas de gasto)
  - `GET /api/v1/ranking/leaderboard/global` (ranking global)
  - `GET /api/v1/spending-limits` (limites de gastos)

### Fluxo de Requisição
1. Frontend chama `"/api/..."`
2. Vite proxy → `http://localhost:3001/api/...`
3. Express roteia para o módulo correspondente
4. Controller valida parâmetros e chama o Service
5. Service processa em dados mockados e retorna resultado
6. Controller responde com JSON e status apropriado

### Scripts (package.json)
```json
{
  "dev": "node --watch --loader ts-node/esm src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

---

## Banco de Dados

### Estado Atual
- Não há banco de dados real conectado.
- Os dados são mantidos em **memória** (mock) dentro dos Services:
  - `transactions.service.ts`: array `mockTransactions` com operações CRUD e estatísticas
  - `goals.service.ts`: arrays `spendingGoals` e `budgets`
  - `dashboard.service.ts`: lista `transactions` para KPIs e gráficos
- Implicações:
  - Sem persistência entre reinicializações do servidor
  - Sem concorrência/locks
  - Sem consultas complexas ou índices

### Evolução Recomendada
Para produção, recomenda-se introduzir um banco de dados e um ORM.

- Opção A (Relacional): **PostgreSQL** + **Prisma ORM**
  - Vantagens: tipagem forte, migrations, bom para relatórios e agregações
  - Modelos sugeridos: `User`, `Transaction`, `Category`, `Goal`, `Budget`, `SpendingLimit`, `Achievement`, `Badge`

- Opção B (Documentos): **MongoDB** + **Mongoose**
  - Vantagens: flexibilidade de schema, rápida iteração
  - Modelos semelhantes, com coleções aninhadas para metas e limites

### Estrutura de Dados (exemplos de campos)
- `Transaction`: `{ id, userId, type, amount, description, category, subcategory?, date, paymentMethod, tags?, location?, notes?, recurring? }`
- `SpendingGoal`: `{ id, title, category, targetAmount, currentAmount, period, startDate, endDate, status, description }`
- `Budget`: `{ id, category, period, limitAmount, spentAmount, startDate, endDate, status }`

### Configuração de Ambiente (futuro)
- Backend: `PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`
- Frontend: `VITE_API_BASE` (se preferir configuração dinâmica invés de proxy), chaves de serviços externos

---

## Boas Práticas e Convenções
- Tipagem de contratos na API (`*.types.ts`) e validação de entrada/saída
- Status codes consistentes e mensagens de erro claras
- Separação Controller/Service e módulos de domínio
- UI acessível com Radix e responsiva com Tailwind
- Cache de dados e revalidação com React Query
- Schemas `zod` compartilháveis entre front/back (possível evolução)

---

## Como Tudo se Conecta
1. O usuário interage com páginas React (Dashboard, Goals, Ranking)
2. Componentes disparam ações (formularios/sheets/drawers) e hooks chamam a API
3. Vite proxy encaminha para o backend Express
4. Controllers roteiam, Services processam dados e retornam JSON
5. React Query atualiza cache e UI re-renderiza com novos dados

---

## Referências Rápidas
- Frontend: `FynxV2/` → `vite.config.ts`, `tailwind.config.ts`, `src/pages`, `src/components`, `src/hooks`
- Backend: `FynxApi/` → `src/server.ts`, `src/routes/index.ts`, `src/modules/*`
- API: base `"/api/v1"` (veja o `README.md` para lista de endpoints e exemplos)

Se precisar, posso complementar com diagramas adicionais, schemas detalhados dos payloads e exemplos de integrações futuras com banco de dados.