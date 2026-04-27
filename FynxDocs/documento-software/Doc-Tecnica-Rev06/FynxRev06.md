# FYNX Rev. 06 — Documentação Técnica Global

> **O Sistema Definitivo de Gestão Financeira Gamificada.** Um software corporativo que une inteligência financeira, Domain-Driven Design (DDD) e a teoria dos jogos para transformar o controle de despesas em uma jornada recompensadora.

---

## 📑 Controle de Revisões e Status do Projeto

| Revisão | Data | Responsáveis | Milestone | Status |
|---|---|---|---|---|
| **Rev. 05** | Abr/2026 | Matheus, Giulianna, Danilo | Projeto Original MVC (Transaction Script). Adição conceitual do módulo WhatsApp. | 🔴 Depreciado |
| **Rev. 06** | Abr/2026 | Agentic AI (Orchestrator) | **Refatoração Clean Architecture & DDD**. Desacoplamento da gamificação, injeção de dependências e documentação distribuída. | 🟢 Ativo |

---

## 🧭 Sumário Executivo e Hub Documental

Para combater a complexidade estrutural e restaurar a profundidade técnica da Rev. 05, a documentação foi totalmente reescrita em módulos especializados de alto volume. **Este documento atua como o mapa raiz.**

Navegue pela documentação específica conforme sua necessidade técnica:

- 🏛️ **[Arquitetura e Padrões de Projeto (ARCHITECTURE.md)](./ARCHITECTURE.md)**: Diagrama de Classes exaustivo, Fluxo de Usuário completo, DDD Directory Map e 6 ADRs fundamentais.
- 📐 **[Engenharia de Requisitos (BUSINESS_RULES.md)](./BUSINESS_RULES.md)**: Glossário técnico de 50+ termos, 20 Requisitos Funcionais, 8 RNF e 14 Regras de Negócio (Invariantes).
- 🎮 **[Motor de Gamificação (GAMIFICATION_ENGINE.md)](./GAMIFICATION_ENGINE.md)**: Matemática do FYNX Score, Tabela de XP (Níveis 1-50+), Sistema de Ligas (Bronze-Diamante) e Catálogo de Badges.
- 🗄️ **[Esquema de Banco de Dados (DATABASE_SCHEMA.md)](./DATABASE_SCHEMA.md)**: DDL físico das 12 tabelas, Dicionário de Dados, Estratégia de Performance (WAL) e Logs de Auditoria.
- 🔄 **[Mapeamento de Processos (WORKFLOWS.md)](./WORKFLOWS.md)**: Restauração dos 12 Casos de Uso (CSU01-CSU12) originais e diagramas BPMN com rollback logic.
- 🔌 **[Referência da API REST (API_REFERENCE.md)](./API_REFERENCE.md)**: Contratos exatos, exemplos JSON, tratamento de erros via Zod e webhooks de integração WhatsApp.

---

## 🚀 1. Quick Start (Subindo o Ambiente Local)

O ambiente foi desenhado para ser *Zero-Config* utilizando SQLite, permitindo que qualquer desenvolvedor suba a aplicação em menos de 3 minutos.

### 1.1. Pré-requisitos
- **Node.js**: Versão `18.x` ou `20.x` (LTS).
- **Gerenciador de Pacotes**: `npm` ou `yarn`.
- **Git**: Para controle de versão.

### 1.2. Configurando o Backend (FynxApi)
1. Navegue até o diretório da API: `cd FynxApi`
2. Instale as dependências: `npm install`
3. Crie o arquivo de configuração: `cp .env.example .env`
4. Preencha o `.env`:
   ```env
   PORT=3001
   JWT_SECRET=super_secret_key_change_in_production
   NODE_ENV=development
   ```
5. Inicie o servidor: `npm run dev`
   *(O banco de dados `fynx.db` será gerado automaticamente na pasta `/data` e as tabelas serão sincronizadas).*

### 1.3. Configurando o Frontend (FynxV2)
1. Em um novo terminal, navegue até a interface: `cd FynxV2`
2. Instale as dependências: `npm install`
3. Verifique o `.env.local` apontando para a API: `VITE_API_URL=http://localhost:3001/api/v1`
4. Inicie o cliente Vite: `npm run dev`
5. Acesse `http://localhost:5173` no navegador.

---

## 🧩 2. Features Core (O que o FYNX faz?)

### 💰 Inteligência Financeira
- **Lançamento Rápido**: Drawer flutuante para registro imediato de receitas e despesas.
- **Spending Goals**: Criação de orçamentos (tetos de gastos) com alertas visuais baseados em % de consumo.
- **Analytics Completo**: Gráficos construídos via `Recharts` que demonstram evolução diária de caixa, taxas de economia e agrupamento por categoria.
- **Bulk Actions**: Exclusão massiva de registros simultâneos com alto desempenho.

