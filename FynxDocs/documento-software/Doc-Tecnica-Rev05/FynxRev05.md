# Documentação Técnica de Desenvolvimento - FYNX (Rev. 05)

## Projeto FYNX - Sistema de Gestão Financeira

**Desenvolvido por:** Matheus Bernardes, Giulianna Mota, Danilo Paiva  
**Revisão Técnica:** Agentic AI (Baseado na Codebase Atual)

## Sumário

1.  **Descrição Geral do Sistema**
    *   1.1. Tema e Objetivo
    *   1.2. Justificativa e Delimitação do Problema
    *   1.3. Público-Alvo
2.  **Engenharia de Requisitos**
    *   2.1. Requisitos Funcionais (RF)
    *   2.2. Requisitos Não Funcionais (RNF)
    *   2.3. Regras de Negócio (RN)
3.  **Modelagem e Design do Sistema**
    *   3.1. Diagramas de Caso de Uso
    *   3.2. Mapeamento de Processos (Fluxogramas)

## 1. Descrição Geral do Sistema

### 1.1. Tema e Objetivo
O projeto aborda o desenvolvimento de uma plataforma digital para gestão de finanças pessoais, denominada **FYNX**. O objetivo é fornecer uma solução web moderna, acessível e motivadora para que usuários possam monitorar suas finanças, estabelecer metas de economia e acompanhar sua evolução financeira por meio de métricas de desempenho gamificadas.

### 1.2. Justificativa e Delimitação do Problema
A gestão financeira pessoal é frequentemente percebida como complexa e tediosa. O FYNX soluciona este problema centralizando as finanças e integrando dashboards, metas e orçamentos a um sistema motivacional. A gamificação transforma o monitoramento de gastos em uma "jornada", onde a economia gera pontos e reconhecimento (Ligas e Rankings).

### 1.3. Público-Alvo
Destina-se a qualquer pessoa que busca estruturar e controlar suas finanças de forma prática, otimizada e descontraída.

---

## 2. Engenharia de Requisitos

### 2.1. Requisitos Funcionais (RF)

### 2.1.1. Módulo de Autenticação e Usuários

**RF001 - Autenticação de Usuário**
- **Descrição**: O sistema permite que usuários acessem suas contas de forma segura.
- **Detalhes**:
  - Login via email e senha.
  - Validação de credenciais no backend com retorno de mensagens de erro específicas.
  - Redirecionamento automático para o Dashboard após sucesso.
  - Persistência de sessão (o usuário permanece logado ao recarregar).
- **Status**: ✅ Implementado (`AuthController`, `AuthContext`).

**RF002 - Gestão de Perfil**
- **Descrição**: O usuário pode visualizar seus dados básicos e encerrar a sessão.
- **Detalhes**:
  - Exibição do nome e email do usuário logado na interface.
  - Funcionalidade de Logout com confirmação.
  - Proteção de rotas (redirecionamento para login se não autenticado).
- **Status**: ✅ Implementado.

### 2.1.2. Módulo de Transações

**RF003 - Registro de Transações**
- **Descrição**: Permitir o cadastro detalhado de receitas e despesas.
- **Detalhes**:
  - Campos: Valor, Descrição, Categoria, Tipo (Receita/Despesa), Data.
  - Campos Opcionais: Método de Pagamento, Notas, Vinculação a Meta.
  - Validação de dados (valores positivos, campos obrigatórios).
  - Categorização automática sugerida ou seleção manual.
- **Status**: ✅ Implementado (`TransactionsController`, `AddTransactionSheet`).

**RF004 - Listagem e Filtros Avançados**
- **Descrição**: Visualização do histórico financeiro com ferramentas de busca.
- **Detalhes**:
  - **Paginação**: Suporte a grandes volumes de dados (carregamento sob demanda).
  - **Filtros**: Por Tipo (Receita/Despesa), Categoria, Intervalo de Datas.
  - **Busca**: Pesquisa textual por descrição.
  - **Ordenação**: Por Data, Valor ou Categoria.
- **Status**: ✅ Implementado (`useList` hook, filtros no backend).

**RF005 - Edição e Exclusão**
- **Descrição**: Manutenção dos registros financeiros.
- **Detalhes**:
  - Edição de qualquer campo de uma transação existente.
  - Exclusão unitária com confirmação (modal de alerta).
  - **Exclusão em Lote**: Seleção múltipla de transações para remoção simultânea.
- **Status**: ✅ Implementado.

### 2.1.3. Módulo de Metas (Goals)

