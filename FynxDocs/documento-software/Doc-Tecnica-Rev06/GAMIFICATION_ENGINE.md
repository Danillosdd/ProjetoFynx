# Motor de Gamificacao - FYNX Rev. 06

> Documento especializado do contexto de gamificacao. Consolida score, ranking, ligas, achievements e badges com base em `domains/gamification`, `user_scores`, `achievements`, `user_achievements`, `badges` e `user_badges`.

---

## 1. Escopo

O contexto de gamificacao transforma comportamento financeiro em sinais de engajamento. Ele nao deve alterar a semantica financeira das transacoes; ele consome dados financeiros e produz:

- score;
- nivel;
- liga;
- ranking;
- achievements;
- badges;
- recomendacoes e estatisticas de competicao.

**Endpoints relacionados:**

| Endpoint | Uso |
|---|---|
| `GET /api/v1/ranking` | Dados consolidados. |
| `GET /api/v1/ranking/leaderboard/global` | Ranking global. |
| `GET /api/v1/ranking/leaderboard/friends` | Ranking de amigos. |
| `GET /api/v1/ranking/leaderboard/categories` | Rankings segmentados. |
| `GET /api/v1/ranking/user/:userId` | Ranking de usuario. |
| `GET /api/v1/ranking/score/:userId` | Calculo/consulta de score. |
| `PUT /api/v1/ranking/score/:userId` | Atualizacao de score. |
| `GET /api/v1/ranking/achievements/:userId` | Conquistas. |
| `GET /api/v1/ranking/badges/:userId` | Badges. |
| `POST /api/v1/ranking/reset-season` | Reset sazonal. |

---

## 2. Modelo de Dados

| Tabela | Papel |
|---|---|
| `user_scores` | Estado atual do score, nivel, liga, carry-over e streak. |
| `achievements` | Catalogo de conquistas com pontos. |
| `user_achievements` | Conquistas obtidas por usuario. |
| `badges` | Catalogo de badges visuais. |
| `user_badges` | Badges obtidos por usuario. |
| `transactions` | Fonte primaria para calculo financeiro. |
| `spending_goals` | Fonte para progresso e metas concluidas. |

---

## 3. Score

O score e um indicador derivado de comportamento financeiro. A documentacao deve refletir `ranking.service.ts`; se a formula mudar no codigo, esta secao deve ser atualizada.

### 3.1. Componentes recomendados

| Componente | Fonte | Intencao |
|---|---|---|
| `savingsScore` | Receitas, despesas e saldo liquido | Premiar economia real. |
| `goalsScore` | Metas concluidas e progresso | Premiar planejamento. |
| `consistencyScore` | Streak e atividade recorrente | Premiar habito. |
| `bonusScore` | Achievements e badges | Premiar marcos especiais. |
| `totalScore` | Soma ponderada | Ranking e liga. |

### 3.2. Exemplo de calculo documentavel

```json
{
  "savingsScore": 620,
  "goalsScore": 180,
  "consistencyScore": 90,
  "bonusScore": 50,
  "totalScore": 940,
  "breakdown": [
    {
      "category": "savings",
      "points": 620,
      "description": "Saldo liquido positivo no periodo."
    },
    {
      "category": "goals",
      "points": 180,
      "description": "Progresso em metas ativas."
    }
  ]
}
```

### 3.3. Regras de qualidade do score

- Score nao deve usar dados de outro usuario.
- Score deve tolerar usuario sem transacoes.
- Score deve documentar se usa dados mensais, semanais, anuais ou historicos.
- Mudanca manual de score (`PUT /score/:userId`) deve ser protegida por autorizacao administrativa.

---

## 4. Ligas

As ligas sao a representacao competitiva do score.

| Liga | Uso recomendado | Observacao |
|---|---|---|
| Bronze | Entrada e score baixo. | Valor default em `user_scores.league`. |
| Prata | Evolucao intermediaria. | Deve ser calculada pelo service. |
| Ouro | Alta disciplina. | Deve refletir score e percentil. |
| Platina | Usuario avancado. | Exige criterio claro. |
| Diamante | Elite competitiva. | Evitar criterio impossivel ou arbitrario. |

**Regra documental:** os limites numericos de cada liga so devem ser fixados aqui se estiverem fixos no codigo ou em arquivo de config. Caso contrario, documentar como calculo dinamico.

---

## 5. Ranking

### 5.1. Ranking global

