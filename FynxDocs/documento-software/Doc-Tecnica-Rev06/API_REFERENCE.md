# API Reference - FYNX Rev. 06

> Referencia dos contratos HTTP reais do backend `FynxApi`, alinhada a arquitetura DDD da Rev06 e validada contra os arquivos de rotas em `FynxApi/src/domains`.

---

## 1. Padrao Global

**Base URL local:** `http://localhost:3001/api/v1`

**Autenticacao:** todas as rotas, exceto `/auth/register` e `/auth/login`, exigem JWT no header:

```http
Authorization: Bearer <token>
```

**Formato recomendado de erro:**

```json
{
  "error": "Mensagem resumida",
  "code": "OPTIONAL_CODE",
  "details": {}
}
```

**Status de cobertura:**

| Status | Significado |
|---|---|
| Implementado | Rota registrada em `infrastructure/http/routes/index.ts`. |
| Parcial | Existe arquivo de rota/controller, mas a rota nao esta registrada no roteador central ou depende de schema incompleto. |
| Planejado | Documentado como evolucao, sem rota produtiva registrada. |

**Rotas registradas no roteador central:**

| Prefixo | Status | Arquivo |
|---|---|---|
| `/auth` | Implementado | `domains/identity/auth/auth.routes.ts` |
| `/dashboard` | Implementado | `domains/analytics/dashboard/dashboard.routes.ts` |
| `/goals` | Implementado | `domains/financial/goals/goals.routes.ts` |
| `/transactions` | Implementado | `domains/financial/transactions/transactions.routes.ts` |
| `/ranking` | Implementado | `domains/gamification/ranking/ranking.routes.ts` |
| `/categories/custom` | Implementado | `domains/financial/custom-categories/customCategories.routes.ts` |
| `/spending-limits` | Parcial | `domains/financial/spending-limits/spending-limits.routes.ts` existe, mas nao esta registrado no roteador central. |

---

## 2. Auth - `/api/v1/auth`

### 2.1. `POST /api/v1/auth/register`

Cria um usuario e retorna token de acesso.

**Status:** Implementado
**Camada:** Identity & Access
**Regras relacionadas:** RF002, RNF002, PI002

**Body:**

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---|---|
| `name` | string | Sim | Nome exibido no sistema. |
| `email` | string | Sim | Deve ser unico em `users.email`. |
| `password` | string | Sim | Deve ser armazenado como hash, nunca em texto puro. |

**Request:**

```json
{
  "name": "Usuario Demo",
  "email": "demo@fynx.com",
  "password": "123456"
}
```

**Response 201:**

```json
{
  "token": "jwt.token.assinado",
  "user": {
    "id": 1,
    "name": "Usuario Demo",
    "email": "demo@fynx.com"
  }
}
```

**Erros esperados:** `400` payload invalido, `409` email duplicado, `500` falha inesperada.

### 2.2. `POST /api/v1/auth/login`

Autentica usuario existente.

**Status:** Implementado
**Camada:** Identity & Access
**Regras relacionadas:** RF001, RNF002

**Body:**

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---|---|
| `email` | string | Sim | Email cadastrado. |
| `password` | string | Sim | Senha em texto enviada apenas no transporte HTTPS. |

**Request:**

```json
{
  "email": "demo@fynx.com",
  "password": "123456"
}
```

**Response 200:**

```json
{
  "token": "jwt.token.assinado",
  "user": {
    "id": 1,
    "name": "Usuario Demo",
    "email": "demo@fynx.com"
  }
}
```

**Erros esperados:** `400` payload invalido, `401` credenciais invalidas.

---

## 3. Transactions - `/api/v1/transactions`

**Status:** Implementado
**Camada:** Financial Core
**Fonte:** `transactions.routes.ts`, `transactions.types.ts`

### 3.1. `GET /api/v1/transactions`

Lista transacoes do usuario autenticado com filtros.

**Query params:**

| Parametro | Tipo | Obrigatorio | Observacao |
|---|---|---|---|
| `page` | number | Nao | Pagina atual. |
| `limit` | number | Nao | Itens por pagina. |
| `type` | `income`, `expense`, `all` | Nao | Filtro por tipo. |
| `category` | string | Nao | Categoria exata. |
| `subcategory` | string | Nao | Existe no tipo TS; persistencia atual usa categoria principal. |
| `paymentMethod` | string | Nao | Existe no contrato TS; validar persistencia antes de tratar como campo fisico. |
| `dateFrom` | date | Nao | Inicio do periodo. |
| `dateTo` | date | Nao | Fim do periodo. |
| `amountMin` | number | Nao | Valor minimo. |
| `amountMax` | number | Nao | Valor maximo. |
| `search` | string | Nao | Busca por texto. |

