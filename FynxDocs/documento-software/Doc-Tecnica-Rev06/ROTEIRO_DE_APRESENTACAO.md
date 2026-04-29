# Apresentacao do Documento de Requisitos - FYNX Rev. 06

> Roteiro de apresentacao para a atividade de 25/02/2026, alinhado ao documento de requisitos mais recente.

---

## 1. Objetivo da Apresentacao

Apresentar a visao do FYNX, seus requisitos funcionais e nao funcionais, regras de negocio, atores principais, modulos e rastreabilidade entre requisito, caso de uso e implementacao.

---

## 2. Roteiro de Slides

| Slide | Titulo | Conteudo |
|---|---|---|
| 1 | FYNX | Sistema web de gestao financeira gamificada. |
| 2 | Problema | Usuarios precisam registrar gastos, acompanhar metas e manter disciplina financeira. |
| 3 | Proposta | Unir controle financeiro, dashboard, metas e gamificacao. |
| 4 | Atores | Usuario autenticado, visitante, sistema, admin futuro, provedor WhatsApp planejado. |
| 5 | Escopo implementado | Auth, transacoes, metas, budgets, dashboard, ranking e categorias. |
| 6 | Escopo parcial/planejado | Spending limits parcial; WhatsApp/IA e auditoria persistida planejados. |
| 7 | Requisitos funcionais | Resumo RF001 a RF020 com status. |
| 8 | Requisitos nao funcionais | Seguranca, performance, usabilidade, manutenibilidade e integridade. |
| 9 | Casos de uso | Diagrama de caso de uso e CSUs principais. |
| 10 | Regras de negocio | Valor positivo, ownership por usuario, JWT, score, ligas e metas. |
| 11 | Rastreabilidade | RF -> CSU -> endpoint -> tabela -> codigo -> teste. |
| 12 | Encerramento | Status da Rev06, lacunas conhecidas e proximos passos. |

---

## 3. Mensagem Central

O FYNX entrega um nucleo financeiro funcional com autenticacao, transacoes, metas, dashboard e gamificacao. A Rev06 documenta o sistema de forma modular e diferencia claramente o que esta implementado, parcial e planejado.

---

## 4. Referencias para Apresentacao

| Tema | Documento |
|---|---|
| Requisitos | `REQUISITOS_E_REGRAS.md` |
| Casos de uso e processos | `FLUXOS_E_CASOS_DE_USO.md` |
| API | `REFERENCIA_DA_API.md` |
| Banco | `BANCO_DE_DADOS.md` |
| Arquitetura | `ARQUITETURA.md` |
| Prototipos e UI | `PROTOTIPOS_E_TELAS.md` |
| Evidencias de implementacao | `EVIDENCIAS_DA_IMPLEMENTACAO.md` |
| Rastreabilidade | `MATRIZ_DE_RASTREABILIDADE.md` |