**RF006 - Gestão de Metas de Economia (Saving Goals)**
- **Descrição**: Criar objetivos para acumular dinheiro.
- **Detalhes**:
  - Definição de valor alvo e data limite.
  - Vinculação de receitas específicas para compor o progresso da meta.
  - Visualização de barra de progresso e percentual concluído.
- **Status**: ✅ Implementado (`GoalsController`, `WalletGoalsWidget`).

**RF007 - Gestão de Metas de Gastos (Spending Goals)**
- **Descrição**: Estabelecer tetos de gastos para controle orçamentário.
- **Detalhes**:
  - Definição de limite de gasto por categoria e período (mensal, semanal).
  - Monitoramento em tempo real do valor consumido vs. limite.
  - Alertas visuais (cores) conforme o limite se aproxima.
- **Status**: ✅ Implementado.

### 2.1.4. Módulo de Dashboard e Analytics

**RF008 - Visão Geral (Overview)**
- **Descrição**: Painel principal com indicadores chave de desempenho (KPIs).
- **Detalhes**:
  - Cards de Saldo Total, Receita Mensal, Despesa Mensal e Taxa de Economia.
  - Indicadores de tendência (comparativo com período anterior).
- **Status**: ✅ Implementado (`DashboardController`, `Index.tsx`).

**RF009 - Visualizações Gráficas**
- **Descrição**: Gráficos interativos para análise financeira.
- **Detalhes**:
  - **Distribuição por Categoria**: Gráfico de Pizza (Pie Chart) alternável entre Receitas e Despesas.
  - **Evolução Diária**: Gráfico de Área comparando Receitas vs. Despesas ao longo do tempo.
  - **Performance Mensal**: Gráfico de Barras com histórico dos últimos meses.
- **Status**: ✅ Implementado (biblioteca `Recharts`).

### 2.1.5. Módulo de Gamificação

**RF010 - Sistema de Pontuação (FYNX Score)**
- **Descrição**: Recompensar bons comportamentos financeiros com pontos.
- **Regras Implementadas**:
  - +10 pontos por registrar transação.
  - +50 pontos por atingir uma meta.
  - +20 pontos por manter-se dentro do orçamento.
  - -30 pontos por estourar o orçamento.
- **Status**: ✅ Implementado (`UserScores`, triggers no backend).

**RF011 - Ranking e Ligas**
- **Descrição**: Sistema competitivo para engajamento.
- **Detalhes**:
  - Classificação dos usuários em Ligas: Ferro, Bronze, Prata, Ouro, Diamante.
  - Leaderboard global mostrando a posição de todos os usuários.
  - Destaque para a posição do usuário atual.
- **Status**: ✅ Implementado (`RankingController`, página `Ranking`).

**RF012 - Conquistas (Achievements)**
- **Descrição**: Badges desbloqueáveis por marcos alcançados.
- **Detalhes**:
  - Sistema de verificação de critérios para desbloqueio.
  - Exibição de conquistas no perfil do usuário.
- **Status**: ✅ Implementado (Tabelas `achievements` e `user_achievements`).

### 2.1.6. Funcionalidades Auxiliares

**RF013 - Categorias Personalizadas**
- **Descrição**: Flexibilidade na categorização.
- **Detalhes**:
  - Usuário pode criar suas próprias categorias além das padrão do sistema.
  - Categorias personalizadas aparecem nos filtros e formulários.
- **Status**: ✅ Implementado (`CustomCategoriesController`).

**RF014 - Limites de Gastos (Spending Limits)**
- **Descrição**: Controle rígido por categoria.
- **Detalhes**:
  - Definição de limite máximo para categorias específicas.
  - Monitoramento de progresso e status (Normal, Alerta, Excedido).
- **Status**: ✅ Implementado.

**RF015 - Onboarding (Tour Guiado)**
- **Descrição**: Tutorial interativo para novos usuários.
- **Detalhes**:
  - Tour passo-a-passo explicando as funcionalidades do Dashboard.
  - Detecção de primeiro acesso.
  - Opção de pular o tutorial.
- **Status**: ✅ Implementado (`Driver.js`, `useTour`).

### 2.1.7. Módulo de Acesso via WhatsApp

> **Infraestrutura do Canal**: O módulo utiliza arquitetura híbrida — **Meta Cloud API** (conversação bidirecional com o usuário) + **Evolution API** (notificações proativas de sistema).

