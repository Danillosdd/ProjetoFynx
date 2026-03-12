# Termo de Abertura de Projeto (TAP)

## 1. Identificação do Projeto
* **Nome do Projeto:** FYNX - Sistema de Gestão Financeira
* **Data de Abertura:** 04/03/2026
* **Patrocinador:** 
* **Gerente do Projeto:** Equipe de Desenvolvimento (Matheus Bernardes, Giulianna Mota, Danilo Paiva)

---

## 2. Justificativa
A gestão financeira pessoal é frequentemente percebida como complexa e tediosa. O FYNX soluciona este problema centralizando as finanças e integrando dashboards, metas e orçamentos a um sistema motivacional. A gamificação transforma o monitoramento de gastos em uma "jornada", onde a economia gera pontos e reconhecimento (Ligas e Rankings), motivando os usuários a manterem-se engajados nas rotinas financeiras.

---

## 3. Objetivos do Projeto
* **Objetivo Geral:** Fornecer uma solução web moderna, acessível e motivadora para que usuários possam monitorar suas finanças, estabelecer metas de economia e acompanhar sua evolução financeira por meio de métricas de desempenho gamificadas.
* **Objetivos Específicos:**
    * Permitir o registro detalhado e seguro de receitas e despesas.
    * Fornecer dashboards e gráficos interativos para análise financeira (performance mensal e categorias).
    * Implementar sistema de gamificação com pontuação (FYNX Score), ranking, ligas e conquistas.
    * Disponibilizar acesso e interações inovadoras via WhatsApp utilizando IA para processamento de linguagem natural, incluindo consultas de dados e registro de transações por texto corrido.

---

## 4. Escopo Inicial
* **O que está Incluído:**
    * Módulo de Autenticação e Usuários (login seguro, gestão de rotas e logout);
    * Módulo de Transações (registro, listagem, filtros avançados, pesquisa e edição/exclusão flexível);
    * Módulo de Metas (metas de gastos - spending, metas de economia - saving limits e acompanhamento de progresso);
    * Módulo de Dashboard e Analytics (visão geral e gráficos interativos via Recharts);
    * Módulo de Gamificação (sistema de pontuação, progressão de ligas, e achievements);
    * Funcionalidades Auxiliares (categorias personalizadas e tour de onboarding);
    * Módulo de Acesso via WhatsApp (integração LLM, Meta Cloud API, Evolution API para cadastro de contas de WhatsApp, processamento de texto, listagem de informações e notificações proativas automatizadas).
* **O que está Excluído:** 
    * Integração automatizada com bancos (Open Finance / Open Banking).
    * Aplicativo Mobile Nativo (iOS / Android) - O sistema será uma solução Web Responsiva (Mobile-First) com extensão e controle via app WhatsApp.

---

## 5. Premissas
* A equipe de desenvolvimento dominará as tecnologias React, Node.js, TailwindCSS e APIs parceiras.
* Os usuários finais possuem contas de WhatsApp ativas e possuem acesso à internet.
* As APIs do Meta (Cloud API), Evolution API e LLM/IA manter-se-ão estáveis e atenderão a latência < 10 segundos prevista; mensagens não identificadas ativarão fallback do bot.

---

## 6. Restrições
* **Orçamento:** Não se aplica.
* **Prazo:** Final do Semestre letivo
* **Outros:** 
    * A interface e fluxos das notificações proativas (WhatsApp) requerem estrita conformidade com as Políticas da Meta (Message Templates aprovados e window-session) e leis de proteção de dados (LGPD), assegurando o ambiente para telefones verificados apenas.
    * Backend dependente da performance de queries em SQLite com arquivos locais.

---

## 7. Riscos Iniciais
* **Risco de Acurácia da IA:** Falhas na interpretação e extração das entidades de interesse de mensagens de transação (NLP fallback abaixo da métrica de sucesso de 90%).
* **Risco de Integração e Latência:** Instabilidades na comunicação HTTPS com ou suspensões de contas das soluções terceiras (API LLM e Meta API).
* **Risco de Adoção:** Baixo engajamento de usuários finais com a parte gamificada de rankings devido à recusa em cadastrar as despesas cotidianamente antes da integração fluida com WhatsApp estar 100% pronta.

---

## 8. Principais Entregas
* Documentação completa desde o Termo de Abertura até a documentação técnica do sistema.
* Sistema Web implementado e funcional (Módulos de Usuário, Dashboard, Gamificação e Transação).
* Módulo Inteligente de WhatsApp lançado e integrado ao sistema core e provedores de IA.
* Base de dados estruturada, íntegra (validações Zod Fullstack) e persistente.
* Testes em Produção/Homologação do sistema de processamento de pontuações de eventos.

---

## 9. Partes Interessadas (Stakeholders)
* **Internos:** Desenvolvedores e Idealizadores do Projeto (Matheus Bernardes, Giulianna Mota, Danilo Paiva).
* **Externos:** Usuários Finais buscando educação financeira e empresas provedoras de IA e APIs (Meta).

---

## 10. Aprovação
Espaço reservado para assinaturas do patrocinador e do gerente do projeto, formalizando a autorização para o início das atividades.

* **Assinatura do Patrocinador:** ___________________________ Data: 04/03/2026
* **Assinatura do Gerente do Projeto:** _____________________ Data: 04/03/2026