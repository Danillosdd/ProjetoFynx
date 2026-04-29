# Engenharia de Requisitos e Regras de Negocio - FYNX Rev. 06

> Documento de requisitos da Rev06. Mantem a estrutura de Domain-Driven Design, mas recupera a rastreabilidade classica da Rev05: requisito, regra de negocio, caso de uso, endpoint, tabela e arquivo de codigo.

---

## 1. Convencoes

| Codigo | Significado |
|---|---|
| `RF` | Requisito funcional. |
| `RNF` | Requisito nao funcional. |
| `RN` | Regra de negocio. |
| `PI` | Politica de integridade de dados. |
| `CSU` | Caso de uso em `FLUXOS_E_CASOS_DE_USO.md`. |
| `BC` | Bounded Context. |

**Status permitidos:** Implementado, Parcial, Planejado, Legado, Nao registrado.

---

## 2. Visao por Bounded Context

| Bounded Context | Responsabilidade | Modulos principais | Status |
|---|---|---|---|
| Identity & Access | Login, registro e protecao de rotas. | `identity/auth` | Implementado |
| Financial Core | Transacoes, metas, budgets, categorias customizadas e limites. | `financial/*` | Implementado com lacunas em spending limits |
| Analytics | Dashboard, indicadores e historico agregado. | `analytics/dashboard` | Implementado |
| Gamification | Ranking, score, ligas, badges e achievements. | `gamification/ranking` | Implementado com controles administrativos a revisar |
| Omnichannel WhatsApp | Registro e consulta por chat/voz. | Nao ha rota registrada | Planejado |
| Admin & Audit | Auditoria, operacao e governanca. | Parcial por logs/middlewares | Planejado/Parcial |

---

## 3. Requisitos Funcionais

### RF001 - Autenticacao de usuario

**Contexto:** Identity & Access
**Status:** Implementado
**Endpoint:** `POST /api/v1/auth/login`
**Codigo:** `FynxApi/src/domains/identity/auth`

**Objetivo:** permitir que um usuario registrado acesse o sistema por email e senha, recebendo um JWT para consumir rotas protegidas.

**Atores:** usuario registrado; API de autenticacao; middleware JWT.

**Fluxo principal:**

1. Usuario informa email e senha.
2. Frontend envia `POST /api/v1/auth/login`.
3. Controller valida payload minimo.
4. Service busca usuario por email.
5. Service compara senha enviada com hash persistido.
6. API assina JWT com identificador do usuario.
7. Frontend armazena token e redireciona para dashboard.

**Fluxos alternativos:**

- Email inexistente ou senha invalida retorna `401` com mensagem generica.
- Payload incompleto retorna `400`.
- Erro interno de banco retorna `500` e deve ser logado.

**Criterios de aceite:**

- Token deve permitir acesso a `/dashboard`, `/transactions`, `/goals`, `/ranking` e `/categories/custom`.
- A resposta nao pode revelar se o email existe.
- Nenhuma senha em texto puro pode ser persistida ou logada.

### RF002 - Registro de usuario

**Contexto:** Identity & Access
**Status:** Implementado
**Endpoint:** `POST /api/v1/auth/register`
**Tabelas:** `users`, `user_scores`

**Objetivo:** criar nova conta e preparar o usuario para os demais modulos.

**Fluxo principal:**

1. Visitante informa nome, email e senha.
2. API valida obrigatoriedade e formato de email.
3. Sistema verifica unicidade em `users.email`.
4. Senha e convertida para hash.
5. Registro e criado em `users`.
6. Perfil inicial de gamificacao deve ser criado em `user_scores`.
7. API retorna usuario e token.

**Fluxos alternativos:**

- Email duplicado retorna `409`.
- Senha fraca ou payload incompleto retorna `400`.
- Falha ao inicializar score deve impedir registro parcial ou ser tratada como pendencia transacional.

**Criterios de aceite:**

- Usuario novo inicia com `total_score = 0`, `level = 1`, `league = Bronze`.
- Email fica unico.
- Registro deve ser rastreavel em logs de erro, sem vazar senha.

### RF003 - Cadastro de transacao financeira

**Contexto:** Financial Core
**Status:** Implementado
**Endpoint:** `POST /api/v1/transactions`
**Tabela:** `transactions`
**CSU:** CSU03

