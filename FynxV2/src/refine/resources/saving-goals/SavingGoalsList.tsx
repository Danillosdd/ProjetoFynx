import React from 'react';
import { useList } from '@refinedev/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Eye, Edit, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';
import { SavingGoal } from '../../providers';
import { useAuth } from '@/context/AuthContext';

const SavingGoalsList: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useList<SavingGoal>({
    resource: 'saving-goals',
    pagination: {
      pageSize: 10,
    },
    sorters: [
      {
        field: 'targetDate',
        order: 'asc',
      },
    ],
    queryOptions: {
      enabled: !!user?.id,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando metas de economia...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Erro ao carregar metas de economia</div>
      </div>
    );
  }

  const savingGoals = data?.data || [];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return { variant: 'default' as const, text: 'Concluída' };
    if (percentage >= 75) return { variant: 'secondary' as const, text: 'Quase lá' };
    if (percentage >= 25) return { variant: 'outline' as const, text: 'Em progresso' };
    return { variant: 'destructive' as const, text: 'Iniciando' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Metas de Economia</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      <div className="grid gap-4">
        {savingGoals.map((goal) => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          const status = getStatusBadge(percentage);
          const daysRemaining = getDaysRemaining(goal.targetDate);

          return (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={status.variant}>{status.text}</Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Meta:</span>
                      <p className="font-semibold">R$ {goal.targetAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Economizado:</span>
                      <p className="font-semibold text-green-600">R$ {goal.currentAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Restante:</span>
                      <p className="font-semibold">R$ {(goal.targetAmount - goal.currentAmount).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencida'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Data limite: {formatDate(goal.targetDate)}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {percentage >= 100 ? 'Meta atingida!' :
                          daysRemaining <= 0 ? 'Prazo vencido' :
                            `${Math.ceil((goal.targetAmount - goal.currentAmount) / Math.max(daysRemaining, 1))} por dia`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {savingGoals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhuma meta de economia encontrada</p>
              <p>Defina metas para alcançar seus objetivos financeiros</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavingGoalsList;