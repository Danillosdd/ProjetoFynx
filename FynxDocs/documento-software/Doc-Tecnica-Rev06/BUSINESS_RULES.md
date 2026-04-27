# Engenharia de Requisitos e Regras de Negócio — FYNX (Rev. 06)

> Documento de especificação corporativa. Centraliza a inteligência de requisitos do sistema FYNX. O levantamento de necessidades aqui presente obedece ao rigor acadêmico, porém foi refatorado para mapear os requisitos aos Bounded Contexts da arquitetura de Domain-Driven Design (DDD).

---

## 1. Requisitos Funcionais (RF)

### 1.1. Bounded Context: Identity & Access

#### **RF001 - Autenticação de Usuário (Login)**
- **Descrição**: O sistema deve prover um mecanismo de entrada criptograficamente seguro, prevenindo ataques de força bruta e enumeração.
- **Atores**: Usuário Registrado.
- **Critérios de Aceite**:
  - Validação estrita do payload via Schema (Zod) antes de bater no banco.
  - O sistema deve comparar a senha usando algoritmo Bcrypt. Em caso de falha, retornar mensagem genérica ("Credenciais Inválidas") para ocultar se o e-mail existe ou não.
- **Detalhes Técnicos**: Retorna um Token JWT (HS256) com TTL de 24 horas. O token deve conter `userId` e `email` no payload.
- **Prioridade**: Crítica.
- **Status**: ✅ Implementado.

#### **RF002 - Registro de Usuário e Inicialização de Gamificação**
- **Descrição**: A criação de conta deve preparar todo o ecossistema do usuário no sistema, garantindo que ele comece com as configurações básicas de gamificação.
- **Atores**: Visitante / Usuário não registrado.
- **Critérios de Aceite**:
  - O usuário preenche Nome, Email e Senha.
  - Um usuário novo deve nascer já alocado na Liga Base (Bronze) com Score 0.
  - Criação automática de categorias padrão (Alimentação, Transporte, Moradia, etc.) caso o usuário não as possua.
- **Detalhes Técnicos**: Execução envolta em um **Unit of Work**. Dispara `UserRegisteredDomainEvent`.
- **Prioridade**: Crítica.
- **Status**: ✅ Implementado.

### 1.2. Bounded Context: Financial Core

#### **RF003 - Motor de Lançamento de Transações**
- **Descrição**: Cadastro detalhado e rigoroso de entradas e saídas financeiras, servindo como base para todo o analytics e gamificação.
- **Atores**: Usuário Autenticado.
- **Critérios de Aceite**:
  - Campos obrigatórios: Valor (> 0), Descrição, Categoria, Data e Tipo (income/expense).
  - Campos opcionais: Notas, Vínculo com Meta.
  - Impedir lançamentos sem categoria válida.
- **Detalhes Técnicos**: Entidade `Transaction` valida invariantes no construtor. Dispara `TransactionCreatedEvent`.
- **Prioridade**: Crítica.
- **Status**: ✅ Implementado.

#### **RF004 - Filtros Avançados e Paginação**
- **Descrição**: Pesquisa eficiente em grandes volumes de transações para garantir usabilidade em contas com histórico longo.
- **Atores**: Usuário Autenticado.
- **Critérios de Aceite**:
  - Paginação com `page` e `limit`.
  - Filtros por intervalo de data, tipo, categoria e busca textual.
- **Detalhes Técnicos**: Backend expõe query params: `page`, `limit`, `type`, `category`, `dateFrom/To`. Resposta inclui metadados de paginação (totalItems, totalPages).
- **Prioridade**: Alta.
- **Status**: ✅ Implementado.

#### **RF005 - Operações em Lote (Bulk Actions)**
- **Descrição**: Manipular múltiplos registros simultaneamente para otimizar a gestão de dados pelo usuário.
- **Atores**: Usuário Autenticado.
- **Critérios de Aceite**:
  - Seleção múltipla na interface.
  - Exclusão em lote com confirmação única.
- **Detalhes Técnicos**: Endpoint `/bulk` recebe array de IDs e executa em transação única no banco.
- **Prioridade**: Média.
- **Status**: ✅ Implementado.