**Objetivo:** registrar receitas e despesas como base de analytics, metas e gamificacao.

**Fluxo principal:**

1. Usuario abre formulario de transacao.
2. Informa tipo, valor, descricao, categoria e data.
3. Opcionalmente informa observacao e meta vinculada.
4. Frontend envia payload autenticado.
5. Middleware injeta `userId`.
6. Service valida `amount > 0`, tipo permitido e categoria.
7. Registro e persistido em `transactions`.
8. Sistema disponibiliza a nova transacao para dashboard e ranking.

**Fluxos alternativos:**

- Valor menor ou igual a zero retorna `400`.
- Categoria ausente retorna `400`.
- Meta vinculada inexistente retorna `404` ou `409`, conforme regra aplicada.

**Criterios de aceite:**

- Toda transacao pertence ao usuario autenticado.
- Datas retroativas sao aceitas.
- Transacoes futuras devem ter comportamento documentado antes de afetarem saldo corrente.

### RF004 - Consulta, filtros e paginacao de transacoes

**Contexto:** Financial Core
**Status:** Implementado
**Endpoint:** `GET /api/v1/transactions`

**Objetivo:** permitir que o usuario encontre historico financeiro por periodo, tipo, categoria, texto e paginacao.

**Criterios de aceite:**

- Suportar filtros `type`, `category`, `dateFrom`, `dateTo` e `search`.
- Retornar metadados de pagina.
- Nunca retornar transacoes de outro usuario.
- Manter performance aceitavel com indices por `user_id` e `date`.

### RF005 - Operacoes em lote

**Contexto:** Financial Core
**Status:** Implementado
**Endpoint:** `POST /api/v1/transactions/bulk`

**Objetivo:** executar acoes massivas em transacoes selecionadas.

**Criterios de aceite:**

- Operacao deve receber lista de IDs.
- Cada ID deve ser validado contra o usuario autenticado.
- Falhas parciais devem ser comunicadas no response.
- Operacoes que alteram saldo ou metas devem preservar integridade.

### RF006 - Metas de economia

**Contexto:** Financial Core
**Status:** Implementado
**Endpoints:** `/api/v1/goals/spending-goals` com `goalType = saving`

**Objetivo:** permitir que o usuario defina objetivos de acumulacao de dinheiro.

**Criterios de aceite:**

- Meta possui titulo, categoria, valor alvo, periodo, inicio, fim e status.
- Progresso pode ser atualizado diretamente ou por transacao.
- Ao atingir o alvo, status pode mudar para `completed`.

### RF007 - Metas de gasto e budgets

**Contexto:** Financial Core
**Status:** Implementado
**Endpoints:** `/api/v1/goals/spending-goals`, `/api/v1/goals/budgets`

**Objetivo:** planejar teto de gastos e orcamento por periodo.

**Criterios de aceite:**

- Meta de gasto usa `goalType = spending`.
- Budget representa plano financeiro por periodo.
- Deve haver calculo de gasto atual e restante.
- Estouro de limite deve ser sinalizado ao usuario.

### RF008 - Dashboard e analytics

**Contexto:** Analytics
**Status:** Implementado
**Endpoints:** `/api/v1/dashboard`, `/api/v1/dashboard/overview`, `/api/v1/dashboard/transactions`

**Objetivo:** consolidar indicadores financeiros para a tela principal.

**Criterios de aceite:**

- Exibir receitas, despesas, saldo e taxa de economia.
- Exibir historico recente.
- Exibir distribuicao por categoria.
- Consultas devem filtrar obrigatoriamente por `user_id`.

### RF009 - Onboarding e tour guiado

**Contexto:** Frontend Experience
**Status:** Implementado no frontend
**Codigo:** `FynxV2/src/tours`, `FynxV2/src/hooks/useTour.ts`

**Objetivo:** orientar novos usuarios nas telas principais.

**Criterios de aceite:**

- Tours devem existir para dashboard, transacoes, metas e ranking.
- Usuario deve poder iniciar manualmente o tour.
- Estado de conclusao nao deve bloquear uso da aplicacao.

### RF010 - Engine de score

