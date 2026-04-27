# API Reference — FYNX (Rev. 06)

> Documentação técnica detalhada dos contratos de API do sistema FYNX, estruturada com base nos princípios de Domain-Driven Design (DDD) e seguindo o formato de especificação RESTful.

---

## 🌐 Informações Globais

**Base URL (Desenvolvimento):** `http://localhost:3001/api/v1`

### Autenticação e Segurança
A maioria das rotas do sistema requer autenticação via **JWT (JSON Web Token)**. O token deve ser incluído no cabeçalho `Authorization` usando o esquema `Bearer`.

```http
Authorization: Bearer <seu_token_jwt>
```

### Rate Limiting
- **Global**: 100 requisições por IP a cada 15 minutos.
- **Login/Auth**: 5 tentativas por hora por IP.

### Códigos de Resposta Padrão
- `200 OK`: Requisição bem sucedida.
- `201 Created`: Recurso criado com sucesso.
- `400 Bad Request`: Erro de validação nos dados enviados (ex: Zod validation error).
- `401 Unauthorized`: Token ausente, inválido ou expirado.
- `403 Forbidden`: O usuário não tem permissão para acessar o recurso solicitado.
- `404 Not Found`: Recurso não encontrado.
- `429 Too Many Requests`: Limite de requisições excedido.
- `500 Internal Server Error`: Erro inesperado no servidor.

---

## 1. Módulo de Autenticação (`/api/v1/auth`)

### `POST /api/v1/auth/register`

Registra um novo usuário no sistema. Internamente, o sistema inicializa o perfil de gamificação (Score 0, Liga Bronze).

**Parameters (Body):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Nome completo do usuário. |
| email | string | Yes | Endereço de email válido e único. |
| password | string | Yes | Senha de acesso (mínimo 6 caracteres). |

**Response:**
- `201 Created`: Conta criada com sucesso e token retornado.
- `400 Bad Request`: E-mail já em uso ou dados inválidos.

**Example Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senhaForte123"
}
```

**Example Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "created_at": "2026-04-27T10:00:00.000Z"
  }
}
```

---

### `POST /api/v1/auth/login`

Autentica um usuário existente e gera um novo Token JWT.

**Parameters (Body):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | Email cadastrado. |
| password | string | Yes | Senha correspondente. |

**Response:**
- `200 OK`: Autenticação bem-sucedida.
- `401 Unauthorized`: Credenciais incorretas.

**Example Request:**
```json
{
  "email": "joao@email.com",
  "password": "senhaForte123"
}
```

**Example Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

---

## 2. Módulo de Transações (`/api/v1/transactions`)

*(Requer autenticação Bearer Token)*

### `GET /api/v1/transactions`

Lista o histórico de transações do usuário com suporte a paginação e múltiplos filtros.

**Parameters (Query):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | number | No | Página atual (Padrão: 1). |
| limit | number | No | Itens por página (Padrão: 10). |
| type | string | No | Filtra por `'income'` ou `'expense'`. |
| category | string | No | Nome da categoria exata. |
| dateFrom | date | No | Data inicial (YYYY-MM-DD). |
| dateTo | date | No | Data final (YYYY-MM-DD). |
| search | string | No | Busca textual na descrição ou notas. |

**Response:**
- `200 OK`: Lista paginada de transações com sumarização baseada na query.

**Example Request:**
`GET /api/v1/transactions?page=1&limit=5&type=expense`

**Example Response (200):**
```json
{
  "transactions": [
    {
      "id": 15,
      "amount": 50.00,
      "description": "Ifood",
      "category": "Alimentação",
      "type": "expense",
      "date": "2026-04-26",
      "notes": "Jantar",
      "spending_goal_id": null
    }
  ],
  "summary": {
    "totalIncome": 0,
    "totalExpenses": 50.00,
    "netAmount": -50.00,
    "transactionCount": 1
  },
  "totalCount": 1,
  "currentPage": 1,
  "totalPages": 1
}
```