#### **RF006 - Gestão de Metas de Economia (Saving Goals)**
- **Descrição**: Objetivos para acumular dinheiro com barra de progresso e data alvo.
- **Atores**: Usuário Autenticado.
- **Critérios de Aceite**:
  - Definição de nome, valor alvo e prazo.
  - Visualização de progresso percentual.
- **Prioridade**: Alta.
- **Status**: ✅ Implementado.

#### **RF007 - Gestão de Metas de Gastos (Spending Goals/Limits)**
- **Descrição**: Estabelecer tetos de gastos mensais por categoria para controle de orçamento.
- **Atores**: Usuário Autenticado.
- **Critérios de Aceite**:
  - Definição de limite por categoria.
  - Alerta visual quando o gasto se aproxima do limite (ex: 80%).
- **Prioridade**: Alta.
- **Status**: ✅ Implementado.

#### **RF008 - Dashboard e Analytics**
- **Descrição**: Painel centralizado com KPIs e visualizações gráficas da saúde financeira.
- **Atores**: Usuário Autenticado.
- **Critérios de Aceite**:
  - KPIs: Saldo Atual, Receita do Mês, Despesa do Mês.
  - Gráficos: Distribuição por categoria (Pizza), Evolução diária (Área/Linha).
- **Prioridade**: Crítica.
- **Status**: ✅ Implementado.

### 1.3. Bounded Context: Gamification

#### **RF010 - Engine de Pontuação (FYNX Score)**
- **Descrição**: Cálculo automático de pontos baseado em comportamento financeiro, consistência e disciplina.
- **Critérios de Aceite**:
  - O score aumenta com receitas e consistência de uso.
  - O score diminui com despesas excessivas e falta de check-in.
- **Prioridade**: Crítica.
- **Status**: ✅ Implementado.

#### **RF011 - Ranking Global e Ligas**
- **Descrição**: Classificação competitiva em 5 Ligas (Bronze a Diamante) baseada no percentil global de score.
- **Critérios de Aceite**:
  - Atualização diária das posições.
  - Rebaixamento e promoção ao fim de cada temporada (mês).
- **Prioridade**: Alta.
- **Status**: ✅ Implementado.

#### **RF012 - Sistema de Conquistas (Achievements)**
- **Descrição**: Desbloqueio de badges por marcos específicos que incentivam bons hábitos.
- **Critérios de Aceite**:
  - Badge "Primeiro Passo" ao criar a primeira transação.
  - Badge "Poupador" ao atingir R$ 1.000,00 de saldo líquido.
- **Prioridade**: Média.
- **Status**: ✅ Implementado.

### 1.4. Módulo Integração WhatsApp [PLANEJADO]

#### **RF016 - Vinculação via OTP**
- **Descrição**: Associar número de WhatsApp à conta via código de 6 dígitos enviado por SMS/WhatsApp.
- **Critérios de Aceite**:
  - Expiração do código em 10 minutos.
  - Máximo de 3 tentativas de validação por código.
- **Prioridade**: Alta.
- **Status**: ⏳ Planejado.

#### **RF017 - Registro via Linguagem Natural**
- **Descrição**: Uso de IA (LLM) para extrair dados de mensagens de texto/voz e criar transações automaticamente.
- **Critérios de Aceite**:
  - Suporte a frases como "Gastei 30 reais em almoço hoje".
  - Confirmação da transação via chat antes de salvar.
- **Prioridade**: Alta.
- **Status**: ⏳ Planejado.

#### **RF018 - Consultas e Notificações Proativas**
- **Descrição**: Alertas de orçamento estourado e consultas de saldo via chat de forma conversacional.
- **Critérios de Aceite**:
  - Notificação automática ao atingir 90% de um limite.
  - Resposta a perguntas como "Quanto eu ainda posso gastar em Lazer?".
- **Prioridade**: Média.
- **Status**: ⏳ Planejado.

### 1.5. Bounded Context: Admin & Audit [NOVO]

#### **RF019 - Log de Auditoria de Eventos Críticos**
- **Descrição**: Rastreabilidade total de alterações sensíveis (troca de senha, exclusão de conta, grandes movimentações).
- **Atores**: Sistema / Auditor.
- **Critérios de Aceite**:
  - Registro de timestamp, IP, User-Agent e descrição da mudança.
  - Imutabilidade do log no banco de dados.
