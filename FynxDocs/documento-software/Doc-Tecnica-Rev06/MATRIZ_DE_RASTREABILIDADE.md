# Matriz de Rastreabilidade Academica - FYNX Rev. 06

> Este documento garante compatibilidade entre os artefatos exigidos nas atividades do professor e a documentacao tecnica Rev06.

---

## 1. Mapa de Artefatos Solicitados

| Atividade | Artefato exigido | Documento Rev06 | Status | Observacao |
|---|---|---|---|---|
| 11/02/2026 | Documento de Requisitos Funcionais e Nao Funcionais | `REQUISITOS_E_REGRAS.md` | Completo com ajustes Rev06 | RFs, RNFs, regras e rastreabilidade. |
| 25/02/2026 | Apresentacao do Documento de Requisitos | `ROTEIRO_DE_APRESENTACAO.md` | Completo | Roteiro de slides para apresentacao. |
| 04/03/2026 | Termo de Abertura do Projeto | `../../Termo-abertura/termo_abertura.md` | Existente fora da Rev06 | Referenciado no hub Rev06. |
| 04/03/2026 | Mapeamento de Processos | `FLUXOS_E_CASOS_DE_USO.md` | Completo | Casos de uso, BPMN/fluxos e sequencias. |
| 04/03/2026 | Prototipos de telas UI/UX | `PROTOTIPOS_E_TELAS.md` | Completo por evidencias | Usa screenshots e artefatos visuais disponiveis. |
| 04/03/2026 | Diagrama de Caso de Uso | `FLUXOS_E_CASOS_DE_USO.md` | Completo | Referencia `imagens/caso-de-uso-rev06.png`. |
| 18/03/2026 | Diagrama de Classes com atributos, metodos e relacionamentos | `ARQUITETURA.md` | Completo | UML Mermaid alinhado ao DDD atual. |
| 18/03/2026 | Especificacao detalhada de Casos de Uso | `FLUXOS_E_CASOS_DE_USO.md` | Completo | CSU com ator, descricao, fluxo, alternativos, pre e pos-condicoes. |
| 25/03/2026 | Definicao da arquitetura do sistema | `ARQUITETURA.md` | Completo | Web, cliente-servidor, API, camadas, auth e criptografia. |
| 25/03/2026 | Projeto de Banco de Dados | `BANCO_DE_DADOS.md` | Completo | DER, logico, fisico, DDL e dicionario. |
| 25/03/2026 | Prototipos refinados | `PROTOTIPOS_E_TELAS.md` | Completo por evidencias | Screenshots de telas atuais e historicas. |
| 25/03/2026 | Mapa de navegacao / fluxo de telas | `FLUXOS_E_CASOS_DE_USO.md`, `PROTOTIPOS_E_TELAS.md` | Completo | Usa `DF - Fluxograma de usuario.svg` e mapa textual. |
| 25/03/2026 | Diagrama de Classes UML nivel projeto | `ARQUITETURA.md` | Completo | Diagrama de projeto com entidades, services e controllers. |
| 25/03/2026 | Diagrama de Sequencia ou Comunicacao | `FLUXOS_E_CASOS_DE_USO.md`, `ARQUITETURA.md` | Completo | Login, transacao, dashboard e gamificacao. |
| 25/03/2026 | Especificacao dos Modulos do Sistema | `EVIDENCIAS_DA_IMPLEMENTACAO.md`, `ARQUITETURA.md` | Completo | Modulos com objetivo, entradas, saidas e regras. |
| 15/04/2026 | Implementacao das funcionalidades definidas | `EVIDENCIAS_DA_IMPLEMENTACAO.md` | Completo com lacunas declaradas | Implementado, parcial e planejado separados. |
| 15/04/2026 | Organizacao em camadas e pastas | `ARQUITETURA.md`, `EVIDENCIAS_DA_IMPLEMENTACAO.md` | Completo | DDD incremental com camadas reais. |
| 15/04/2026 | Repositorio Git com commits frequentes | `EVIDENCIAS_DA_IMPLEMENTACAO.md` | Completo | Evidencia do historico local. |
| 15/04/2026 | CRUD completo | `EVIDENCIAS_DA_IMPLEMENTACAO.md`, `REFERENCIA_DA_API.md` | Completo por modulo exposto | Transactions, goals, budgets, custom categories. |
| 15/04/2026 | Regras de negocio implementadas | `REQUISITOS_E_REGRAS.md`, `EVIDENCIAS_DA_IMPLEMENTACAO.md` | Completo | Regras e evidencias por modulo. |
| 15/04/2026 | Validacoes de entrada | `REQUISITOS_E_REGRAS.md`, `REFERENCIA_DA_API.md` | Completo | Zod e validacoes de service/controller. |
| 15/04/2026 | Script SQL | `BANCO_DE_DADOS.md` | Completo | DDL consolidado e migrations. |
| 15/04/2026 | Conexao com banco de dados | `BANCO_DE_DADOS.md`, `EVIDENCIAS_DA_IMPLEMENTACAO.md` | Completo | SQLite via `database.ts`. |
| 15/04/2026 | Camada de persistencia | `ARQUITETURA.md`, `BANCO_DE_DADOS.md` | Completo | Repositories e services com persistencia atual. |
| 15/04/2026 | Comparativo prototipo x sistema implementado | `PROTOTIPOS_E_TELAS.md` | Completo | Matriz por tela. |

