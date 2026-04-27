# Projeto de Persistência e Banco de Dados — FYNX (Rev. 06)

> Documentação exhaustiva do Schema de Banco de Dados, mapeamento Objeto-Relacional (Repository Pattern) e políticas de integridade aplicadas ao projeto FYNX sob as diretrizes do Domain-Driven Design (DDD).

---

## 1. Estratégia Arquitetural de Persistência

O sistema não se comunica com o Banco de Dados através de Controllers ou Entidades; toda a persistência está blindada pela camada de **Infraestrutura** via **Repository Pattern**. 

### 1.1. SGBD de Desenvolvimento: SQLite 3
O ambiente de desenvolvimento (e homologação local) roda sobre **SQLite 3** (`sqlite3` driver).
- **Vantagens**: Instalação *Zero-Config*, sem containers Docker. O arquivo `fynx.db` vive isolado na raiz do projeto.
- **Trade-offs (Trade-off Analysis)**: O SQLite lida mal com alta concorrência de escrita (`Database is locked`). Para contornar, a string de conexão força o Pragma `WAL` (Write-Ahead Logging) e o `FOREIGN_KEYS = ON`.

### 1.2. SGBD de Produção: PostgreSQL (Planejado)
A arquitetura DDD garante que trocar o banco signifique apenas escrever uma nova classe `PostgresTransactionRepository` que assine a interface `ITransactionRepository`. O `container.ts` injetará essa nova classe em Produção.

---

## 2. Diagrama Entidade-Relacionamento (DER Lógico)