- **Prioridade**: Baixa.

#### **RF020 - Gestão de Temporadas de Gamificação**
- **Descrição**: Interface ou script para encerrar o mês, processar rankings e disparar o carry-over.
- **Critérios de Aceite**:
  - Execução atômica (tudo ou nada).
  - Geração de relatório de performance global da comunidade.
- **Prioridade**: Média.

---

## 2. Requisitos Não Funcionais (RNF)

| ID | Categoria | Especificação Técnica |
|---|---|---|
| **RNF001** | Performance | Latência < 300ms para 95% das leituras. Exige índices em `user_id` e `date`. |
| **RNF002** | Segurança | Hash de senhas via Bcrypt (10 salt rounds). JWT stateless com rotação de segredo. |
| **RNF003** | Arquitetura | Domain Isolation: Camada de domínio com zero dependências externas (POJO/POCO). |
| **RNF004** | Resiliência | SQLite em modo `WAL` para suportar maior concorrência de escrita. Backup diário automático do arquivo `.db`. |
| **RNF005** | Usabilidade | Interface Mobile-First com Tailwind CSS e acessibilidade WCAG 2.1 (Nível AA). |
| **RNF006** | Integridade | Uso obrigatório de Transações SQL (ACID) em operações multi-tabela via Unit of Work. |
| **RNF007** | Qualidade | TypeScript Strict Mode e cobertura de testes unitários > 80% no Domínio. |
| **RNF008** | Disponibilidade | SLA alvo de 99.5% de uptime (excluindo janelas de manutenção planejada). |

---

## 3. Regras de Negócio Core (RN)

As regras abaixo são os invariantes do Domínio que garantem a consistência do sistema.

### 3.1. Invariantes Financeiros
- **RN001 - Valor Positivo**: Transações com valor $\le 0$ são proibidas. Validação na Entidade e Constraint no DB.
- **RN002 - Temporalidade**: Permite datas retroativas e futuras. Datas futuras são marcadas como `Pending` e não afetam o saldo líquido atual até que a data chegue.
- **RN003 - Unicidade de Vínculo**: Uma transação pertence a no máximo 1 meta de gasto ou 1 de economia. O vínculo é exclusivo para evitar dupla contagem.
- **RN004 - Estorno em Exclusão**: Ao deletar uma transação, o progresso da meta vinculada deve ser subtraído (estornado). Se a meta já estiver concluída, ela deve retornar ao status `active`.
- **RN005 - Categorização Obrigatória**: Toda transação deve possuir uma categoria válida, seja ela do sistema ou personalizada pelo usuário.
- **RN006 - Bloqueio de Edição em Metas Concluídas**: Metas com status `completed` não permitem alteração de valor alvo para preservar o histórico de conquistas.
- **RN013 - Rollover de Orçamento (Opcional)**: Ao fim do mês, o saldo positivo de um orçamento não é automaticamente somado ao próximo, a menos que o usuário ative a regra de "Rollover" específica por categoria.
- **RN014 - Limite de Categorias Customizadas**: Para evitar poluição visual e de dados, cada usuário é limitado a 20 categorias personalizadas.

### 3.2. Invariantes de Gamificação
- **RN007 - A Fórmula do Score**: 
  $Score = (\text{Receita} - \text{Despesa}) \times 0.5 + (\text{Check-in Streak} \times 10)$.
- **RN008 - Multiplicador de Liga**: Despesas em ligas altas (Diamante) penalizam o score mais severamente (5x) que na Bronze (1x).
- **RN009 - Reset Sazonal**: No 1º dia do mês, scores resetam para 20% do valor anterior (Carry-over). As ligas são recalculadas com base no ranking final do mês anterior.
- **RN010 - Ganho Máximo Diário**: Para evitar manipulação, o ganho de score por transações é limitado a um teto diário de 500 pontos, exceto por bônus de conquistas.
- **RN011 - Penalidade por Inatividade**: Usuários sem check-in por mais de 7 dias perdem 5% do score acumulado a cada dia extra de inatividade.
- **RN012 - Elegibilidade de Recompensa**: Badges de valor monetário (ex: "Poupador") só são concedidas a usuários com WhatsApp verificado para evitar bots.