---

### `POST /api/v1/transactions`

Registra uma nova receita ou despesa. Este endpoint dispara eventos de domínio para recalcular o FYNX Score e atualizar Metas vinculadas.

**Parameters (Body):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| amount | number | Yes | Valor monetário (deve ser > 0). |
| description | string | Yes | Breve título da transação. |
| category | string | Yes | Categoria (ex: 'Moradia', 'Salário'). |
| type | string | Yes | `'income'` ou `'expense'`. |
| date | date | Yes | Data (YYYY-MM-DD). |
| notes | string | No | Anotações adicionais. |
| spendingGoalId | number | No | ID da meta de gastos vinculada. |
| savingGoalId | number | No | ID da meta de economia vinculada. |

**Response:**
- `201 Created`: Transação registrada com sucesso.
- `400 Bad Request`: Validação falhou (ex: valor negativo).

**Example Request:**
```json
{
  "amount": 2500.00,
  "description": "Salário Mensal",
  "category": "Salário",
  "type": "income",
  "date": "2026-04-05"
}
```

---

### `POST /api/v1/transactions/bulk`

Executa ações massivas em múltiplas transações de uma só vez (ex: deletar várias linhas selecionadas na tabela).

**Parameters (Body):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| operation | string | Yes | Tipo de operação (suporta apenas `'delete'` no momento). |
| transactionIds | array | Yes | Lista de IDs (numéricos) das transações alvo. |

**Response:**
- `200 OK`: Operação concluída.

**Example Request:**
```json
{
  "operation": "delete",
  "transactionIds": [10, 11, 15]
}
```

**Example Response (200):**
```json
{
  "success": 3,
  "failed": 0,
  "message": "3 transações processadas com sucesso."
}
```

---

---

## 3. Módulo de Metas e Planejamento (`/api/v1/goals`)

*(Requer autenticação Bearer Token)*

### `GET /api/v1/goals/spending-goals`
Lista todas as metas financeiras (Saving ou Spending) do usuário.

**Parameters (Query):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| status | string | No | Filtra por `'active'`, `'completed'`, `'paused'`. |
| type | string | No | Filtra por `'saving'` ou `'spending'`. |

**Response (200):** Array de objetos `SpendingGoal`.

---

### `POST /api/v1/goals/spending-goals`
Cria uma nova meta ou teto de gastos.

**Parameters (Body):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Nome amigável da meta. |
| category | string | Yes | Categoria vinculada. |
| goal_type | string | Yes | `'spending'` (Gasto) ou `'saving'` (Economia). |
| target_amount | number| Yes | Valor objetivo ou teto. |
| period | string | Yes | Janela (`'monthly'`, `'weekly'`, `'yearly'`). |

---

### `GET /api/v1/goals/budgets`
Lista orçamentos globais planejados.

**Response (200):** Array de objetos `Budget`.

---

### `POST /api/v1/goals/budgets`
Cria um novo orçamento para um período.

**Parameters (Body):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | string | Yes | Ex: "Orçamento de Abril". |
| total_amount | number | Yes | Valor total disponível. |
| period | string | Yes | `'monthly'` ou `'yearly'`. |

---

### 3.3. Módulo: Categorias (`/categories`)

#### `GET /categories`
- **Descrição**: Retorna todas as categorias (sistema + personalizadas do usuário).
- **Response (200 OK)**:
```json
[
  { "id": "uuid", "name": "Alimentação", "type": "expense", "isCustom": false },
  { "id": "uuid", "name": "Freelance", "type": "income", "isCustom": true }
]
```

#### `POST /categories`
- **Descrição**: Cria uma categoria personalizada.
- **Body**: `{ "name": "string", "type": "income|expense", "color": "hex", "icon": "string" }`

---

### 3.4. Módulo: Limites e Orçamentos (`/limits` & `/budgets`)