Ordena usuarios por score, retornando posicao, username, score, nivel, liga e tendencia.

**Contrato base:**

```json
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
```

### 5.2. Rankings por categoria

Podem separar:

- economia;
- metas;
- consistencia.

Cada categoria deve ter fonte de dados e regra documentada no service.

### 5.3. Ranking de amigos

Existe endpoint para leaderboard de amigos. Se ainda nao houver modelo de amizade no schema, a resposta deve ser tratada como read model derivado, mockado ou funcionalidade parcial, conforme implementacao real.

---

## 6. Achievements

Achievements sao conquistas sem necessariamente serem exibidas como badge visual principal.

**Tabela fonte:** `achievements`
**Tabela de ganho:** `user_achievements`

| Campo | Origem | Uso |
|---|---|---|
| `name` | `achievements.name` | Nome da conquista. |
| `description` | `achievements.description` | Explicacao. |
| `icon` | `achievements.icon` | Representacao visual. |
| `points` | `achievements.points` | Bonus no score, se aplicavel. |
| `earned_at` | `user_achievements.earned_at` | Data de desbloqueio. |

**Regra de integridade:** `UNIQUE(user_id, achievement_id)` impede duplicidade.

---

## 7. Badges

Badges sao premios visuais. O catalogo e semeado por `INITIAL_BADGES` em `seed.ts`.

**Tabela fonte:** `badges`
**Tabela de ganho:** `user_badges`

| Campo | Origem | Uso |
|---|---|---|
| `id` | `badges.id` | Chave textual. |
| `name` | `badges.name` | Nome publico. |
| `description` | `badges.description` | Criterio narrativo. |
| `icon` | `badges.icon` | UI. |
| `category` | `badges.category` | Agrupamento. |
| `requirements` | `badges.requirements` | JSON de requisitos, se usado. |

**Regra de integridade:** `UNIQUE(user_id, badge_id)` impede duplicidade.

---

## 8. Eventos de Dominio

Eventos encontrados no contexto:

| Evento | Arquivo | Uso esperado |
|---|---|---|
| `TransactionCreatedEvent` | `domains/financial/events/transaction-created.event.ts` | Acionar recalculo de score ou badges por transacao. |
| `GoalCompletedEvent` | `domains/financial/events/goal-completed.event.ts` | Acionar conquistas por meta. |
| `BadgeEarnedEvent` | `domains/gamification/events/badge-earned.event.ts` | Notificar obtencao de badge. |

**Status:** a documentacao deve verificar, antes de afirmar comportamento assincrono, se os eventos estao efetivamente conectados ao `event-bus`.

---

## 9. Temporadas e Reset

`POST /api/v1/ranking/reset-season` existe no roteador de ranking.

**Requisitos para uso seguro:**

1. Exigir permissao administrativa.
2. Registrar auditoria.
3. Definir regra de carry-over.
4. Evitar execucao concorrente.
5. Preservar ou documentar historico da temporada encerrada.

Se qualquer item acima nao existir no codigo, o endpoint deve ser considerado funcionalmente incompleto do ponto de vista de governanca.

---

## 10. Anti-Manipulacao

Politicas recomendadas:

| Politica | Status documental | Motivo |
|---|---|---|
| Limite de ganho por periodo | Recomendado | Evita farming por muitas transacoes pequenas. |
| Auditoria de alteracao manual de score | Recomendado | Protege `PUT /score/:userId`. |
| Recalculo idempotente de score | Recomendado | Evita duplicar pontos por retry. |
| Validacao de ownership | Obrigatorio | Impede consultar ou alterar outro usuario indevidamente. |

---

## 11. UX de Gamificacao

O frontend deve expor gamificacao sem esconder o objetivo financeiro principal.

Elementos esperados:

- card de score;
- liga atual;
- progresso de nivel;
- ranking global;
- conquistas obtidas;
- badges disponiveis;
- feedback visual quando uma conquista e desbloqueada.

Esses elementos devem consumir `/api/v1/ranking` e endpoints auxiliares, sem recalcular regra critica no client.

---

## 12. Checklist de Consistencia

- `GAMIFICATION_ENGINE.md` deve bater com `ranking.service.ts`.
- Limites de ligas nao devem ser inventados se nao estiverem fixos no codigo.
- Achievements e badges devem bater com `schema.ts` e `seed.ts`.
- Endpoints administrativos devem ser marcados como sensiveis.
- Eventos so devem ser descritos como ativos se estiverem conectados.