### 3.3. Políticas de Integridade de Dados
- **PI001 - Exclusão em Cascata**: Se um `User` for deletado, todos os seus dados dependentes (Transactions, Goals, Scores, Sessions) devem ser removidos via `ON DELETE CASCADE` para evitar registros órfãos.
- **PI002 - Unicidade de Identidade**: As colunas `email` e `whatsapp_phone` na tabela `users` são estritamente `UNIQUE`. Não é permitido duplicidade de acesso.
- **PI003 - Imutabilidade de Log de Auditoria**: Registros na tabela `whatsapp_notification_logs` e `audit_logs` não permitem `UPDATE`. A integridade do histórico é preservada.
- **PI004 - TTL (Time-To-Live) de Contexto**: Sessões de conversa via WhatsApp (`whatsapp_sessions`) expiram em 1 hora. Um job periódico limpa sessões expiradas.
- **PI005 - Validação Temporal de OTP**: O código de verificação (`whatsapp_otp`) só é válido se a data atual for menor que `otp_expires_at`.
- **PI006 - Consistência Eventual de Score**: O cálculo do score é atualizado via Domain Events de forma assíncrona. A consistência é garantida no nível da aplicação.
- **PI007 - Isolamento de Domínio (Multi-tenancy)**: Toda query de leitura ou escrita deve incluir obrigatoriamente o filtro `user_id` da sessão ativa, prevenindo vazamento de dados entre usuários.
- **PI008 - Versionamento de Entidades (Optimistic Locking)**: Operações sensíveis de atualização de saldo em Metas usam uma coluna `version` para evitar o problema da "atualização perdida" em ambientes concorrentes.

---

## 4. Glossário Técnico (Exaustivo)