**Contexto:** Gamification
**Status:** Implementado
**Endpoints:** `/api/v1/ranking`, `/api/v1/ranking/score/:userId`

**Objetivo:** calcular score com base em comportamento financeiro, metas e consistencia.

**Criterios de aceite:**

- Score deve ser derivado de dados financeiros do usuario.
- Alteracoes relevantes devem atualizar `user_scores`.
- Formula documentada em `MOTOR_DE_GAMIFICACAO.md` deve bater com `ranking.service.ts`.

### RF011 - Ranking e ligas

**Contexto:** Gamification
**Status:** Implementado
**Endpoints:** `/api/v1/ranking/leaderboard/*`

**Objetivo:** comparar usuarios por score e liga.

**Criterios de aceite:**

- Ranking global deve retornar posicao, usuario, score, nivel, liga e tendencia.
- Ranking por categoria deve separar criterios de economia, metas e consistencia.
- Dados sensiveis do usuario nao devem ser expostos.

### RF012 - Achievements e badges

**Contexto:** Gamification
**Status:** Implementado
**Endpoints:** `/api/v1/ranking/achievements/:userId`, `/api/v1/ranking/badges/:userId`

**Objetivo:** premiar marcos de uso e comportamento financeiro.

**Criterios de aceite:**

- O mesmo achievement/badge nao pode ser concedido duas vezes ao mesmo usuario.
- Tabelas `user_achievements` e `user_badges` devem garantir unicidade.
- Catalogo deve ser semeado por `seed.ts`.

### RF013 - Categorias customizadas

**Contexto:** Financial Core
**Status:** Implementado
**Endpoint:** `/api/v1/categories/custom`

**Objetivo:** permitir que usuarios criem categorias proprias de receita ou despesa.

**Fluxo principal:**

1. Usuario abre gerenciador de categorias.
2. Informa nome e tipo.
3. API valida duplicidade ativa por usuario.
4. Categoria e salva em `custom_categories`.
5. Categoria passa a aparecer nos formularios financeiros.

**Criterios de aceite:**

- Categoria customizada pertence a um unico usuario.
- Arquivamento deve preservar historico quando usado.
- Categoria duplicada ativa deve retornar conflito.

### RF014 - Spending limits

**Contexto:** Financial Core
**Status:** Parcial
**Codigo:** `financial/spending-limits` existe, mas nao esta registrado em `routes/index.ts`.

**Objetivo:** controlar limite de gasto por categoria.

**Lacunas atuais:**

- Rota central nao registra `/spending-limits`.
- Nao ha tabela `spending_limits` em `schema.ts` ou `database.ts` no estado inspecionado.

**Criterios de aceite para concluir implementacao:**

- Registrar rota no roteador central.
- Criar tabela fisica ou mapear para estrutura existente.
- Documentar regras de estouro, pausa e progresso.

### RF015 - Importacao/exportacao financeira

**Contexto:** Financial Core
**Status:** Planejado
**Base tecnica:** tipos `TransactionImport` existem em `transactions.types.ts`, mas nao ha rota registrada.

**Objetivo:** permitir importacao de CSV, Excel ou OFX.

**Criterios de aceite futuros:**

- Validar mapeamento de colunas.
- Prevenir duplicidades.
- Gerar relatorio de sucesso e falha.

### RF016 - Vinculacao WhatsApp via OTP

**Contexto:** Omnichannel
**Status:** Planejado

**Objetivo:** associar numero de WhatsApp a conta do usuario.

**Criterios de aceite futuros:**

- OTP de uso unico com expiracao.
- Tentativas limitadas.
- Registro de auditoria de sucesso e falha.

### RF017 - Registro por linguagem natural

**Contexto:** Omnichannel
**Status:** Planejado

**Objetivo:** converter mensagens de texto/voz em transacoes financeiras.

**Criterios de aceite futuros:**

- Extrair valor, descricao, tipo, categoria e data.
- Confirmar antes de persistir.
- Reusar caso de uso de criacao de transacao.

### RF018 - Consultas e notificacoes proativas

**Contexto:** Omnichannel
**Status:** Planejado

**Objetivo:** responder consultas e enviar alertas de limite/meta.

**Criterios de aceite futuros:**

