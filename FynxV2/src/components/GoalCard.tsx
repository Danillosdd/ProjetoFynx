import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitialTransactionData } from "./AddTransactionSheet";

type Goal = {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  description?: string;
  goalType: 'spending' | 'saving';
};

interface GoalCardProps {
  goal: Goal;
  onAddTransaction: (data: InitialTransactionData) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const GoalCard = ({ goal, onAddTransaction }: GoalCardProps) => {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;

  if (goal.goalType === 'saving') {
    return (
      <Card className="w-full bg-card border-border hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
            <span className="truncate">{goal.title}</span>
            <Target className="h-5 w-5 text-accent flex-shrink-0" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 [&>div]:bg-accent" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Atual</span>
              <span className="font-semibold text-accent">{formatCurrency(goal.currentAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Meta</span>
              <span className="font-semibold text-foreground">{formatCurrency(goal.targetAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border">
              <span className="text-sm text-muted-foreground">Faltam</span>
              <span className="font-semibold text-foreground">{formatCurrency(remaining)}</span>
            </div>
          </div>
          <Button onClick={() => onAddTransaction({ type: 'income', goalId: goal.id })} className="w-full bg-primary hover:bg-primary/90" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Fundos
          </Button>
        </CardContent>
      </Card>
    );
  }

  const remainingPercent = (remaining / goal.targetAmount) * 100;
  const progressColor = progress > 80 ? 'bg-destructive' : progress > 50 ? 'bg-yellow-500' : 'bg-accent';
  const remainingColor = remainingPercent < 20 ? 'text-destructive' : remainingPercent < 50 ? 'text-yellow-500' : 'text-accent';

  return (
    <Card className="w-full bg-card border-border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          <span className="truncate">{goal.title}</span>
          <TrendingDown className="h-5 w-5 text-destructive flex-shrink-0" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className={cn("h-2", `[&>div]:${progressColor}`)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gasto</span>
            <span className={`font-semibold ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(goal.currentAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Limite</span>
            <span className="font-semibold text-foreground">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-border">
            <span className="text-sm text-muted-foreground">Disponível</span>
            <span className={cn("font-semibold", remainingColor)}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
        <Button onClick={() => onAddTransaction({ type: 'expense', spendingLimitId: goal.id })} className="w-full bg-primary hover:bg-primary/90" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Gasto
        </Button>
      </CardContent>
    </Card>
  );
};