| Termo | Definição no Contexto FYNX |
|---|---|
| **Bounded Context** | Fronteira lógica que delimita um domínio (ex: Financial, Gamification). |
| **FYNX Score** | Métrica proprietária que mede a saúde e engajamento financeiro do usuário. |
| **Carry-over** | Parcela do score (20%) preservada entre temporadas para premiar o histórico. |
| **Sad Path** | Caminho infeliz; fluxo de exceção onde algo falha (erro de validação, erro de rede). |
| **Unit of Work** | Padrão que garante que uma operação multi-tabela (Ex: Salvar Transação + Atualizar Score) seja atômica. |
| **LLM / NER** | Large Language Model usado para Named Entity Recognition (Extração de Entidades) no WhatsApp. |
| **Evolution API** | Gateway de integração usado para disparar mensagens e notificações proativas via WhatsApp. |
| **DTO (Data Transfer Object)** | Objeto simples usado para transportar dados entre as camadas de API e Aplicação. |
| **JWT (JSON Web Token)** | Padrão de token para autenticação stateless, assinado com segredo HS256. |
| **Bcrypt** | Algoritmo de hashing de senha com salt, resistente a ataques de dicionário e rainbow tables. |
| **Check-in Streak** | Contador de dias consecutivos com atividade, gerando bônus progressivos de pontuação. |
| **Liga** | Classificação competitiva: Bronze, Prata, Ouro, Platina e Diamante (baseado em percentil). |
| **Saving Goal** | Meta de acumulação de dinheiro. O progresso cresce conforme receitas são vinculadas. |
| **Spending Goal** | Teto de gastos por categoria. O progresso consome o limite conforme despesas ocorrem. |
| **Budget** | Orçamento planejado para um período específico (mensal/anual). |
| **OTP (One-Time Password)** | Código temporário de 6 dígitos para validação de posse do número de WhatsApp. |
| **Vault Entry** | Nome conceitual da tela de login, reforçando o tema de "Cofre de Segurança". |
| **Thin Controller** | Prática de manter Controllers enxutos, delegando toda lógica para os Services. |
| **Fat Service** | Concentração da inteligência de negócio e regras de domínio na camada de serviço. |
| **Atomic Transaction** | Operação de banco de dados que garante o princípio do "tudo ou nada" (Commit/Rollback). |
| **Session Memory** | Armazenamento de contexto de conversa (JSON) para que a IA lembre de mensagens anteriores. |
| **badge_novice** | Conquista automática concedida ao usuário após seu primeiro lançamento no sistema. |
| **badge_saver** | Badge de mérito financeiro desbloqueada ao acumular um saldo líquido superior a R$ 1.000. |
| **Zod Schema** | Biblioteca de declaração e validação de esquemas TypeScript usada no runtime. |
| **WAL Mode** | Write-Ahead Logging; modo do SQLite que melhora drasticamente a performance de escrita concorrente. |
| **Ubiquitous Language** | Linguagem comum compartilhada por desenvolvedores e especialistas de negócio no DDD. |
| **Domain Event** | Algo que aconteceu no domínio e que outros componentes podem ter interesse (ex: `TransactionCreated`). |
| **Value Object** | Objeto que não tem identidade própria e é definido apenas por seus atributos (ex: `Currency`). |
| **Aggregate Root** | Entidade principal que garante a consistência de um grupo de objetos relacionados. |
| **Inversion of Control** | Princípio onde o controle de fluxo é invertido, delegando a criação de objetos para um container. |
| **Stateless Auth** | Autenticação onde o servidor não guarda estado da sessão, confiando apenas no Token enviado. |
| **Rate Limit** | Restrição de frequência de requisições para proteger a API contra abusos. |
| **BFF (Backend for Frontend)** | Padrão onde o backend é desenhado especificamente para as necessidades de uma interface. |
| **CRUD** | Create, Read, Update, Delete; as quatro operações básicas de persistência de dados. |
| **Soft Delete** | Prática de marcar um registro como deletado em vez de removê-lo fisicamente do banco. |
| **ACID** | Propriedades de transações de banco de dados: Atomicidade, Consistência, Isolamento e Durabilidade. |
| **Payload** | A parte útil dos dados transmitidos em uma requisição ou resposta de API. |
| **Endpoint** | Ponto de acesso em uma API (URL) que responde a um verbo HTTP específico. |
| **Middleware** | Função que intercepta a requisição antes que ela chegue ao Controller (ex: Validação, Auth). |
| **ORM (Object-Relational Mapping)** | Técnica que permite mapear objetos de código para tabelas de banco de dados relacionais. |
| **Dependency Injection** | Padrão onde as dependências de uma classe são fornecidas externamente em vez de criadas internamente. |
| **Optimistic Locking** | Estratégia de concorrência que assume que conflitos são raros, usando versão para validar updates. |
| **Pessimistic Locking** | Bloqueio direto do registro no banco para evitar que outros o leiam/editem simultaneamente. |
| **Event Emitter** | Componente do Node.js usado para implementar o padrão Observer e disparar Domain Events. |
| **Hydration** | Processo de transformar dados brutos do banco em instâncias ricas de classes de Domínio. |
| **Anemic Domain Model** | Antipatadrão onde as entidades são apenas sacos de dados (getters/setters) sem lógica. |
| **Rich Domain Model** | Prática recomendada onde as entidades contêm a lógica e as invariantes do negócio. |
| **Factory Pattern** | Padrão de criação usado para instanciar objetos complexos ocultando a lógica de criação. |
| **In-Memory Repository** | Implementação de repositório que guarda dados em arrays, usada para testes de performance. |
| **SQL Injection** | Vulnerabilidade de segurança evitada no FYNX pelo uso de Prepared Statements no driver SQLite. |
| **XSS (Cross-Site Scripting)** | Ataque evitado pelo React e por sanitização de strings na camada de infraestrutura. |
| **CORS** | Cross-Origin Resource Sharing; política de segurança que restringe quais domínios acessam a API. |
| **Bearer Token** | Tipo de token enviado no header `Authorization` para identificar o portador (Bearer). |
| **Refresh Token** | Token de longa duração usado para obter novos Access Tokens sem exigir novo login. |
| **Side Effect** | Qualquer mudança de estado fora da função principal (ex: Logar no console, Salvar no DB). |
| **Idempotency** | Propriedade de uma operação que pode ser repetida várias vezes sem mudar o resultado final. |
| **Tailwind CSS** | Framework CSS utility-first usado para construir a interface visual do FYNX. |
| **Mermaid.js** | Ferramenta usada para gerar os diagramas desta documentação a partir de texto. |