O modelo relacional obedece às regras de normalização de Boyce-Codd (3FN) para evitar anomalias de atualização, enquanto utiliza desnormalização controlada em `user_scores` para performance de leitura de rankings.

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : "registra"
    USERS ||--o{ SPENDING_GOALS : "define"
    USERS ||--o{ BUDGETS : "planeja"
    USERS ||--|| USER_SCORES : "possui"
    USERS ||--o{ CUSTOM_CATEGORIES : "cria"
    USERS ||--o{ USER_ACHIEVEMENTS : "conquista"
    USERS ||--o{ USER_BADGES : "ganha"
    USERS ||--o{ WHATSAPP_SESSIONS : "interage"
    USERS ||--o{ WHATSAPP_NOTIFICATION_LOGS : "recebe"

    TRANSACTIONS }o--|| CATEGORIES : "pertence"
    TRANSACTIONS }o--o| SPENDING_GOALS : "vincula"
    
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : "cataloga"
    BADGES ||--o{ USER_BADGES : "cataloga"

    USERS {
        int id PK
        string name
        string email UK
        string password
        string whatsapp_phone UK
        int whatsapp_verified
    }

    TRANSACTIONS {
        int id PK
        int user_id FK
        decimal amount
        string type "income/expense"
        string category
        date date
        int spending_goal_id FK
        int saving_goal_id FK
    }

    SPENDING_GOALS {
        int id PK
        int user_id FK
        string title
        decimal target_amount
        string goal_type "spending/saving"
        string period "monthly/weekly/yearly"
        string status
    }

    BUDGETS {
        int id PK
        int user_id FK
        string name
        decimal total_amount
        decimal spent_amount
        string period "monthly/yearly"
    }

    USER_SCORES {
        int id PK
        int user_id FK UK
        int total_score
        int level
        string league
        int current_streak
    }

    WHATSAPP_SESSIONS {
        int id PK
        int user_id FK
        string phone_number
        text conversation_history
        datetime expires_at
    }
```

---

## 3. Catálogo de Tabelas e Status de Implementação

Abaixo, a listagem completa das 12 tabelas core do sistema, sua origem no domínio e o status atual da migração física.

| Tabela | Contexto (Domain) | Descrição | Status | Origem |
|---|---|---|---|---|
| `users` | Identity | Armazena credenciais, perfis e tokens de acesso. | ✅ Ativa | Core |
| `categories` | Financial | Categorias globais do sistema (fixas). | ✅ Ativa | Core |
| `custom_categories` | Financial | Categorias personalizadas criadas por cada usuário. | ✅ Ativa | Extensão |
| `transactions` | Financial | Lançamentos de crédito e débito. Tabela de maior volume. | ✅ Ativa | Core |
| `spending_goals` | Financial | Metas de economia e tetos de gastos. | ✅ Ativa | Core |
| `budgets` | Financial | Planejamento orçamentário periódico. | ✅ Ativa | Core |
| `spending_limits` | Financial | Sentinelas de limite de gasto por categoria. | ✅ Ativa | Extensão |
| `user_scores` | Gamification | Estado atual da pontuação, liga e streak do usuário. | ✅ Ativa | Gamif. |
| `achievements` | Gamification | Catálogo de conquistas disponíveis no sistema. | ✅ Ativa | Gamif. |
| `user_achievements` | Gamification | Tabela de junção (N:N) de conquistas desbloqueadas. | ✅ Ativa | Gamif. |
| `whatsapp_sessions` | Infrastructure | Contexto de conversas e memória da IA. | ✅ Ativa | WhatsApp |
| `whatsapp_notification_logs` | Infrastructure | Log de auditoria de mensagens enviadas. | ✅ Ativa | WhatsApp |

---

## 4. Dicionário de Dados Exhaustivo

Detalhamento técnico de cada atributo, constraints e lógica de persistência.

### 4.1. Tabela: `users`
| Coluna | Tipo | Null? | Default | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | No | PK | Identificador único serial. |
| `name` | TEXT | No | - | Nome completo exibido na interface. |
| `email` | TEXT | No | - | Email (Unique) usado como login. |
| `password` | TEXT | No | - | Hash Bcrypt da senha. |
| `whatsapp_phone` | TEXT | Yes | NULL | Número internacional (E.164). |
| `whatsapp_verified`| INTEGER | No | 0 | Booleano para status de verificação. |
| `whatsapp_otp` | TEXT | Yes | NULL | Código temporário de 6 dígitos. |
| `otp_expires_at` | DATETIME | Yes | NULL | Timestamp de expiração do OTP. |
| `created_at` | DATETIME | No | CURRENT | Data de criação da conta. |

### 4.2. Tabela: `transactions`
| Coluna | Tipo | Null? | Default | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | No | PK | Identificador único. |
| `user_id` | INTEGER | No | FK | Vínculo com `users.id` (CASCADE). |
| `amount` | DECIMAL | No | - | Valor absoluto. Constraint `> 0`. |
| `description` | TEXT | No | - | Título da transação (ex: "Almoço"). |
| `category` | TEXT | No | - | Nome da categoria vinculada. |
| `date` | DATE | No | - | Data do fato gerador financeiro. |
| `type` | TEXT | No | - | Enum: `income` ou `expense`. |
| `notes` | TEXT | Yes | NULL | Detalhes adicionais/observações. |
| `spending_goal_id` | INTEGER | Yes | FK | Meta de gasto vinculada (SET NULL). |
| `saving_goal_id` | INTEGER | Yes | FK | Meta de economia vinculada (SET NULL). |

### 4.3. Tabela: `spending_goals`
| Coluna | Tipo | Null? | Default | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | No | PK | Identificador único. |
| `user_id` | INTEGER | No | FK | Vínculo com `users.id`. |
| `title` | TEXT | No | - | Nome da meta (ex: "Viagem"). |
| `goal_type` | TEXT | No | 'spending' | Enum: `spending` ou `saving`. |
| `target_amount` | DECIMAL | No | - | Valor alvo a ser atingido. |
| `current_amount` | DECIMAL | No | 0 | Valor acumulado/gasto até o momento. |
| `period` | TEXT | No | - | Enum: `monthly`, `weekly`, `yearly`. |
| `status` | TEXT | No | 'active' | Enum: `active`, `completed`, `paused`. |

### 4.4. Tabela: `user_scores`
| Coluna | Tipo | Null? | Default | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | No | PK | Identificador único. |
| `user_id` | INTEGER | No | FK | Vínculo 1:1 com `users.id`. |
| `total_score` | INTEGER | No | 0 | Pontuação bruta acumulada. |
| `level` | INTEGER | No | 1 | Nível atual do usuário. |
| `league` | TEXT | No | 'Bronze' | Liga competitiva atual. |
| `current_streak` | INTEGER | No | 0 | Contador de dias consecutivos. |
| `max_streak` | INTEGER | No | 0 | Recorde histórico de streak. |
| `last_checkin` | DATE | Yes | NULL | Data do último check-in realizado. |

### 4.5. Tabelas de Gamificação (`achievements` & `user_achievements`)
- **`achievements`**: Tabela estática com `name`, `description` e `points`.
- **`user_achievements`**: Registra quando um `user_id` ganha um `achievement_id` em `earned_at`. Possui constraint `UNIQUE(user_id, achievement_id)` para evitar duplicidade de ganhos.

### 4.6. Tabelas de Infraestrutura (`whatsapp_sessions` & `logs`)
- **`whatsapp_sessions`**: Guarda `conversation_history` (TEXT/JSON) e `expires_at` para manter o contexto da IA.
- **`whatsapp_notification_logs`**: Log de auditoria para `notification_type` e `status` de entrega.

### 4.7. Tabela: `audit_logs` [NOVO]
| Coluna | Tipo | Null? | Default | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | No | PK | Identificador único. |
| `user_id` | INTEGER | No | FK | Usuário que gerou a ação. |
| `action` | TEXT | No | - | Ex: `PASSWORD_CHANGE`, `ACCOUNT_DELETE`. |
| `ip_address` | TEXT | Yes | - | Endereço IP do solicitante. |
| `user_agent` | TEXT | Yes | - | Navegador/Dispositivo usado. |
| `payload` | TEXT | Yes | - | JSON com detalhes do antes/depois. |
| `created_at` | DATETIME | No | CURRENT | Timestamp do evento. |

---

## 4. DDL: Modelo Físico Completo (Migrations & Init)

O script abaixo consolida as 12 tabelas originais, as extensões de infraestrutura e a camada de auditoria.

```sql
PRAGMA foreign_keys = ON;

-- [CORE] Identidade
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    whatsapp_phone TEXT UNIQUE,
    whatsapp_verified INTEGER DEFAULT 0,
    whatsapp_otp TEXT,
    otp_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- [FINANCIAL] Categorias e Transações
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS custom_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    notes TEXT,
    spending_goal_id INTEGER,
    saving_goal_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (spending_goal_id) REFERENCES spending_goals (id) ON DELETE SET NULL,
    FOREIGN KEY (saving_goal_id) REFERENCES spending_goals (id) ON DELETE SET NULL
);

-- [FINANCIAL] Planejamento
CREATE TABLE IF NOT EXISTS spending_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    goal_type TEXT DEFAULT 'spending' CHECK (goal_type IN ('spending', 'saving')),
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
    version INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS spending_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    category TEXT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    current_spent DECIMAL(10,2) DEFAULT 0,
    period TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'exceeded')) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- [GAMIFICATION] Progressão
CREATE TABLE IF NOT EXISTS user_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    total_score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    league TEXT DEFAULT 'Bronze',
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_checkin DATE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- [INFRA] WhatsApp, IA e Auditoria
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    phone_number TEXT NOT NULL,
    conversation_history TEXT,
    context_summary TEXT,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS whatsapp_notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    notification_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
    sent_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- [INDEXES] Performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON spending_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action);
```

---

## 5. Seed Data: Configurações Iniciais

Para o sistema funcionar corretamente, as seguintes tabelas devem ser populadas na inicialização.

### 5.1. Categorias Padrão (System Categories)
| Name | Type | Icon | Color |
|---|---|---|---|
| Alimentação | expense | `utensils` | `#FF5733` |
| Transporte | expense | `car` | `#33B5FF` |
| Moradia | expense | `home` | `#75FF33` |
| Salário | income | `wallet` | `#33FF57` |
| Investimentos | income | `chart-line` | `#FF33E9` |

### 5.2. Catálogo de Conquistas (Achievements)
| Name | Description | Points |
|---|---|---|
| Primeiro Passo | Criou sua primeira transação no FYNX. | 50 |
| Poupador Iniciante | Atingiu R$ 1.000,00 de saldo líquido. | 200 |
| Mestre do Hábito | 30 dias seguidos de check-in. | 500 |

---

## 6. Gestão de Concorrência e Performance

O uso do SQLite em um ambiente web exige cuidados específicos para evitar o erro `SQLITE_BUSY`.

### 6.1. Modo WAL (Write-Ahead Logging)
O sistema ativa o modo WAL via Pragma na inicialização:
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
```
Isso permite que leitores não bloqueiem escritores e vice-versa, melhorando a escalabilidade para múltiplos usuários simultâneos.

### 6.2. Estratégia de Indexação (Query Optimization)
- **`idx_transactions_user_date`**: Otimiza a busca do histórico e o cálculo de saldo mensal no Dashboard.
- **`idx_transactions_category`**: Acelera a filtragem por categoria e a geração de gráficos de pizza.
- **`idx_goals_user_status`**: Melhora a performance ao listar apenas as metas ativas na barra lateral.

### 6.3. Constraints e Gatilhos de Integridade
Além das Foreign Keys, utilizamos `CHECK` constraints para garantir a qualidade dos dados no nível físico:
- **`amount > 0`**: Impede que o sistema aceite transações negativas ou zeradas.
- **`type IN ('income', 'expense')`**: Garante que o domínio financeiro não receba tipos desconhecidos.
- **`UNIQUE(email)`**: Proteção de nível 1 contra duplicidade de contas.

---

## 7. Cascateamento e Gestão do Ciclo de Vida (Lifecycle)

A base possui inteligência DDL estrita para evitar **Orphan Records (Registros Órfãos)**:
- **Exclusão de Usuário**: A política `ON DELETE CASCADE` apaga instantaneamente todas as transações, metas e pontuações de um usuário se ele cancelar a conta. Isso simplifica absurdamente o código da camada de aplicação e respeita leis de proteção de dados (LGPD/GDPR).
- **Exclusão de Meta**: A política `ON DELETE SET NULL` na tabela `transactions` garante que se uma Meta for apagada, as transações vinculadas àquela meta perdem o vínculo (`goal_id = NULL`), mas **não são apagadas**, preservando o fluxo de caixa histórico do usuário.
- **Versionamento (Optimistic Locking)**: A coluna `version` na tabela `spending_goals` é incrementada a cada atualização. O repositório executa `UPDATE ... SET version = version + 1 WHERE id = ? AND version = ?`. Se nenhuma linha for afetada, ocorreu um conflito de escrita, disparando um erro de domínio.
