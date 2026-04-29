# FYNX Rev. 06 - Documentacao Tecnica Global

> Hub principal da documentacao Rev06. A revisao consolida a migracao do backend para uma organizacao orientada a dominios, mantendo uma estrutura hibrida: DDD para arquitetura e rastreabilidade classica para requisitos, fluxos, banco, API e artefatos academicos.

---

## 1. Controle de Revisoes

| Revisao | Data | Objetivo | Status |
|---|---|---|---|
| Rev05 | Abril/2026 | Documento tecnico monolitico, com padrao classico. | Referencia historica |
| Rev06 | Abril/2026 | Documentacao modular alinhada ao backend DDD e as atividades do professor. | Ativa |

---

## 2. Como Ler a Rev06

| Documento | Quando usar | Status |
|---|---|---|
| [Requisitos e Regras](./REQUISITOS_E_REGRAS.md) | Entender requisitos, regras, RNFs e rastreabilidade. | Refatorado |
| [Fluxos e Casos de Uso](./FLUXOS_E_CASOS_DE_USO.md) | Entender casos de uso, sad paths, processos e diagramas. | Refatorado |
| [Referencia da API](./REFERENCIA_DA_API.md) | Consumir ou manter contratos HTTP. | Refatorado |
| [Banco de Dados](./BANCO_DE_DADOS.md) | Entender DER, modelo logico, modelo fisico, SQL e dicionario. | Refatorado |
| [Arquitetura](./ARQUITETURA.md) | Entender arquitetura, camadas, UML, sequencias, modulos e ADRs. | Refatorado |
| [Motor de Gamificacao](./MOTOR_DE_GAMIFICACAO.md) | Entender score, ranking, badges e temporadas. | Refatorado |
| [Matriz de Rastreabilidade](./MATRIZ_DE_RASTREABILIDADE.md) | Validar compatibilidade com os artefatos academicos exigidos. | Novo |
| [Prototipos e Telas](./PROTOTIPOS_E_TELAS.md) | Consultar prototipos, telas, navegacao e comparativo visual. | Novo |
| [Evidencias da Implementacao](./EVIDENCIAS_DA_IMPLEMENTACAO.md) | Conferir evidencias de implementacao, CRUD, Git, SQL e camadas. | Novo |
| [Roteiro de Apresentacao](./ROTEIRO_DE_APRESENTACAO.md) | Roteiro da apresentacao do documento de requisitos. | Novo |
| [llms.txt](./llms.txt) | Dar contexto rapido para agentes de IA. | Refatorado |

**Ordem recomendada de leitura:** regras, workflows, API, banco, arquitetura, gamificacao, rastreabilidade, evidencias.

### 2.1. Compatibilidade com as Atividades do Professor

| Atividade | Artefato solicitado | Documento Rev06/FynxDocs | Status |
|---|---|---|---|
| 11/02/2026 | Documento de Requisitos Funcionais e Nao Funcionais | [Requisitos e Regras](./REQUISITOS_E_REGRAS.md) | Coberto |
| 25/02/2026 | Apresentacao do Documento de Requisitos | [Roteiro de Apresentacao](./ROTEIRO_DE_APRESENTACAO.md) | Coberto |
| 04/03/2026 | Termo de Abertura do Projeto | [termo_abertura.md](../../Termo-abertura/termo_abertura.md) | Coberto fora da Rev06 |
| 04/03/2026 | Mapeamento de Processos | [Fluxos e Casos de Uso](./FLUXOS_E_CASOS_DE_USO.md) | Coberto |
| 04/03/2026 | Prototipos UI/UX | [Prototipos e Telas](./PROTOTIPOS_E_TELAS.md) | Coberto por evidencias visuais |
| 04/03/2026 | Diagrama de Caso de Uso | [Fluxos e Casos de Uso](./FLUXOS_E_CASOS_DE_USO.md) | Coberto |
| 18/03/2026 | Diagrama de Classes | [Arquitetura](./ARQUITETURA.md) | Coberto |
| 18/03/2026 | Especificacao detalhada de Casos de Uso | [Fluxos e Casos de Uso](./FLUXOS_E_CASOS_DE_USO.md) | Coberto |
| 25/03/2026 | Arquitetura do Sistema | [Arquitetura](./ARQUITETURA.md) | Coberto |
| 25/03/2026 | Projeto de Banco de Dados | [Banco de Dados](./BANCO_DE_DADOS.md) | Coberto |
| 25/03/2026 | Prototipos refinados e fluxo de telas | [Prototipos e Telas](./PROTOTIPOS_E_TELAS.md) | Coberto |
| 25/03/2026 | Sequencia/Comunicacao e Modulos | [Fluxos e Casos de Uso](./FLUXOS_E_CASOS_DE_USO.md), [Evidencias da Implementacao](./EVIDENCIAS_DA_IMPLEMENTACAO.md) | Coberto |
| 15/04/2026 | Implementacao, camadas, CRUD, SQL, Git e comparativo | [Evidencias da Implementacao](./EVIDENCIAS_DA_IMPLEMENTACAO.md), [Prototipos e Telas](./PROTOTIPOS_E_TELAS.md) | Coberto |