**Response 200:**

```json
{
  "transactions": [
    {
      "id": "15",
      "userId": "1",
      "type": "expense",
      "amount": 50,
      "description": "Almoco",
      "category": "Alimentacao",
      "date": "2026-04-28",
      "notes": "Restaurante",
      "createdAt": "2026-04-28T10:00:00.000Z",
      "updatedAt": "2026-04-28T10:00:00.000Z",
      "spendingGoalId": null,
      "savingGoalId": null
    }
  ],
  "summary": {
    "totalIncome": 0,
    "totalExpenses": 50,
    "netAmount": -50,
    "transactionCount": 1,
    "averageTransaction": 50,
    "categoryBreakdown": [],
    "monthlyTrend": []
  },
  "totalCount": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

### 3.2. `GET /api/v1/transactions/categories`

Retorna categorias globais disponiveis para transacoes.

**Response 200:**

```json
[
  {
    "id": "1",
    "name": "Alimentacao",
    "type": "expense",
    "icon": "utensils",
    "color": "#ef4444"
  }
]
```

### 3.3. `GET /api/v1/transactions/summary`

Retorna resumo financeiro do usuario.

**Response 200:**

```json
{
  "totalIncome": 4500,
  "totalExpenses": 2300,
  "netAmount": 2200,
  "transactionCount": 42,
  "averageTransaction": 161.9,
  "categoryBreakdown": [
    {
      "category": "Alimentacao",
      "amount": 720,
      "percentage": 31.3,
      "transactionCount": 12
    }
  ],
  "monthlyTrend": [
    {
      "month": "2026-04",
      "income": 4500,
      "expenses": 2300,
      "net": 2200
    }
  ]
}
```

### 3.4. `GET /api/v1/transactions/stats`

Retorna estatisticas derivadas.

**Response 200:**

```json
{
  "dailyAverage": 76.66,
  "weeklyAverage": 536.66,
  "monthlyAverage": 2300,
  "mostExpensiveTransaction": {
    "id": "8",
    "amount": 900,
    "description": "Aluguel",
    "type": "expense"
  },
  "mostFrequentCategory": "Alimentacao",
  "paymentMethodBreakdown": []
}
```

### 3.5. `GET /api/v1/transactions/:id`

Busca uma transacao especifica do usuario autenticado.

**Response 200:** objeto `Transaction`.
**Erros esperados:** `404` quando a transacao nao existe ou nao pertence ao usuario.

### 3.6. `POST /api/v1/transactions`

Cria transacao financeira.

**Regras relacionadas:** RF003, RN001, RN005, CSU03

**Body:**

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---|---|
| `type` | `income`, `expense` | Sim | Tipo da transacao. |
| `amount` | number | Sim | Deve ser maior que zero. |
| `description` | string | Sim | Descricao curta. |
| `category` | string | Sim | Categoria valida. |
| `date` | date | Sim | Data do fato financeiro. |
| `notes` | string | Nao | Observacao livre. |
| `spendingGoalId` | string | Nao | Vinculo com meta de gasto. |
| `savingGoalId` | string | Nao | Vinculo com meta de economia. |

**Request:**

```json
{
  "type": "expense",
  "amount": 50,
  "description": "Almoco",
  "category": "Alimentacao",
  "date": "2026-04-28",
  "notes": "Restaurante"
}
```

**Response 201:** objeto `Transaction` criado.

### 3.7. `POST /api/v1/transactions/bulk`

Executa operacoes em lote.

**Body:**

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---|---|
| `operation` | `delete`, `update`, `categorize` | Sim | Operacao solicitada. |
| `transactionIds` | array | Sim | IDs alvo. |
| `updateData` | object | Nao | Obrigatorio para `update` ou `categorize`. |

**Request:**

```json
{
  "operation": "delete",
  "transactionIds": ["10", "11"]
}
```

**Response 200:**

```json
{
  "success": 2,
  "failed": 0,
  "message": "Operacao em lote concluida."
}
```

### 3.8. `PUT /api/v1/transactions/:id`

Atualiza campos de uma transacao existente.

**Body:** qualquer subconjunto de `UpdateTransactionRequest`.

**Request:**

```json
{
  "amount": 64.9,
  "description": "Almoco atualizado",
  "category": "Alimentacao"
}
```

**Response 200:** objeto `Transaction` atualizado.

### 3.9. `DELETE /api/v1/transactions/:id`

Remove transacao do usuario autenticado.

**Regras relacionadas:** RN004, CSU de exclusao/estorno.

**Response 200:**

```json
{
  "message": "Transacao removida com sucesso."
}
```

---

## 4. Goals e Budgets - `/api/v1/goals`

**Status:** Implementado
**Camada:** Financial Core
**Fonte:** `goals.routes.ts`, `goals.types.ts`

### 4.1. `GET /api/v1/goals`

Retorna visao consolidada de metas, budgets e progresso.

**Response 200:**

```json
{
  "spendingGoals": [],
  "budgets": [],
  "goalProgress": [],
  "totalGoals": 0,
  "activeGoals": 0,
  "completedGoals": 0,
  "totalBudgetAllocated": 0,
  "totalBudgetSpent": 0
}
```

### 4.2. Spending goals

| Metodo | Path | Descricao |
|---|---|---|
| `GET` | `/api/v1/goals/spending-goals` | Lista metas. |
| `GET` | `/api/v1/goals/spending-goals/:id` | Busca meta por ID. |
| `POST` | `/api/v1/goals/spending-goals` | Cria meta. |
| `PUT` | `/api/v1/goals/spending-goals/:id` | Atualiza meta. |
| `DELETE` | `/api/v1/goals/spending-goals/:id` | Remove meta. |
| `PATCH` | `/api/v1/goals/spending-goals/:id/progress` | Atualiza progresso diretamente. |
| `PATCH` | `/api/v1/goals/spending-goals/:id/progress-transaction` | Atualiza progresso a partir de transacao. |

**Create body:**

```json
{
  "title": "Reserva de emergencia",
  "category": "Reserva",
  "goalType": "saving",
  "targetAmount": 5000,
  "period": "monthly",
  "startDate": "2026-04-01",
  "endDate": "2026-12-31",
  "description": "Meta principal de economia"
}
```

**Response 201:** objeto `SpendingGoal`.

### 4.3. Budgets

| Metodo | Path | Descricao |
|---|---|---|
| `GET` | `/api/v1/goals/budgets` | Lista orcamentos. |
| `GET` | `/api/v1/goals/budgets/:id` | Busca orcamento por ID. |
| `POST` | `/api/v1/goals/budgets` | Cria orcamento. |
| `PUT` | `/api/v1/goals/budgets/:id` | Atualiza orcamento. |
| `DELETE` | `/api/v1/goals/budgets/:id` | Remove orcamento. |
| `PATCH` | `/api/v1/goals/budgets/:id/spending` | Atualiza gasto acumulado. |

**Create body:**

```json
{
  "name": "Orcamento mensal",
  "category": "Geral",
  "allocatedAmount": 3500,
  "period": "monthly",
  "startDate": "2026-04-01",
  "endDate": "2026-04-30"
}
```

**Observacao de schema:** a interface TypeScript usa `allocatedAmount`, mas a tabela fisica complementar `budgets` em `database.ts` usa `total_amount` e `spent_amount`. A documentacao deve preservar essa divergencia ate a camada de mapeamento ser consolidada.

---

## 5. Dashboard - `/api/v1/dashboard`

**Status:** Implementado
**Camada:** Analytics
**Fonte:** `dashboard.routes.ts`

| Metodo | Path | Descricao |
|---|---|---|
| `GET` | `/api/v1/dashboard` | Dados completos do dashboard. |
| `GET` | `/api/v1/dashboard/overview` | KPIs resumidos. |
| `POST` | `/api/v1/dashboard/transactions` | Cria transacao pelo fluxo do dashboard. |
| `GET` | `/api/v1/dashboard/transactions` | Historico usado pelo dashboard. |

**Response 200 - overview:**

```json
{
  "totalBalance": 2200,
  "monthlyIncome": 4500,
  "monthlyExpenses": 2300,
  "savingsRate": 48.89
}
```

---

## 6. Ranking - `/api/v1/ranking`

**Status:** Implementado
**Camada:** Gamification
**Fonte:** `ranking.routes.ts`, `ranking.types.ts`

| Metodo | Path | Descricao |
|---|---|---|
| `GET` | `/api/v1/ranking` | Dados consolidados de ranking do usuario. |
| `GET` | `/api/v1/ranking/leaderboard/global` | Ranking global. |
| `GET` | `/api/v1/ranking/leaderboard/friends` | Ranking de amigos. |
| `GET` | `/api/v1/ranking/leaderboard/categories` | Rankings por categoria. |
| `GET` | `/api/v1/ranking/user/:userId` | Posicao de um usuario. |
| `GET` | `/api/v1/ranking/score/:userId` | Calcula score do usuario. |
| `PUT` | `/api/v1/ranking/score/:userId` | Atualiza score. |
| `GET` | `/api/v1/ranking/achievements/:userId` | Conquistas do usuario. |
| `GET` | `/api/v1/ranking/badges/:userId` | Badges do usuario. |
| `POST` | `/api/v1/ranking/reset-season` | Reset sazonal. |

**Response 200 - leaderboard:**

```json
[
  {
    "position": 1,
    "userId": "1",
    "username": "Usuario Demo",
    "score": 1250,
    "level": 4,
    "league": "Prata",
    "change": 1,
    "trend": "up"
  }
]
```

**Nota de seguranca:** `PUT /score/:userId` e `POST /reset-season` devem ser tratados como endpoints administrativos. Se a implementacao atual nao restringir perfil, registrar lacuna em `BUSINESS_RULES.md` e `ARCHITECTURE.md`.

---

## 7. Custom Categories - `/api/v1/categories/custom`

**Status:** Implementado
**Camada:** Financial Core
**Fonte:** `customCategories.routes.ts`

| Metodo | Path | Descricao |
|---|---|---|
| `GET` | `/api/v1/categories/custom` | Lista categorias customizadas ativas do usuario. |
| `POST` | `/api/v1/categories/custom` | Cria categoria customizada. |
| `PUT` | `/api/v1/categories/custom/:id` | Atualiza categoria. |
| `DELETE` | `/api/v1/categories/custom/:id` | Remove categoria. |
| `POST` | `/api/v1/categories/custom/:id/archive` | Arquiva categoria. |

**Create body:**

```json
{
  "name": "Freelance",
  "type": "income"
}
```

**Response 201:**

```json
{
  "id": "3",
  "userId": "1",
  "name": "Freelance",
  "type": "income",
  "createdAt": "2026-04-28T10:00:00.000Z",
  "isActive": true
}
```

---

## 8. Spending Limits - `/api/v1/spending-limits`

**Status:** Parcial
**Motivo:** `spending-limits.routes.ts` existe, mas nao esta registrado em `infrastructure/http/routes/index.ts`. Enquanto nao for registrado, estes endpoints nao ficam acessiveis pelo prefixo global.

| Metodo | Path proposto | Descricao |
|---|---|---|
| `GET` | `/api/v1/spending-limits` | Lista limites. |
| `GET` | `/api/v1/spending-limits/:id` | Busca limite. |
| `GET` | `/api/v1/spending-limits/category/:category` | Busca por categoria. |
| `POST` | `/api/v1/spending-limits` | Cria limite. |
| `PUT` | `/api/v1/spending-limits/:id` | Atualiza limite. |
| `PATCH` | `/api/v1/spending-limits/:id/progress` | Atualiza gasto atual. |
| `DELETE` | `/api/v1/spending-limits/:id` | Remove limite. |
| `GET` | `/api/v1/spending-limits/categories/list` | Lista categorias elegiveis. |

**Create body:**

```json
{
  "category": "Lazer",
  "limitAmount": 500,
  "period": "monthly",
  "startDate": "2026-04-01",
  "endDate": "2026-04-30"
}
```

**Lacuna de persistencia:** nao ha tabela `spending_limits` em `schema.ts` ou `database.ts` no estado atual inspecionado. O modulo precisa de registro de rota e modelo fisico antes de ser tratado como implementado ponta a ponta.

---

## 9. WhatsApp e Webhooks

**Status:** Planejado

Nao ha rota `POST /api/v1/webhooks/whatsapp` registrada no roteador central atual. A integracao deve permanecer documentada como planejada ate existir rota, controller, schema e persistencia correspondentes.

**Contrato planejado:**

```json
{
  "message": "gastei 45 no almoco",
  "sender": "5511999999999",
  "timestamp": 1777372800
}
```

---

## 10. Matriz de Erros

| Codigo | Quando usar | Exemplo |
|---|---|---|
| `400` | Payload invalido, query invalida ou regra simples de validacao. | Valor menor ou igual a zero. |
| `401` | Token ausente, invalido ou expirado. | Requisicao sem `Authorization`. |
| `403` | Usuario autenticado sem permissao. | Tentativa de alterar recurso de outro usuario. |
| `404` | Recurso inexistente no escopo do usuario. | Transacao nao encontrada. |
| `409` | Conflito de negocio. | Email duplicado, categoria duplicada ativa. |
| `500` | Falha inesperada. | Erro de banco nao tratado. |

---

## 11. Checklist de Atualizacao da API

Ao alterar uma rota no backend:

1. Atualizar o arquivo de rotas do dominio.
2. Confirmar registro em `infrastructure/http/routes/index.ts`.
3. Atualizar tipos em `*.types.ts`.
4. Atualizar esta referencia.
5. Atualizar RF/RN/CSU relacionados.
6. Atualizar schema de banco se houver persistencia nova.
