import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingDown, PiggyBank, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitialTransactionData } from "./AddTransactionSheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Goal = {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  description?: string;
  goalType?: 'spending' | 'saving';
  category?: string;
};

interface GoalCardProps {
  goal: Goal;
  onAddTransaction: (data: InitialTransactionData) => void;
  onDelete?: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const GoalCard = ({ goal, onAddTransaction, onDelete }: GoalCardProps) => {
  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const percentageFormatted = percentage.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  if (goal.goalType === 'saving') {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-blue-50/5 dark:to-blue-900/10 p-5 transition-all hover:border-blue-500/30 hover:shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground tracking-tight truncate">{goal.title}</h4>
            {goal.category && (
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 mt-1">
                {goal.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => onAddTransaction({ type: 'income', goalId: goal.id })}
              data-tour="add-to-goal-btn"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                    data-tour="delete-goal-btn"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a meta "{goal.title}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(goal.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Acumulado</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(goal.currentAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">Objetivo</p>
              <p className="text-sm font-semibold">{formatCurrency(goal.targetAmount)}</p>
            </div>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary" data-tour="goal-progress-bar">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-medium">
            <span className="text-blue-600 dark:text-blue-400">
              {percentage >= 100 ? "Meta Atingida! 🎉" : "Em progresso"}
            </span>
            <span className="text-muted-foreground">{percentageFormatted}% concluído</span>
          </div>
        </div>
      </div>
    );
  }

  // Spending goal card
  const isOverLimit = goal.currentAmount > goal.targetAmount;
  const progressColor = isOverLimit ? "bg-destructive" : percentage > 80 ? "bg-yellow-500" : "bg-emerald-500";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-secondary/30 p-5 transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground tracking-tight truncate">{goal.title}</h4>
          {goal.category && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground mt-1">
              {goal.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onAddTransaction({ type: 'expense', spendingLimitId: goal.id })}
            data-tour="add-to-goal-btn"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  data-tour="delete-goal-btn"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a meta "{goal.title}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(goal.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gasto Atual</p>
            <p className={`text-2xl font-bold ${isOverLimit ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Limite</p>
            <p className="text-sm font-semibold">{formatCurrency(goal.targetAmount)}</p>
          </div>
        </div>

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary" data-tour="goal-progress-bar">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-medium">
          <span className={isOverLimit ? "text-destructive" : "text-emerald-600"}>
            {isOverLimit ? "Limite Excedido" : "Dentro do limite"}
          </span>
          <span className="text-muted-foreground">{percentageFormatted}% usado</span>
        </div>
      </div>
    </div>
  );
};