**RF016 - Vinculação de Número de WhatsApp**
- **Descrição**: O usuário associa seu número de WhatsApp à conta FYNX por meio da plataforma web, habilitando o acesso via canal de mensagens.
- **Detalhes**:
  - Na tela de **Perfil do Usuário**, o sistema exibe uma seção "Conectar WhatsApp".
  - O usuário informa seu número de telefone (com DDI) e aciona a verificação.
  - O sistema envia um **código OTP** via WhatsApp (Meta Cloud API) para confirmar a posse do número.
  - Após validação, o número é vinculado ao `user_id` e salvo na base de dados.
  - O usuário pode desvincular ou alterar o número a qualquer momento pelo perfil.
  - Cada número de WhatsApp deve ser único no sistema (não pode estar vinculado a duas contas).
- **Status**: 🔲 A implementar.

**RF017 - Registro e Gestão de Transações via WhatsApp**
- **Descrição**: O usuário registra receitas e despesas por meio de mensagens em linguagem natural no WhatsApp, processadas por IA.
- **Detalhes**:
  - O usuário envia uma mensagem de texto livre (ex.: *"gastei 45 reais no mercado hoje"* ou *"recebi meu salário de 3000"*).
  - Um modelo de IA (LLM) interpreta a mensagem e extrai os parâmetros: **Tipo** (receita/despesa), **Valor**, **Categoria** (inferida ou solicitada), **Data** e **Descrição**.
  - Caso algum campo obrigatório não seja identificado, a IA solicita a informação de forma contextualizada ao usuário antes de confirmar o registro.
  - A IA confirma o registro com um resumo da transação criada.
  - Via linguagem natural, o usuário também pode:
    - **Listar** transações recentes (ex.: *"quais foram meus gastos esta semana?"*).
    - **Editar** uma transação existente (ex.: *"corrija o valor do último lançamento para 60 reais"*).
    - **Excluir** uma transação (ex.: *"apaga o registro do almoço de ontem"*).
- **Status**: 🔲 A implementar.

**RF018 - Consulta de Metas e Gamificação via WhatsApp**
- **Descrição**: O usuário consulta o status de suas metas, pontuação e ranking por meio de mensagens no WhatsApp.
- **Detalhes**:
  - **Metas de Economia**: Consulta de progresso, valor acumulado e data limite (ex.: *"qual o progresso da minha meta de viagem?"*).
  - **Metas de Gastos**: Consulta do consumo atual vs. limite por categoria (ex.: *"quanto já gastei em alimentação este mês?"*).
  - **Pontuação (FYNX Score)**: Consulta do score atual e eventos recentes de pontuação.
  - **Ranking e Liga**: Consulta da liga atual e posição no leaderboard global.
  - A IA responde com dados formatados em texto simples, legíveis no WhatsApp.
- **Status**: 🔲 A implementar.

**RF019 - Notificações Proativas via WhatsApp**
- **Descrição**: O sistema envia alertas automáticos ao usuário via WhatsApp (Evolution API) com base em eventos da plataforma.
- **Detalhes**:
  - **Alerta de Orçamento (75%)**: Notificação quando o consumo de uma categoria atingir 75% do limite definido.
  - **Orçamento Excedido**: Notificação imediata ao ultrapassar o limite da meta de gastos.
  - **Meta de Economia Concluída**: Notificação ao atingir 100% de uma saving goal.
  - **Resumo Periódico** *(opcional)*: Envio de um resumo financeiro semanal ou mensal.
  - O usuário pode optar por desativar notificações específicas na tela de Perfil da plataforma web.
  - As notificações são enviadas exclusivamente para o número vinculado e verificado (RF016).
- **Status**: 🔲 A implementar.

---

## 2. Requisitos Não Funcionais (RNF)

### 2.1. Performance

**RNF001 - Tempo de Resposta da API**
- **Critério**: Endpoints críticos (listagem, dashboard) devem responder em < 200ms.
- **Implementação**: Otimização de queries SQL, uso de índices no SQLite e paginação de dados.

**RNF002 - Renderização Frontend**
- **Critério**: Interface fluida e sem travamentos.
- **Implementação**:
  - Uso de **Virtualização** (`react-window`) para listas longas de transações.
  - **Lazy Loading** de rotas e componentes pesados.
  - Gerenciamento de estado otimizado com **TanStack Query** (caching e deduping de requisições).

**RNF003 - Tamanho do Bundle**
- **Critério**: Carregamento inicial rápido.
- **Implementação**: Build otimizado com **Vite**, tree-shaking de bibliotecas (lucide-react, recharts).