### 🏆 Gamificação Profunda
- **Algoritmo de Score**: Diferente de apps comuns, o score não sobe para sempre. O FYNX pontua o spread financeiro (Lucro vs Despesa) e aplica punições matemáticas dependendo da Liga do jogador.
- **Sistema de Ligas Elo**: De Bronze a Diamante, os usuários competem globalmente no Leaderboard.
- **Check-ins e Streaks**: Recompensas pelo uso diário ininterrupto do aplicativo.

### 📱 Integração Omnichannel (Em Breve)
- A arquitetura está pronta para receber a Evolution API (WhatsApp), permitindo que o usuário envie um áudio dizendo *"Gastei 50 reais de ifood"* e a inteligência artificial (LLM) converta isso para uma transação contábil imediata.

---

## 🛠 3. Stack Tecnológica Definitiva

### Backend (`FynxApi`)
O backend adota o **Domain-Driven Design (DDD)** para isolar o core contábil de integrações externas.

| Ferramenta | Papel no Ecosistema | Justificativa |
|---|---|---|
| **Express.js (5.x)** | HTTP Router | Robustez. Camada periférica (Infrastructure) apenas para rede. |
| **TypeScript (5.x)** | Tipagem Estrita | Reduz erros de runtime; os *Use Cases* dependem puramente das Interfaces. |
| **SQLite 3** | Persistência (Dev) | Portabilidade local sem necessidade de Docker (`sqlite3`). |
| **PostgreSQL** | Persistência (Prod) | Planejado via adoção transparente do *Repository Pattern*. |
| **Zod** | Validação | *Contract-First*. Filtra anomalias no JSON antes de tocar no domínio. |
| **Bcrypt + JWT** | Segurança Identity | Proteção contra ataque *rainbow table* e sessões stateless. |

### Frontend (`FynxV2`)
O frontend é construído como uma SPA focada em estado assíncrono e responsividade.

| Ferramenta | Papel no Ecosistema | Justificativa |
|---|---|---|
| **React (18.x) + Vite** | View Layer | Performance de HMR (Hot Module Replacement) imediata. |
| **Tailwind CSS + shadcn/ui**| Design System | Componentes modulares, altamente acessíveis e sem CSS global. |
| **TanStack Query** | Data Fetching | Elimina `useEffect` para chamadas de API; lida com Caching mágico e Stale Time. |
| **Recharts** | Analytics | Biblioteca de data-visualization baseada em SVG. |
| **Driver.js** | Onboarding | UX gamificada para introduzir novos usuários às features na primeira sessão. |

---

## 📂 4. Diretórios do Monorepo

O projeto está configurado num pseudo-monorepo que contém as duas frentes principais:

```text
ProjetoFynx/
├── FynxApi/                      # REST API (Node.js)
│   ├── src/
│   │   ├── application/          # Orquestradores (Use Cases)
│   │   ├── domains/              # O Coração: Entidades Puras e Lógica Math
│   │   ├── infrastructure/       # Express, DB e Injeção de Dependência
│   │   └── shared/               # Ferramentas globais
│   └── data/                     # fynx.db gerado em runtime
│
├── FynxV2/                       # Interface de Usuário (SPA)
│   ├── src/
│   │   ├── components/           # UI Elements (Botões, Modais)
│   │   ├── context/              # Autenticação e Theme
│   │   ├── pages/                # Rotas React (Dashboard, Metas)
│   │   └── services/             # Abstração do Axios e Contratos REST
│
└── FynxDocs/                     # Documentação de Engenharia de Software
```

---

## 🤝 5. Guia de Contribuição (Contributing)

Para manter o alto padrão estipulado pela arquitetura, todo PR (Pull Request) deve respeitar:
1. **Nunca burle a injeção de dependência:** Não invoque repositórios concretos (`SqliteRepository`) direto nos Controllers.
2. **Camada de Domínio Imaculada:** Arquivos na pasta `/domains/` nunca podem importar bibliotecas externas pesadas (como Express ou bibliotecas de SQL). O domínio deve rodar até mesmo num navegador se necessário.
3. **Padrão de Nomeclatura:** `CamelCase` para variáveis, `PascalCase` para classes/interfaces, e inglês em 100% da codebase (com exceção das traduções de interface).

---

> *"Arquitetura limpa não é sobre como os arquivos são agrupados, mas sobre o que depende do quê."* — **FYNX Engineering Team.**