#### `POST /limits`
- **Descrição**: Define um teto de gasto para uma categoria específica.
- **Body**:
```json
{
  "category": "Lazer",
  "limit_amount": 500.00,
  "period": "monthly"
}
```

#### `GET /budgets/summary`
- **Descrição**: Visão consolidada do orçamento mensal (Total vs Gasto).
- **Response (200 OK)**:
```json
{
  "total_budget": 5000.00,
  "total_spent": 3200.50,
  "remaining": 1799.50,
  "percentage": 64.01
}
```

---

### 3.5. Módulo: Gamificação (`/gamification`)

#### `GET /gamification/profile`
- **Descrição**: Retorna score, nível, liga e progresso de streak.
- **Response (200 OK)**:
```json
{
  "score": 1250,
  "level": 12,
  "league": "Prata",
  "streak": 5,
  "next_level_xp": 1500
}
```

#### `GET /gamification/achievements`
- **Descrição**: Lista todas as conquistas e o status do usuário.
- **Response (200 OK)**:
```json
[
  { "id": "badge_novice", "name": "Primeiro Passo", "unlocked": true, "unlockedAt": "2026-04-01" },
  { "id": "badge_saver", "name": "Poupador", "unlocked": false }
]
```

---

### 3.6. Módulo: Metas de Economia (`/goals`)

#### `POST /goals`
- **Descrição**: Cria uma nova meta (ex: "Viagem", "Reserva").
- **Body**:
```json
{
  "title": "Novo PC",
  "target_amount": 4000.00,
  "deadline": "2026-12-31"
}
```

---

## 4. Tratamento de Erros e Validação

O FYNX utiliza o **Zod** para validação de contrato e retorna erros estruturados para facilitar o tratamento no Frontend.

### 4.1. Erro de Validação (400 Bad Request)
Ocorre quando o payload enviado não respeita o schema do Domínio.
```json
{
  "error": "Validation Failed",
  "details": [
    {
      "path": ["amount"],
      "message": "Number must be greater than 0"
    },
    {
      "path": ["category"],
      "message": "Required"
    }
  ]
}
```

### 4.2. Erro de Negócio (409 Conflict)
Ocorre quando uma regra de negócio (Invariante) é violada.
```json
{
  "error": "Business Rule Violation",
  "code": "RN006",
  "message": "Metas concluídas não podem ser alteradas."
}
```

### 4.3. Códigos de Status HTTP Padronizados
| Código | Significado | Contexto no FYNX |
|---|---|---|
| `200` | OK | Sucesso em GET, PUT ou DELETE. |
| `201` | Created | Sucesso na criação de recurso (Transação, User). |
| `400` | Bad Request | Erro de sintaxe ou validação Zod. |
| `401` | Unauthorized | Token JWT ausente, inválido ou expirado. |
| `403` | Forbidden | Usuário tentando acessar recurso de outro `user_id`. |
| `404` | Not Found | Recurso não encontrado no banco. |
| `409` | Conflict | Violação de RN ou Duplicate Entry (Email). |
| `500` | Internal Error | Erro não tratado no servidor. |

---

## 5. Webhooks e Integrações Externas

### 5.1. WhatsApp Webhook (Evolution API)
O FYNX ouve mensagens do WhatsApp para processar via LLM.

- **Endpoint**: `POST /api/v1/webhooks/whatsapp`
- **Payload Esperado**:
```json
{
  "message": "gastei 45 no ifood",
  "sender": "5511999999999",
  "timestamp": 1712345678
}
```

---

## 6. Query Parameters e Paginação

Em listagens de transações (`GET /transactions`), suportamos os seguintes filtros:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `page` | Integer | Número da página (default: 1). |
| `limit` | Integer | Itens por página (default: 20). |
| `startDate` | ISO Date | Filtro de início do período. |
| `endDate` | ISO Date | Filtro de fim do período. |
| `category` | String | Filtrar por categoria específica. |
| `type` | String | `income` ou `expense`. |