Detalhamento completo em [MATRIZ_DE_RASTREABILIDADE.md](./MATRIZ_DE_RASTREABILIDADE.md).

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
| Zod/validacoes | Contrato de entrada | Reduz payload invalido nos controllers. |

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
|-- FynxApi/
|   |-- src/application/
|   |-- src/domains/
|   |-- src/infrastructure/
|   `-- src/shared/
|-- FynxV2/
|   |-- src/components/
|   |-- src/pages/
|   |-- src/hooks/
|   |-- src/refine/
|   `-- src/services/
`-- FynxDocs/
    `-- documento-software/Doc-Tecnica-Rev06/
```

Detalhes de pastas e responsabilidades estao em [ARQUITETURA.md](./ARQUITETURA.md).

---

## 7. Rastreabilidade

A Rev06 usa a seguinte cadeia:

```text
RF/RN -> CSU -> Endpoint -> Tabela -> Codigo -> Evidencia/Teste
```

Exemplo:

```text
RF003 Cadastro de transacao
-> CSU03 Cadastro de transacao financeira
-> POST /api/v1/transactions
-> transactions
-> domains/financial/transactions/*
-> FynxV2/tests/cadastrar-transacao-*.test.js
```

A matriz completa fica em [MATRIZ_DE_RASTREABILIDADE.md](./MATRIZ_DE_RASTREABILIDADE.md).

---

## 8. Diretrizes de Atualizacao

Ao alterar o sistema:

1. Mudou rota: atualizar `REFERENCIA_DA_API.md`.
2. Mudou regra de negocio: atualizar `REQUISITOS_E_REGRAS.md`.
3. Mudou fluxo de usuario: atualizar `FLUXOS_E_CASOS_DE_USO.md`.
4. Mudou tabela/migration: atualizar `BANCO_DE_DADOS.md`.
5. Mudou arquitetura/pasta/pattern: atualizar `ARQUITETURA.md`.
6. Mudou score/ranking/badge: atualizar `MOTOR_DE_GAMIFICACAO.md`.
7. Mudou tela/prototipo: atualizar `PROTOTIPOS_E_TELAS.md`.
8. Mudou evidencia academica: atualizar `EVIDENCIAS_DA_IMPLEMENTACAO.md` e `MATRIZ_DE_RASTREABILIDADE.md`.
9. Mudou contexto para agentes: atualizar `llms.txt`.

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
- possui rastreabilidade com RF, CSU, endpoint, tabela, codigo e evidencia quando aplicavel;
- mantem linguagem tecnica consistente.

### 10.1. Criterio Academico de Entrega

Antes de entregar a Rev06 ao professor, validar:

- todos os artefatos da tabela 2.1 possuem link direto;
- todo diagrama exigido esta inserido no documento responsavel;
- todo caso de uso possui ator, descricao, fluxo principal, fluxo alternativo, pre-condicoes e pos-condicoes;
- banco de dados possui DER, modelo logico, modelo fisico, dicionario e SQL;
- existe comparativo claro entre prototipo e sistema implementado;
- recursos parciais ou planejados nao sao apresentados como concluidos.