- Consultas devem respeitar autenticacao e vinculacao do numero.
- Alertas devem evitar duplicidade.
- Logs de envio devem ser persistidos.

### RF019 - Auditoria de eventos criticos

**Contexto:** Admin & Audit
**Status:** Parcial/Planejado

**Objetivo:** rastrear acoes sensiveis e falhas operacionais.

**Criterios de aceite:**

- Logs HTTP e erros devem existir para diagnostico.
- Mudancas de score, reset de temporada e exclusoes devem ser auditaveis.
- Tabela `audit_logs` deve ser criada se a auditoria for persistida no banco.

### RF020 - Gestao de temporadas de gamificacao

**Contexto:** Gamification/Admin
**Status:** Implementado como endpoint sensivel a revisar
**Endpoint:** `POST /api/v1/ranking/reset-season`

**Objetivo:** recalcular temporada e carry-over.

**Criterios de aceite:**

- Endpoint deve exigir permissao administrativa.
- Operacao deve ser atomica.
- Deve gerar registro de auditoria.
- Deve preservar historico ou documentar a ausencia dele.

---

## 4. Requisitos Nao Funcionais

| ID | Categoria | Criterio mensuravel | Verificacao |
|---|---|---|---|
| RNF001 | Performance | Leituras comuns devem responder em ate 300 ms em base local de desenvolvimento. | Teste de carga local e analise de query. |
| RNF002 | Seguranca | Senhas devem ser persistidas como hash; rotas protegidas exigem JWT. | Revisao de auth service e middleware. |
| RNF003 | Isolamento multiusuario | Toda query de dado do usuario deve filtrar por `user_id`. | Revisao de services/repositories. |
| RNF004 | Manutenibilidade | Controllers devem delegar regra para services/use cases. | Revisao de arquitetura. |
| RNF005 | Persistencia | Operacoes multi-etapa devem usar transacao quando houver risco de estado parcial. | Revisao de `database.withTransaction`. |
| RNF006 | Observabilidade | Falhas HTTP, banco e performance devem ser logaveis. | Middlewares em `infrastructure/http/middlewares`. |
| RNF007 | UX responsiva | Telas principais devem funcionar em viewport mobile e desktop. | Testes manuais e automatizados no frontend. |
| RNF008 | Documentacao viva | Mudanca em rota, schema ou RF exige atualizacao cruzada da Rev06. | Checklist documental. |

---

## 5. Regras de Negocio

### 5.1. Financeiro

| ID | Regra | Aplica-se a | Rastreabilidade |
|---|---|---|---|
| RN001 | Transacao deve ter valor maior que zero. | Transactions | RF003, CSU03, `transactions` |
| RN002 | Toda transacao deve pertencer ao usuario autenticado. | Transactions | RF003, RF004, PI007 |
| RN003 | Toda transacao deve ter tipo `income` ou `expense`. | Transactions | RF003 |
| RN004 | Exclusao de transacao vinculada a meta deve estornar progresso quando a implementacao de vinculo estiver ativa. | Transactions, Goals | RF005, CSU de exclusao |
| RN005 | Categoria e obrigatoria para transacoes. | Transactions, Categories | RF003, RF013 |
| RN006 | Meta concluida nao deve ser alterada de forma que invalide historico sem regra explicita de reabertura. | Goals | RF006, RF007 |
| RN007 | Budget deve calcular gasto acumulado e restante por periodo. | Goals/Budgets | RF007 |
| RN008 | Categoria customizada ativa nao deve duplicar nome e tipo para o mesmo usuario. | Custom Categories | RF013 |

### 5.2. Gamificacao

| ID | Regra | Aplica-se a | Rastreabilidade |
|---|---|---|---|
| RN009 | Score e derivado de comportamento financeiro e consistencia. | Ranking | RF010 |
| RN010 | Usuario possui uma linha unica em `user_scores`. | Ranking | RF010, `user_scores.user_id UNIQUE` |
| RN011 | Badge e achievement nao podem ser concedidos duas vezes ao mesmo usuario. | Badges/Achievements | RF012 |
| RN012 | Reset de temporada deve preservar regra de carry-over documentada ou declarar estrategia alternativa. | Ranking | RF020 |

### 5.3. Planejado e Governanca

