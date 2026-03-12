# Guia Maestro de Modelagem de Processos (BPMN) - Sistema FYNX (Rev08)

Este documento é o manual definitivo para a modelagem dos processos do FYNX. Ele define como cada fluxo deve ser desenhado visualmente em ferramentas de BPMN, separando as responsabilidades por **Raias (Lanes)** e detalhando a lógica de reprocessamento e gamificação baseada em percentis reais da codebase.

---

## 1. Definição Global das Raias (As "Pistas da Piscina")

Ao desenhar qualquer processo abaixo, você deve criar uma **Pool (Piscina)** chamada "Sistema FYNX" e dividi-la nestas 5 Raias:

1.  **Raia do Usuário:** Ações humanas (clicar, digitar, ler).
2.  **Raia do Frontend (Interface):** Validações visuais, botões, animações e alertas.
3.  **Raia do Backend (Servidor):** Onde as regras de negócio e os cálculos acontecem.
4.  **Raia do Banco de Dados (DB):** Onde a informação é gravada, apagada ou alterada.
5.  **Raia Externa (WhatsApp/IA):** Sistemas de terceiros (Meta, Evolution, Robô de IA).

---

## 2. Detalhamento dos 6 Módulos com Alocação em Raias

### MÓDULO 1: ACESSO E CONTA

#### Processo 1.1: Registro de Novo Usuário
*   **[Raia Usuário]**: Preenche formulário e clica em "Criar Conta".
*   **[Raia Frontend]**: Valida formato do e-mail (Zod). Se erro, exibe alerta. Se ok, envia POST.
*   **[Raia Backend]**: Recebe dados, verifica se o e-mail existe no Banco.
*   **[Raia Backend]**: Aplica Criptografia na senha (Bcrypt).
*   **[Raia Backend]**: Comando para inicializar Ranking (**Liga Bronze**, 0 Pontos).
*   **[Raia Banco de Dados]**: Grava novo registro na tabela `users` e `user_scores`.
*   **[Raia Backend]**: Gera Token JWT.
*   **[Raia Frontend]**: Recebe Token, salva no navegador e abre o Dashboard.

---

### MÓDULO 2: INTEGRAÇÃO WHATSAPP [STATUS: PLANEJADO]

#### Processo 2.1: Vinculação de Número (OTP)
*   **[Raia Usuário]**: Digita número de telefone na tela de Perfil.
*   **[Raia Backend]**: Gera código de 6 dígitos e inicia Cronômetro de 10 minutos.
*   **[Raia Externa (WhatsApp)]**: Envia mensagem para o celular do usuário.
*   **[Raia Usuário]**: Lê o código no celular e digita no site.
*   **[Raia Backend]**: Valida código vs. Tempo expirado.
*   **[Raia Banco de Dados]**: Atualiza status para `whatsapp_verified = true`.

---

### MÓDULO 3: GESTÃO DE TRANSAÇÕES (INCLUINDO EXCLUSÃO)

#### Processo 3.1: Cadastro de Transação (O Fluxo de Entrada)
*   **[Raia Usuário]**: Abre o modal, preenche dados e escolhe se vincula a uma Meta.
*   **[Raia Backend]**: Inicia uma **Transação Atômica SQL (BEGIN TRANSACTION)**.
*   **[Raia Backend]**: Se houver Meta, calcula o novo progresso.
*   **[Raia Banco de Dados]**: Tenta gravar a Transação e atualizar a Meta.
*   **[Raia Backend]**: **[Gateway de Erro]** Deu erro no Banco?
    *   *Sim:* Dispara **ROLLBACK** (Desfaz tudo no DB). Devolve erro ao Frontend.
    *   *Não:* Dispara **COMMIT** (Grava tudo definitivamente).
*   **[Raia Backend]**: (Background) Inicia Recalculo de Ranking e Pontuação.

#### Processo 3.3: Exclusão de Transação (Fluxo de Reprocessamento Completo)
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

---

### MÓDULO 4: PLANEJAMENTO E METAS

#### Processo 4.2: Meta de Gastos (Spending Goals)
*   **[Raia Usuário]**: Define categoria e valor máximo.
*   **[Raia Backend]**: Cria registro com `goal_type = 'spending'`.
*   **[Raia Banco de Dados]**: Salva meta.
*   **[Raia Backend]**: (Monitoramento) A cada nova transação na Raia 3.1, o sistema "pinga" aqui para ver se o limite foi atingido.

---

### MÓDULO 5: DASHBOARDS E RANKING (GAMIFICAÇÃO)

#### Processo 5.1: Carregamento do Painel
*   **[Raia Frontend]**: Ao abrir a tela, pede os dados (Request).
*   **[Raia Backend]**: Faz a "Varredura" no Banco (SELECT SUM) por categoria.
*   **[Raia Frontend]**: Recebe o JSON e "desenha" os gráficos de pizza e barras.

#### Processo 5.2: Robô de Gamificação (Cálculo de Pontos e Ligas)
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

---

### MÓDULO 6: NOTIFICAÇÕES E IA [STATUS: PLANEJADO]

#### Processo 6.1: Alertas de Teto de Gastos
*   **[Raia Backend]**: Verifica se saldo da Meta > 75% do limite.
*   **[Raia Externa (WhatsApp)]**: Dispara mensagem de alerta para o celular.

#### Processo 6.2: Registro por Voz (WhatsApp + IA)
*   **[Raia Usuário]**: Manda áudio no WhatsApp.
*   **[Raia Externa (IA)]**: Transcreve o áudio e extrai o valor e a categoria.
*   **[Raia Backend]**: Recebe o texto da IA e inicia o **Processo 3.1 (Cadastro)**.
*   **[Raia Externa (WhatsApp)]**: Responde ao usuário confirmando o registro.