---

## 2. Rastreabilidade Requisito -> Implementacao

| RF | Caso de uso | Modulo | Endpoint principal | Tabela principal | Codigo fonte | Evidencia/teste |
|---|---|---|---|---|---|---|
| RF001 | CSU01 | Auth | `POST /api/v1/auth/login` | `users` | `domains/identity/auth/*` | `FLUXOS_E_CASOS_DE_USO.md`, `REFERENCIA_DA_API.md` |
| RF002 | CSU02 | Auth | `POST /api/v1/auth/register` | `users`, `user_scores` | `domains/identity/auth/*` | `FLUXOS_E_CASOS_DE_USO.md`, `BANCO_DE_DADOS.md` |
| RF003 | CSU03, CSU06 | Transactions | `POST /api/v1/transactions` | `transactions` | `domains/financial/transactions/*` | `FynxV2/tests/cadastrar-transacao-*.test.js` |
| RF004 | CSU07 | Transactions/Dashboard | `GET /api/v1/transactions`, `GET /api/v1/dashboard` | `transactions` | `domains/financial/transactions/*`, `domains/analytics/dashboard/*` | `REFERENCIA_DA_API.md` |
| RF005 | CSU15 | Transactions | `POST /api/v1/transactions/bulk` | `transactions` | `transactions.routes.ts` | `REFERENCIA_DA_API.md` |
| RF006 | CSU05, CSU06 | Goals | `POST /api/v1/goals/spending-goals` | `spending_goals` | `domains/financial/goals/*` | `FynxV2/tests/cadastrar-meta.test.js` |
| RF007 | CSU04 | Goals/Budgets | `/api/v1/goals/*` | `spending_goals`, `budgets` | `domains/financial/goals/*` | `FLUXOS_E_CASOS_DE_USO.md` |
| RF008 | CSU07 | Dashboard | `GET /api/v1/dashboard` | read model sobre `transactions` | `domains/analytics/dashboard/*` | `PROTOTIPOS_E_TELAS.md` |
| RF009 | Onboarding | Frontend | N/A | N/A | `FynxV2/src/tours/*` | `manual-usuario/manual.md` |
| RF010 | CSU08 | Ranking | `GET /api/v1/ranking/score/:userId` | `user_scores` | `domains/gamification/ranking/*` | `MOTOR_DE_GAMIFICACAO.md` |
| RF011 | CSU08 | Ranking | `GET /api/v1/ranking` | `user_scores` | `domains/gamification/ranking/*` | `PROTOTIPOS_E_TELAS.md` |
| RF012 | CSU08 | Badges/Achievements | `GET /api/v1/ranking/badges/:userId` | `badges`, `user_badges` | `domains/gamification/ranking/*` | `BANCO_DE_DADOS.md` |
| RF013 | CSU13 | Custom Categories | `/api/v1/categories/custom` | `custom_categories` | `domains/financial/custom-categories/*` | `manual-usuario/forms-categorias.png` |
| RF014 | CSU14 | Spending Limits | Nao exposto | `spending_limits` pendente | `domains/financial/spending-limits/*` | Parcial; documentar lacuna |
| RF015 | Import/export | Financial | Nao registrado | Nao definido | Nao encontrado | Planejado |
| RF016 | CSU09 | WhatsApp | Nao registrado | Nao definido | Nao encontrado | Planejado |
| RF017 | CSU10 | WhatsApp/IA | Nao registrado | Nao definido | Nao encontrado | Planejado |
| RF018 | CSU11, CSU12 | WhatsApp/Notifications | Nao registrado | Nao definido | Nao encontrado | Planejado |
| RF019 | Audit | Admin/Audit | Nao registrado | `audit_logs` pendente | middlewares de log | Parcial |
| RF020 | Temporadas | Ranking/Admin | `POST /api/v1/ranking/reset-season` | `user_scores` | `ranking.service.ts` | Exige autorizacao admin futura |

---

## 3. Regras de Compatibilidade

- Um artefato so e considerado entregue quando possui link a partir de `FynxRev06.md`.
- Diagramas salvos em `imagens/` devem ser inseridos ou referenciados no documento responsavel.
- Funcionalidade planejada nao pode ser descrita como implementada.
- Funcionalidade parcial deve declarar a lacuna tecnica e a acao necessaria.
- Todo requisito implementado deve apontar para caso de uso, endpoint ou tela, persistencia e codigo fonte.
