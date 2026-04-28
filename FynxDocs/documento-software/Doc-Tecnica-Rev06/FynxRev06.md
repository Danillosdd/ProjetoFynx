# FYNX Rev. 06 - Documentacao Tecnica Global

> Hub principal da documentacao Rev06. A revisao consolida a migracao do backend para uma organizacao orientada a dominios, mantendo uma estrutura hibrida: DDD para arquitetura e rastreabilidade classica para requisitos, fluxos, banco e API.

---

## 1. Controle de Revisoes

| Revisao | Data | Objetivo | Status |
|---|---|---|---|
| Rev05 | Abril/2026 | Documento tecnico monolitico, com padrao classico. | Referencia historica |
| Rev06 | Abril/2026 | Documentacao modular alinhada ao backend DDD. | Ativa |

---

## 2. Como Ler a Rev06

| Documento | Quando usar | Status |
|---|---|---|
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Entender requisitos, regras, RNFs e rastreabilidade. | Refatorado |
| [WORKFLOWS.md](./WORKFLOWS.md) | Entender casos de uso, sad paths e processos. | Refatorado |
| [API_REFERENCE.md](./API_REFERENCE.md) | Consumir ou manter contratos HTTP. | Refatorado |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Entender tabelas, migrations e lacunas de persistencia. | Refatorado |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Entender bounded contexts, pastas, patterns e ADRs. | Refatorado |
| [GAMIFICATION_ENGINE.md](./GAMIFICATION_ENGINE.md) | Entender score, ranking, badges e temporadas. | Refatorado |
| [llms.txt](./llms.txt) | Dar contexto rapido para agentes de IA. | Refatorado |

**Ordem recomendada de leitura:** regras, workflows, API, banco, arquitetura, gamificacao.

---

## 3. Escopo Atual do Sistema

O FYNX e um sistema de gestao financeira gamificada com:

- autenticacao JWT;
- cadastro e consulta de transacoes;
- metas de gasto e economia;
- budgets;
- categorias globais e customizadas;
- dashboard financeiro;
- ranking, score, achievements e badges;
- tours de onboarding no frontend;
- modulo WhatsApp planejado.

### 3.1. Status dos modulos

| Modulo | Status | Observacao |
|---|---|---|
| Auth | Implementado | `/api/v1/auth`. |
| Transactions | Implementado | CRUD, filtros, summary, stats e bulk. |
| Goals/Budgets | Implementado | `/api/v1/goals`. |
| Dashboard | Implementado | `/api/v1/dashboard`. |
| Ranking/Gamification | Implementado | `/api/v1/ranking`. |
| Custom Categories | Implementado | `/api/v1/categories/custom`. |
| Spending Limits | Parcial | Existe dominio, mas rota central e tabela fisica estao pendentes. |
| WhatsApp/IA | Planejado | Nao ha rota registrada no backend atual. |
| Admin/Audit | Parcial/Planejado | Logs existem; auditoria persistida precisa evoluir. |

---

## 4. Quick Start

### 4.1. Backend

```bash
cd FynxApi
npm install
npm run dev
```

O banco SQLite e inicializado em `FynxApi/src/data/fynx.db` por `infrastructure/database/database.ts`.

### 4.2. Frontend

```bash
cd FynxV2
npm install
npm run dev
```

O frontend deve apontar para:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

---

## 5. Stack Tecnologica

### Backend - `FynxApi`

| Tecnologia | Papel | Justificativa |
|---|---|---|
| Node.js | Runtime | Ecossistema simples para API REST. |
| Express | HTTP server e roteamento | Leve e direto para rotas modulares. |
| TypeScript | Tipagem | Melhora manutencao e contratos internos. |
| SQLite | Persistencia atual | Baixo atrito local e seed simples. |
| bcrypt | Hash de senha | Protege credenciais. |
| JWT | Autenticacao stateless | Protege rotas sem sessao server-side. |
| Zod/validacoes | Contrato de entrada | Deve ser usado para reduzir payload invalido. |

### Frontend - `FynxV2`

| Tecnologia | Papel | Justificativa |
|---|---|---|
| React | Interface | SPA com componentes reutilizaveis. |
| Vite | Build/dev server | Desenvolvimento rapido. |
| TypeScript | Tipagem | Contratos mais seguros. |
| Tailwind CSS | Estilo | UI responsiva e utilitaria. |
| shadcn/ui | Componentes | Base consistente de componentes. |
| Refine | Recursos CRUD/admin | Telas de recursos no frontend. |
| Driver.js | Tours | Onboarding guiado. |

---

## 6. Estrutura do Repositorio

```text
ProjetoFynx/
├── FynxApi/
│   ├── src/application/
│   ├── src/domains/
│   ├── src/infrastructure/
│   └── src/shared/
├── FynxV2/
│   ├── src/components/
│   ├── src/pages/
│   ├── src/hooks/
│   ├── src/refine/
│   └── src/services/
└── FynxDocs/
    └── documento-software/Doc-Tecnica-Rev06/
```

Detalhes de pastas e responsabilidades estao em [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 7. Rastreabilidade

A Rev06 usa a seguinte cadeia:

```text
RF/RN -> CSU -> Endpoint -> Tabela -> Codigo
```

Exemplo:

```text
RF003 Cadastro de transacao
-> CSU03 Cadastro de transacao financeira
-> POST /api/v1/transactions
-> transactions
-> domains/financial/transactions/*
```

---

## 8. Diretrizes de Atualizacao

Ao alterar o sistema:

1. Mudou rota: atualizar `API_REFERENCE.md`.
2. Mudou regra de negocio: atualizar `BUSINESS_RULES.md`.
3. Mudou fluxo de usuario: atualizar `WORKFLOWS.md`.
4. Mudou tabela/migration: atualizar `DATABASE_SCHEMA.md`.
5. Mudou arquitetura/pasta/pattern: atualizar `ARCHITECTURE.md`.
6. Mudou score/ranking/badge: atualizar `GAMIFICATION_ENGINE.md`.
7. Mudou contexto para agentes: atualizar `llms.txt`.

---

## 9. Lacunas Tecnicas Conhecidas

| Lacuna | Documento fonte | Acao recomendada |
|---|---|---|
| `spending-limits` nao registrado no roteador central. | API, Architecture | Registrar rota ou marcar modulo como interno. |
| `spending_limits` sem tabela fisica. | Database | Criar migration ou mapear para goals. |
| Tipos de `transactions` possuem campos sem colunas fisicas. | API, Database | Persistir campos ou ajustar contrato. |
| `budgets` diverge entre tipo TS e schema fisico. | API, Database | Normalizar nomes e periodos. |
| WhatsApp documentado como planejado. | Workflows, API | Criar modulo antes de marcar como implementado. |
| Reset de temporada precisa controle administrativo forte. | Business, Gamification | Adicionar autorizacao e auditoria. |

---

## 10. Criterio de Qualidade Rev06

Um documento da Rev06 so deve ser considerado atualizado quando:

- diferencia implementado, parcial e planejado;
- aponta para codigo real quando falar de implementacao;
- nao inventa endpoint ou tabela;
- possui rastreabilidade com RF, CSU, endpoint e tabela quando aplicavel;
- mantem linguagem tecnica consistente.