### 2.2. Usabilidade e UX

**RNF004 - Responsividade (Mobile-First)**
- **Critério**: Layout adaptável a qualquer tamanho de tela (Mobile, Tablet, Desktop).
- **Implementação**: Uso extensivo de classes utilitárias do **TailwindCSS** (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

**RNF005 - Feedback Visual**
- **Critério**: O usuário deve sempre saber o status de suas ações.
- **Implementação**:
  - Sistema de **Toasts** para sucesso/erro em operações.
  - Skeletons e Spinners durante carregamento de dados.
  - Confirmações (Dialogs) para ações destrutivas.

**RNF006 - Tema e Acessibilidade**
- **Critério**: Conforto visual e acessibilidade básica.
- **Implementação**:
  - Suporte a **Dark Mode** e Light Mode.
  - Componentes baseados em **Radix UI** (focados em acessibilidade, navegação por teclado).

### 2.3. Confiabilidade e Segurança

**RNF007 - Persistência de Dados**
- **Critério**: Garantia de que dados não sejam perdidos.
- **Implementação**: Banco de dados relacional **SQLite** (arquivo `fynx.db`) com transações ACID.

**RNF008 - Segurança de Dados Sensíveis**
- **Critério**: Proteção de credenciais.
- **Implementação**: Senhas armazenadas apenas como hash (**bcrypt**). Nenhuma senha em texto plano.

**RNF009 - Validação de Dados**
- **Critério**: Integridade dos dados inseridos.
- **Implementação**: Validação dupla:
  - **Frontend**: Zod schemas nos formulários.
  - **Backend**: Zod middlewares nas rotas da API.

**RNF010 - Tratamento de Erros**
- **Critério**: O sistema não deve quebrar silenciosamente.
- **Implementação**: Blocos try-catch nos controllers e Error Boundaries no React para capturar falhas de renderização.

### 2.4. Canal WhatsApp

**RNF011 - Processamento de Linguagem Natural (LLM)**
- **Critério**: A IA deve interpretar corretamente ao menos 90% das mensagens de transação enviadas em linguagem natural.
- **Implementação**:
  - Uso de LLM com prompt de sistema estruturado, contendo as regras de negócio do FYNX (tipos de transação, categorias existentes do usuário, formato de datas).
  - Fallback com solicitação de confirmação ao usuário quando a confiança da extração for baixa.
  - Histórico de conversa mantido por sessão para suportar interações contextuais (ex.: *"edite o último registro"*).

**RNF012 - Segurança e Autenticação do Canal**
- **Critério**: Nenhuma operação de leitura ou escrita deve ser executada para um número não verificado.
- **Implementação**:
  - Toda mensagem recebida via webhook da Meta Cloud API é validada pelo `phone_number` do remetente contra a tabela de vínculos do banco de dados.
  - Mensagens de números não vinculados recebem resposta padrão orientando o usuário a cadastrar o número na plataforma web.
  - O código OTP de verificação (RF016) tem validade máxima de **10 minutos** e é invalidado após o primeiro uso.
  - Comunicação entre o backend FYNX e as APIs (Meta / Evolution) realizada exclusivamente via HTTPS com tokens de acesso seguros armazenados em variáveis de ambiente.

**RNF013 - Disponibilidade e Latência do Canal**
- **Critério**: O canal WhatsApp deve ser responsivo para o usuário.
- **Implementação**:
  - Tempo de resposta da IA ao usuário: **< 10 segundos** para operações de registro e consulta.
  - O sistema deve implementar timeout e mensagem de erro amigável caso a API da Meta ou o serviço de LLM não respondam dentro do prazo.
  - As notificações proativas (RF019 / Evolution API) devem ser entregues em até **1 minuto** após o evento que as disparou.

**RNF014 - Conformidade com Políticas da Meta (WhatsApp Business)**
- **Critério**: O módulo deve operar dentro das diretrizes da plataforma WhatsApp Business.
- **Implementação**:
  - Uso exclusivo de **Meta Cloud API** oficial para o canal conversacional.
  - Notificações proativas (RF019) devem utilizar **Message Templates** aprovados pela Meta (via Evolution API), respeitando a janela de 24h de sessão ativa.
  - Armazenamento e processamento de dados dos usuários em conformidade com a **LGPD**, dado que números de telefone são dados pessoais sensíveis.

---

## 2.3. Regras de Negócio (RN)

### 2.3.1. Transações Financeiras

**RN001 - Validação de Valores**
- O valor de qualquer transação (receita ou despesa) deve ser estritamente positivo (> 0).
- O sistema deve armazenar valores com precisão de 2 casas decimais.

**RN002 - Categorização Obrigatória**
- Toda transação deve pertencer a uma categoria.
- Se uma categoria personalizada for excluída, as transações associadas devem ser preservadas (soft delete ou manutenção do histórico).

**RN003 - Tipagem Estrita**
- Uma transação só pode ser do tipo 'income' (receita) ou 'expense' (despesa). Não há tipos híbridos.

### 2.3.2. Metas e Orçamentos

**RN004 - Metas de Economia (Saving Goals)**
- O progresso de uma meta de economia é calculado somando-se as receitas vinculadas explicitamente a ela.
- Uma meta não pode ter data de término anterior à data de início.

**RN005 - Metas de Gastos (Spending Goals)**
- O progresso é calculado somando-se todas as despesas da categoria selecionada dentro do período definido.
- O status da meta deve ser atualizado automaticamente para 'Excedido' se o valor atual ultrapassar o alvo.

### 2.3.3. Sistema de Gamificação

**RN006 - Cálculo de Pontuação**
- A pontuação é cumulativa e baseada em eventos (triggers):
  - **Registro de Transação**: +10 pontos.
  - **Meta Atingida**: +50 pontos.
  - **Manter-se no Orçamento**: +20 pontos.
  - **Estourar Orçamento**: -30 pontos.

**RN007 - Progressão de Ligas**
- A liga do usuário é determinada pela sua pontuação total atual:
  - **Ferro**: 0 - 99 pontos.
  - **Bronze**: 100 - 299 pontos.
  - **Prata**: 300 - 599 pontos.
  - **Ouro**: 600 - 999 pontos.
  - **Diamante**: 1000+ pontos.
- A atualização de liga deve ocorrer imediatamente após a mudança de pontuação.

### 2.3.4. Limites de Gastos

**RN008 - Monitoramento de Limites**
- Um limite de gastos é definido por Categoria e Período.
- O sistema deve alertar o usuário quando o consumo atingir 75% do limite estabelecido.
- O cálculo do consumo deve considerar apenas transações do tipo 'expense' dentro do intervalo de datas do período.

---

## 3. Modelagem e Design do Sistema

### 3.1. Diagramas de Caso de Uso

Nesta seção, apresentamos os casos de uso detalhados, incluindo o novo módulo de acesso via WhatsApp, interações com IA e as automações proativas do sistema.

<img src="./caso-de-uso-rev06.png" alt="Diagrama de Caso de Uso" />

#### Detalhamento dos Casos de Uso

**CSU01: Fazer Login**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Usuário registrado. |
| **Fluxo Principal** | 1. Usuário informa credenciais.<br>2. Sistema valida.<br>3. Acesso concedido. |
| **Pós-condições** | Usuário autenticado. |

**CSU02: Registrar Usuário**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Nenhuma. |
| **Fluxo Principal** | 1. Usuário preenche dados (nome, email).<br>2. Sistema cria registro no DB.<br>3. Sistema cria pontuação inicial (Level 1). |
| **Pós-condições** | Novo usuário criado. |

**CSU03: Adicionar Transação**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Usuário logado. |
| **Fluxo Principal** | 1. Usuário acessa "Nova Transação".<br>2. Preenche valor, descrição, data e seleciona categoria.<br>3. (Opcional) Vincula a uma Meta de Economia — aciona **CSU06** via `<<extend>>`.<br>4. Confirma a operação.<br>5. Sistema valida dados (RN001, RN003).<br>6. Sistema persiste a transação.<br>7. Sistema atualiza saldo e pontuação (+10 pts). |
| **Pós-condições** | Transação salva, saldo atualizado, pontuação incrementada. |

**CSU04: Criar Metas de Gasto (Orçamento)**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Usuário logado. |
| **Fluxo Principal** | 1. Usuário seleciona "Criar Meta de Gasto".<br>2. Define categoria e valor limite.<br>3. Sistema salva meta com type='spending'. |
| **Pós-condições** | Limite de gasto ativo. |

**CSU05: Criar Metas de Economia**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Usuário logado. |
| **Fluxo Principal** | 1. Usuário seleciona "Criar Meta de Economia".<br>2. Define valor alvo e data.<br>3. Sistema salva meta com type='saving'. |
| **Pós-condições** | Meta de economia ativa. |

**CSU06: Adicionar Transação a uma Meta**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Relacionamento** | `<<extend>>` de **CSU03** — acionado opcionalmente durante o registro de uma transação. |
| **Pré-condições** | Usuário logado e pelo menos uma meta de economia ativa. |
| **Fluxo Principal** | 1. Durante o fluxo de CSU03, usuário opta por vincular a transação a uma meta.<br>2. Sistema exibe as metas de economia disponíveis.<br>3. Usuário seleciona a meta desejada.<br>4. Sistema vincula o ID da meta à transação.<br>5. Sistema atualiza `current_amount` da meta. |
| **Pós-condições** | Progresso da meta atualizado. |

**CSU07: Visualizar Dashboard**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Usuário logado. |
| **Fluxo Principal** | 1. Sistema busca saldo total.<br>2. Sistema busca últimas transações.<br>3. Sistema calcula totais por categoria.<br>4. Exibe gráficos e resumos. |
| **Pós-condições** | Visão geral apresentada. |

**CSU08: Visualizar Ranking Global**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Usuário logado. |
| **Fluxo Principal** | 1. Usuário acessa "Ranking".<br>2. Sistema calcula pontuação total (FynxScore).<br>3. Sistema determina a Liga atual (RN007).<br>4. Sistema exibe lista ordenada de usuários.<br>5. Usuário vê sua posição e badge da liga. |
| **Pós-condições** | Usuário ciente de sua classificação. |

**CSU09: Vincular WhatsApp**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário |
| **Pré-condições** | Usuário logado na plataforma web. |
| **Fluxo Principal** | 1. Usuário acessa seção "Conectar WhatsApp" no perfil.<br>2. Informa o número de telefone com DDI.<br>3. Sistema aciona o caso de uso **"Enviar OTP de Verificação"** via `<<include>>`, disparando o código via Meta API.<br>4. Usuário insere o OTP recebido na plataforma web.<br>5. Sistema valida o OTP (máx. 10 minutos de validade) e vincula o número. |
| **Pós-condições** | Número de WhatsApp verificado e vinculado à conta do usuário. |

**CSU10: Gerenciar Transações via WhatsApp**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário (WhatsApp) |
| **Atores Secundários** | IA (LLM), via caso de uso *Processar Linguagem Natural (NLP)* |
| **Pré-condições** | Número de WhatsApp vinculado e validado. |
| **Fluxo Principal** | 1. Usuário envia mensagem textual de registro, edição ou exclusão.<br>2. Sistema valida remetente contra a tabela de vínculos.<br>3. Sistema aciona o caso de uso **"Processar Linguagem Natural (NLP)"** via `<<include>>`.<br>4. IA interpreta a intenção e extrai os parâmetros da operação.<br>5. (Opcional) IA solicita confirmação caso algum campo obrigatório não seja identificado.<br>6. Sistema processa a operação no DB.<br>7. Sistema responde ao usuário com resumo da operação realizada. |
| **Pós-condições** | Transação registrada, alterada ou removida corretamente. |

**CSU11: Consultar Status via WhatsApp**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Usuário (WhatsApp) |
| **Atores Secundários** | IA (LLM), via caso de uso *Processar Linguagem Natural (NLP)* |
| **Pré-condições** | Número de WhatsApp vinculado e validado. |
| **Fluxo Principal** | 1. Usuário envia mensagem consultando metas, orçamentos, score ou ranking.<br>2. Sistema valida remetente contra a tabela de vínculos.<br>3. Sistema aciona o caso de uso **"Processar Linguagem Natural (NLP)"** via `<<include>>`.<br>4. IA interpreta a intenção de consulta.<br>5. Sistema busca os dados solicitados no banco.<br>6. IA formata a resposta em linguagem natural e envia ao usuário. |
| **Pós-condições** | Usuário recebe a informação atualizada solicitada. |

**CSU12: Enviar Notificações Proativas**
| Detalhe | Descrição |
| :--- | :--- |
| **Ator Primário** | Sistema FYNX |
| **Atores Secundários** | Usuário (WhatsApp); Meta / Evolution API |
| **Pré-condições** | Número de WhatsApp vinculado e validado. Notificações do tipo correspondente habilitadas pelo usuário. |
| **Fluxo Principal** | 1. Sistema detecta evento gatilho (ex.: orçamento atinge 75%, meta concluída).<br>2. Sistema seleciona o *Message Template* correspondente ao evento.<br>3. Sistema aciona Meta / Evolution API via `<<include>>` para envio da mensagem.<br>4. Usuário recebe o alerta em seu WhatsApp. |
| **Pós-condições** | Usuário notificado proativamente sobre o evento relevante. |

---

### 3.2. Mapeamento de Processos (BPMN)

Este manual define a modelagem dos processos do FYNX, separando as responsabilidades por **Raias (Lanes)** e detalhando a lógica de reprocessamento e gamificação baseada em percentis reais da codebase.

#### Definição Global das Raias (As "Pistas da Piscina")

Ao desenhar qualquer processo abaixo, você deve considerar uma **Pool (Piscina)** chamada "Sistema FYNX" dividida nestas 5 Raias:

1.  **Raia do Usuário:** Ações humanas (clicar, digitar, ler).
2.  **Raia do Frontend (Interface):** Validações visuais, botões, animações e alertas.
3.  **Raia do Backend (Servidor):** Onde as regras de negócio e os cálculos acontecem.
4.  **Raia do Banco de Dados (DB):** Onde a informação é gravada, apagada ou alterada.
5.  **Raia Externa (WhatsApp/IA):** Sistemas de terceiros (Meta, Evolution, Robô de IA).

#### MÓDULO 1: ACESSO E CONTA

**Processo 1.1: Registro de Novo Usuário**
*   **[Raia Usuário]**: Preenche formulário e clica em "Criar Conta".
*   **[Raia Frontend]**: Valida formato do e-mail (Zod). Se erro, exibe alerta. Se ok, envia POST.
*   **[Raia Backend]**: Recebe dados, verifica se o e-mail existe no Banco.
*   **[Raia Backend]**: Aplica Criptografia na senha (Bcrypt).
*   **[Raia Backend]**: Comando para inicializar Ranking (**Liga Bronze**, 0 Pontos).
*   **[Raia Banco de Dados]**: Grava novo registro na tabela `users` e `user_scores`.
*   **[Raia Backend]**: Gera Token JWT.
*   **[Raia Frontend]**: Recebe Token, salva no navegador e abre o Dashboard.

![Registro de Novo Usuário](./DA%20-%20Registro%20de%20Novo%20User.svg)

#### MÓDULO 2: INTEGRAÇÃO WHATSAPP [STATUS: PLANEJADO]

**Processo 2.1: Vinculação de Número (OTP)**
*   **[Raia Usuário]**: Digita número de telefone na tela de Perfil.
*   **[Raia Backend]**: Gera código de 6 dígitos e inicia Cronômetro de 10 minutos.
*   **[Raia Externa (WhatsApp)]**: Envia mensagem para o celular do usuário.
*   **[Raia Usuário]**: Lê o código no celular e digita no site.
*   **[Raia Backend]**: Valida código vs. Tempo expirado.
*   **[Raia Banco de Dados]**: Atualiza status para `whatsapp_verified = true`.

![Vinculação de Número](./DA%20-%20Vinculação%20de%20Numero.svg)

#### MÓDULO 3: GESTÃO DE TRANSAÇÕES (INCLUINDO EXCLUSÃO)

**Processo 3.1: Cadastro de Transação (O Fluxo de Entrada)**
*   **[Raia Usuário]**: Abre o modal, preenche dados e escolhe se vincula a uma Meta.
*   **[Raia Backend]**: Inicia uma **Transação Atômica SQL (BEGIN TRANSACTION)**.
*   **[Raia Backend]**: Se houver Meta, calcula o novo progresso.
*   **[Raia Banco de Dados]**: Tenta gravar a Transação e atualizar a Meta.
*   **[Raia Backend]**: **[Gateway de Erro]** Deu erro no Banco?
    *   *Sim:* Dispara **ROLLBACK** (Desfaz tudo no DB). Devolve erro ao Frontend.
    *   *Não:* Dispara **COMMIT** (Grava tudo definitivamente).
*   **[Raia Backend]**: (Background) Inicia Recalculo de Ranking e Pontuação.

![Cadastro de Transação](./DA%20-%20Cadastro%20de%20Transacao.svg)

**Processo 3.3: Exclusão de Transação (Fluxo de Reprocessamento Completo)**
Este processo é crítico pois exige "voltar no tempo" para corrigir saldos e ligas.
*   **[Raia Usuário]**: Clica no ícone de Lixeira em uma transação antiga.
*   **[Raia Frontend]**: Exibe Modal de Confirmação: "Deseja realmente excluir?".
*   **[Raia Backend]**: Recebe pedido de exclusão e inicia **Transação SQL**.
*   **[Raia Backend]**: **[Passo de Auditoria]**: Verifica se essa transação estava vinculada a uma Meta.
*   **[Raia Backend]**: **[Lógica de Estorno]**: 
    *   Se era uma DESPESA: Soma o valor de volta à meta (devolve o saldo).
    *   Se era uma RECEITA: Subtrai o valor da meta de economia.
*   **[Raia Banco de Dados]**: Deleta o registro da transação.
*   **[Raia Backend]**: **Reprocessamento de Ranking (Gatilho)**:
    *   Calcula novamente a Taxa de Poupança do mês.
    *   Subtrai os pontos que o usuário ganhou por aquela transação.
    *   Verifica se a perda de pontos faz o usuário **Cair de Liga** (conforme percentis globais: Top 1%, 5%, 20%, 50%).
*   **[Raia Banco de Dados]**: Atualiza a pontuação final e a liga do usuário.
*   **[Raia Frontend]**: Remove a linha da tela e atualiza os gráficos instantaneamente.

![Exclusão de Transação](./DA%20-%20Exclusao%20de%20Transacao.svg)

#### MÓDULO 4: PLANEJAMENTO E METAS

**Processo 4.2: Meta de Gastos (Spending Goals)**
*   **[Raia Usuário]**: Define categoria e valor máximo.
*   **[Raia Backend]**: Cria registro com `goal_type = 'spending'`.
*   **[Raia Banco de Dados]**: Salva meta.
*   **[Raia Backend]**: (Monitoramento) A cada nova transação na Raia 3.1, o sistema "pinga" aqui para ver se o limite foi atingido.

![Meta de Gastos](./DA%20-%20Meta%20de%20Gastos.svg)

#### MÓDULO 5: DASHBOARDS E RANKING (GAMIFICAÇÃO)

**Processo 5.1: Carregamento do Painel**
*   **[Raia Frontend]**: Ao abrir a tela, pede os dados (Request).
*   **[Raia Backend]**: Faz a "Varredura" no Banco (SELECT SUM) por categoria.
*   **[Raia Frontend]**: Recebe o JSON e "desenha" os gráficos de pizza e barras.

![Carregamento do Painel](./DA%20-%20Carregamento%20do%20Painel.svg)

**Processo 5.2: Robô de Gamificação (Cálculo de Pontos e Ligas)**
*   **[Raia Backend]**: Calcula Score seguindo a fórmula: `(Economia + Consistência) - Penalidades`.
    *   *Nota:* A **Penalidade** é multiplicada pelo nível da liga atual (Bronze: 1x, Prata: 1.5x, Ouro: 2x, Platina: 3x, Diamante: 5x).
*   **[Raia Banco de Dados]**: Compara o Score do usuário com a pontuação global de todos os outros usuários.
*   **[Raia Backend]**: **[Gateway Decisão]**: Em qual percentil o usuário se encontra?
    *   **Top 1%**: Promove/Mantém em **Diamante**.
    *   **Top 5%**: Promove/Mantém em **Platina**.
    *   **Top 20%**: Promove/Mantém em **Ouro**.
    *   **Top 50%**: Promove/Mantém em **Prata**.
    *   **Abaixo de 50%**: Rebaixa/Mantém em **Bronze**.
*   **[Raia Banco de Dados]**: Grava a nova Liga e o novo Score no perfil do usuário.

![Robô de Gamificação](./DA%20-%20Robo%20de%20Gamificacao.svg)

#### MÓDULO 6: NOTIFICAÇÕES E IA [STATUS: PLANEJADO]

**Processo 6.1: Alertas de Teto de Gastos**
*   **[Raia Backend]**: Verifica se saldo da Meta > 75% do limite.
*   **[Raia Externa (WhatsApp)]**: Dispara mensagem de alerta para o celular.

![Alertas de Gastos](./DA%20-%20%20Alertas%20de%20Gastos.svg)

**Processo 6.2: Registro por Voz (WhatsApp + IA)**
*   **[Raia Usuário]**: Manda áudio no WhatsApp.
*   **[Raia Externa (IA)]**: Transcreve o áudio e extrai o valor e a categoria.
*   **[Raia Backend]**: Recebe o texto da IA e inicia o **Processo 3.1 (Cadastro)**.
*   **[Raia Externa (WhatsApp)]**: Responde ao usuário confirmando o registro.

![Registro por Voz](./DA%20-%20Registro%20por%20Voz.svg)