| ID | Regra | Status | Rastreabilidade |
|---|---|---|---|
| RN013 | OTP de WhatsApp expira e tem tentativas limitadas. | Planejado | RF016 |
| RN014 | Registro por linguagem natural exige confirmacao antes de salvar. | Planejado | RF017 |
| RN015 | Endpoint administrativo de reset nao deve ficar aberto a qualquer usuario autenticado. | A revisar | RF020 |

---

## 6. Politicas de Integridade de Dados

| ID | Politica | Estado atual |
|---|---|---|
| PI001 | `users.email` e unico. | Implementado em `schema.ts`. |
| PI002 | `transactions.user_id` referencia `users.id`. | Implementado sem `ON DELETE CASCADE` explicito no schema atual. |
| PI003 | `user_scores.user_id` e unico. | Implementado. |
| PI004 | `user_achievements` usa `UNIQUE(user_id, achievement_id)`. | Implementado. |
| PI005 | `user_badges` usa `UNIQUE(user_id, badge_id)`. | Implementado. |
| PI006 | `custom_categories` pertence a `user_id`. | Implementado em `database.ts`. |
| PI007 | Toda leitura/escrita multiusuario deve filtrar por `user_id`. | Obrigatorio por requisito; validar em services. |
| PI008 | `spending_limits` precisa de modelo fisico antes de ser considerado persistido. | Pendente. |

---

## 7. Matriz de Rastreabilidade

| Requisito | CSU | Endpoint | Tabela principal | Documento complementar |
|---|---|---|---|---|
| RF001 | CSU01 | `/auth/login` | `users` | `REFERENCIA_DA_API.md` |
| RF002 | CSU02 | `/auth/register` | `users`, `user_scores` | `BANCO_DE_DADOS.md` |
| RF003 | CSU03 | `/transactions` | `transactions` | `FLUXOS_E_CASOS_DE_USO.md` |
| RF004 | CSU07 | `/transactions`, `/dashboard` | `transactions` | `REFERENCIA_DA_API.md` |
| RF005 | CSU15 | `/transactions/bulk` | `transactions` | `REFERENCIA_DA_API.md` |
| RF006 | CSU05 | `/goals/spending-goals` | `spending_goals` | `BANCO_DE_DADOS.md` |
| RF007 | CSU04 | `/goals/budgets` | `budgets` | `BANCO_DE_DADOS.md` |
| RF010 | CSU08 | `/ranking/score/:userId` | `user_scores` | `MOTOR_DE_GAMIFICACAO.md` |
| RF012 | CSU08 | `/ranking/achievements/:userId`, `/ranking/badges/:userId` | `achievements`, `badges` | `MOTOR_DE_GAMIFICACAO.md` |
| RF013 | CSU13 | `/categories/custom` | `custom_categories` | `REFERENCIA_DA_API.md` |
| RF014 | CSU14 | Nao registrado | Pendente | `REFERENCIA_DA_API.md` |
| RF016-RF018 | CSU09-CSU12 | Planejado | Planejado | `FLUXOS_E_CASOS_DE_USO.md` |

---

## 8. Glossario Tecnico

| Termo | Definicao |
|---|---|
| Bounded Context | Fronteira semantica e tecnica de um dominio DDD. |
| JWT | Token assinado usado para autenticacao stateless. |
| User Score | Linha de estado de gamificacao em `user_scores`. |
| Spending Goal | Meta de controle de gasto armazenada em `spending_goals` com `goalType = spending`. |
| Saving Goal | Meta de acumulacao armazenada em `spending_goals` com `goalType = saving`. |
| Budget | Planejamento por periodo armazenado em `budgets`. |
| Custom Category | Categoria criada por usuario em `custom_categories`. |
| Spending Limit | Modulo parcial de limites por categoria; ainda precisa registro central e persistencia fisica. |
| Achievement | Conquista catalogada em `achievements`. |
| Badge | Premio visual catalogado em `badges`. |
| Sad Path | Fluxo de excecao ou erro esperado. |
| Domain Event | Evento emitido por uma mudanca relevante no dominio. |
| Repository Pattern | Padrao que isola persistencia concreta das regras de dominio. |
| Unit of Work | Padrao para agrupar mudancas em transacao atomica. |
