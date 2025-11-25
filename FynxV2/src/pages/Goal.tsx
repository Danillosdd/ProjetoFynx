import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import { CreateGoalSheet } from "@/components/CreateGoalSheet"
import { AddTransactionSheet, InitialTransactionData } from "@/components/AddTransactionSheet"
import { useGoals, useCreateSpendingGoal, CreateSpendingGoalRequest, useDeleteGoal } from '@/hooks/useGoals'
import { useToast } from "@/hooks/use-toast"
import { GoalSection } from "@/components/GoalSection"

const Goals = () => {
  const { data, isLoading } = useGoals()
  const createGoal = useCreateSpendingGoal()
  const deleteGoal = useDeleteGoal()
  const { toast } = useToast()
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [initialTransactionData, setInitialTransactionData] = useState<InitialTransactionData | null>(null);

  const handleOpenTransactionSheet = (data: InitialTransactionData | null) => {
    setInitialTransactionData(data);
    setIsAddTransactionOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Meta excluída', description: 'A meta foi excluída com sucesso.' })
      },
      onError: () => {
        toast({ title: 'Erro', description: 'Não foi possível excluir a meta.', variant: 'destructive' })
      }
    })
  }

  const goals = useMemo(() => data?.spendingGoals ?? [], [data])
  const spendingGoals = useMemo(() => (data?.spendingGoals ?? []).filter((g: any) => (g.goalType || 'spending') === 'spending'), [data])
  const savingGoals = useMemo(() => (data?.spendingGoals ?? []).filter((g: any) => (g.goalType || 'spending') === 'saving'), [data])

  const addNewGoal = (goalData: any) => {
    if (goalData.goalType === 'saving') {
      const payload = {
        title: goalData.name,
        goalType: 'saving' as const,
        category: 'Outros',
        targetAmount: goalData.target_value,
        period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: goalData.target_date || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        description: goalData.description,
      } as CreateSpendingGoalRequest
      createGoal.mutate(payload, {
        onSuccess: () => {
          toast({ title: 'Meta criada!', description: `Meta "${goalData.name}" criada com sucesso` })
        },
        onError: () => {
          toast({ title: 'Erro ao criar meta', description: 'Não foi possível criar a meta', variant: 'destructive' })
        }
      })
      return
    }

    const payload = {
      title: goalData.name,
      goalType: 'spending' as const,
      category: goalData.category || 'Outros',
      targetAmount: goalData.target_value,
      period: (goalData.period || 'monthly') as 'monthly' | 'weekly' | 'yearly',
      startDate: goalData.start_date || new Date().toISOString().split('T')[0],
      endDate: goalData.end_date || goalData.target_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      description: goalData.description,
    } as CreateSpendingGoalRequest
    createGoal.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Meta criada!', description: `Meta "${goalData.name}" criada com sucesso` })
      },
      onError: () => {
        toast({ title: 'Erro ao criar meta', description: 'Não foi possível criar a meta', variant: 'destructive' })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-4">
        <div className="w-16 h-16 bg-accent/20 rounded-full animate-pulse" />
        <p className="text-muted-foreground">Carregando metas...</p>
      </div>
    )
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <Target className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Adicione sua primeira meta</h2>
          <p className="text-muted-foreground max-w-md">
            Defina seus objetivos financeiros e acompanhe seu progresso de forma visual e organizada.
          </p>
        </div>

        <CreateGoalSheet onCreateGoal={addNewGoal}>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-5 w-5 mr-2" />
            Criar Meta
          </Button>
        </CreateGoalSheet>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Minhas Metas</h1>
            <p className="text-muted-foreground">Acompanhe o progresso dos seus objetivos financeiros</p>
          </div>
        </div>

        <div className="space-y-6" data-tour="spending-goals-section">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">💸 Limites de Gasto</h2>
            <CreateGoalSheet initialGoalType="spending" onCreateGoal={addNewGoal}>
              <Button data-tour="create-spending-goal-btn">
                + Novo Limite
              </Button>
            </CreateGoalSheet>
          </div>
          <GoalSection title="" goals={spendingGoals} onAddTransaction={handleOpenTransactionSheet} onDelete={handleDeleteGoal} />
        </div>

        <div className="space-y-6" data-tour="saving-goals-section">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">💰 Metas de Poupança</h2>
            <CreateGoalSheet initialGoalType="saving" onCreateGoal={addNewGoal}>
              <Button data-tour="create-saving-goal-btn">
                + Nova Meta
              </Button>
            </CreateGoalSheet>
          </div>
          <GoalSection title="" goals={savingGoals} onAddTransaction={handleOpenTransactionSheet} onDelete={handleDeleteGoal} />
        </div>

      </main>
      <AddTransactionSheet open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} initialData={initialTransactionData}>
        <span className="hidden" />
      </AddTransactionSheet>
    </div>
  )
}

export default Goals