import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingDown, PiggyBank, Trash2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitialTransactionData } from "./AddTransactionSheet";
import { motion } from "framer-motion";
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
  const rawPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const percentage = Math.min(rawPercentage, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const percentageFormatted = rawPercentage.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  if (goal.goalType === 'saving') {
    const isCompleted = percentage >= 100;
    
    const cardContainerClass = cn(
      "group relative overflow-hidden rounded-xl p-5 transition-all duration-500 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl",
      isCompleted 
        ? "bg-purple-950/20 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)_inset] hover:border-purple-400" 
        : "apple-glass hover:border-white/20"
    );

    return (
      <div className={cardContainerClass}>
        {/* Shimmer Light Sweep */}
        {isCompleted && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
            <motion.div 
              className="w-[200%] h-full bg-gradient-to-r from-transparent via-purple-300/10 to-transparent skew-x-12 absolute -left-full mix-blend-overlay"
              animate={{ left: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1.5 }}
            />
          </div>
        )}

        {/* Success Watermark - Spring Loaded */}
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.1 }}
            className="absolute -right-6 -top-6 w-40 h-40 pointer-events-none z-0"
          >
            <Trophy 
              className="w-full h-full text-purple-500/10 drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6" 
              fill="currentColor"
            />
          </motion.div>
        )}

        <div className="flex items-start justify-between mb-4 relative z-10">
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
              aria-label="Adicionar transação"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 hover:text-white"
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
                    aria-label="Excluir meta"
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

        <div className="space-y-3 relative z-10">
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

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/30 ring-1 ring-inset ring-white/10" data-tour="goal-progress-bar">
            <div
              className={`absolute top-0 left-0 h-full ${isCompleted ? 'bg-gradient-to-r from-purple-600 to-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.7)]' : 'bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]'} transition-all duration-1000 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)]`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-[2px]" />
            </div>
          </div>

          <div className="flex justify-between text-xs font-medium">
            <span className={isCompleted ? "text-purple-400 font-bold" : "text-blue-600 dark:text-blue-400"}>
              {isCompleted ? <span className="flex items-center gap-1 animate-pulse">Meta Atingida! <Trophy className="h-4 w-4" fill="currentColor" /></span> : "Em progresso"}
            </span>
            <span className={isCompleted ? "text-purple-400 font-bold" : "text-muted-foreground"}>{percentageFormatted}% concluído</span>
          </div>
        </div>
      </div>
    );
  }

  // Spending goal card
  const isOverLimit = goal.currentAmount > goal.targetAmount;
  const progressColor = isOverLimit ? "from-red-600 to-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.7)]" : percentage > 80 ? "from-orange-600 to-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.7)]" : "from-emerald-600 to-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.7)]";

  const cardContainerClass = cn(
    "group relative overflow-hidden rounded-xl p-5 transition-all duration-500 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl",
    isOverLimit 
      ? "bg-red-950/30 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)_inset] hover:border-red-400" 
      : "apple-glass hover:border-white/20"
  );

  return (
    <div className={cardContainerClass}>
      {/* Danger Shimmer Sweep */}
      {isOverLimit && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-xl">
          <motion.div 
            className="w-[200%] h-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent skew-x-12 absolute -left-full mix-blend-overlay"
            animate={{ left: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2.0, ease: "linear", repeatDelay: 1 }}
          />
        </div>
      )}

      {/* Danger Threat Watermark - Spring Loaded */}
      {isOverLimit && (
        <motion.div 
          initial={{ scale: 0, opacity: 0, rotate: 45 }}
          animate={{ scale: 1, opacity: 1, rotate: 12 }}
          transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.1 }}
          className="absolute -right-6 -top-6 w-40 h-40 pointer-events-none z-0"
        >
          <TrendingDown 
            className="w-full h-full text-red-500/10 drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-24" 
            strokeWidth={1.5}
          />
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-4 relative z-10">
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
            aria-label="Adicionar transação"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 hover:text-white"
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
                  aria-label="Excluir meta"
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

      <div className="space-y-3 relative z-10">
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

        <div className="relative h-3 w-full overflow-hidden rounded-full bg-black/30 ring-1 ring-inset ring-white/10" data-tour="goal-progress-bar">
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${progressColor} transition-all duration-1000 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)]`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-[2px]" />
          </div>
        </div>

        <div className="flex justify-between text-xs font-medium">
          <span className={isOverLimit ? "text-red-400 font-bold animate-pulse" : "text-emerald-600"}>
            {isOverLimit ? `Excedido em ${(rawPercentage - 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : "Dentro do limite"}
          </span>
          <span className={isOverLimit ? "text-red-400 font-bold" : "text-muted-foreground"}>{percentageFormatted}% usado</span>
        </div>
      </div>
    </div>
  );
};