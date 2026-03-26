import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Target, Wallet, PiggyBank, TrendingUp, AlertCircle, Activity } from "lucide-react"
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

  const totalSavings = useMemo(() => savingGoals.reduce((acc, g) => acc + (g.currentAmount || 0), 0), [savingGoals])
  const totalSavingsTarget = useMemo(() => savingGoals.reduce((acc, g) => acc + (g.targetAmount || 0), 0), [savingGoals])
  const savingsProgress = totalSavingsTarget > 0 ? (totalSavings / totalSavingsTarget) * 100 : 0
  const completedSavings = useMemo(() => savingGoals.filter((g: any) => g.currentAmount >= g.targetAmount).length, [savingGoals])
  
  const totalSpent = useMemo(() => spendingGoals.reduce((acc, g) => acc + (g.currentAmount || 0), 0), [spendingGoals])
  const totalSpendingLimits = useMemo(() => spendingGoals.reduce((acc, g) => acc + (g.targetAmount || 0), 0), [spendingGoals])
  const spendingProgress = totalSpendingLimits > 0 ? (totalSpent / totalSpendingLimits) * 100 : 0
  const exceededLimits = useMemo(() => spendingGoals.filter((g: any) => g.currentAmount > g.targetAmount).length, [spendingGoals])

  const formatValue = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const addNewGoal = (goalData: any) => {
    if (goalData.goalType === 'saving') {
      const payload = {
        title: goalData.name,
        goal_type: 'saving' as const,
        category: 'Outros',
        target_amount: goalData.target_value,
        period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: goalData.target_date || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
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
      goal_type: 'spending' as const,
      category: goalData.category || 'Outros',
      target_amount: goalData.target_value,
      period: (goalData.period || 'monthly') as 'monthly' | 'weekly' | 'yearly',
      start_date: goalData.start_date || new Date().toISOString().split('T')[0],
      end_date: goalData.end_date || goalData.target_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
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
      <div className="flex min-h-screen w-full flex-col bg-transparent p-4 sm:p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 apple-glass border-none animate-pulse rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 p-4">
        <div className="flex flex-col items-center justify-center space-y-4 apple-glass p-12 rounded-3xl animate-slide-in-up border border-dashed border-white/20">
          <div className="flex -space-x-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-lime-500/10 flex items-center justify-center border border-lime-500/30">
              <Wallet className="h-6 w-6 text-lime-400 animate-pulse" />
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
              <PiggyBank className="h-6 w-6 text-purple-400 animate-pulse" style={{ animationDelay: '500ms' }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Sua jornada começa aqui</h2>
          <p className="text-muted-foreground max-w-md text-center text-lg">
            Defina limites inteligentes e acompanhe suas economias. Crie sua primeira meta para destravar seus gráficos e painéis interativos.
          </p>
          <CreateGoalSheet onCreateGoal={addNewGoal}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 h-12 px-8 text-md font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeira Meta
            </Button>
          </CreateGoalSheet>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col bg-transparent overflow-hidden">
      <main className="flex flex-col h-full gap-5 min-h-0 pb-2">
        
        {/* Fixed Header & Bento Box */}
        <div className="flex-none space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in-up">
              <h1 className="text-3xl font-extrabold tracking-tight text-gradient">Minhas Metas</h1>
              <p className="text-sm text-muted-foreground">Acompanhe o progresso dos seus objetivos financeiros</p>
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {/* Card 1: Total Savings */}
          <div className="apple-glass rounded-2xl p-5 flex flex-col justify-center border-l-4 border-purple-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden group">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PiggyBank className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold uppercase tracking-wider text-xs">Total Acumulado</span>
            </div>
            <div className="text-3xl font-extrabold text-foreground mb-1">{formatValue(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">{completedSavings} {completedSavings === 1 ? 'meta atingida' : 'metas atingidas'}</p>
          </div>

          {/* Card 2: Savings Progress */}
          <div className="apple-glass rounded-2xl p-5 flex flex-col justify-center border-l-4 border-cyan-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden group">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold uppercase tracking-wider text-xs">Prog. Poupança</span>
            </div>
            <div className="text-3xl font-extrabold text-foreground mb-1">{savingsProgress.toFixed(1)}%</div>
            <div className="w-full bg-black/30 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(savingsProgress, 100)}%` }} />
            </div>
          </div>

          {/* Card 3: Total Spent vs Limits */}
           <div className="apple-glass rounded-2xl p-5 flex flex-col justify-center border-l-4 border-lime-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden group">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold uppercase tracking-wider text-xs">Global de Gastos</span>
            </div>
            <div className="text-3xl font-extrabold text-foreground mb-1">{formatValue(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Orçamento: {formatValue(totalSpendingLimits)}</p>
          </div>

          {/* Card 4: Global Consumption / Warnings */}
          <div className={`apple-glass rounded-2xl p-5 flex flex-col justify-center border-l-4 ${spendingProgress > 100 ? 'border-destructive' : 'border-emerald-500'} hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ease-[timing-function:cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden group`}>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              {spendingProgress > 100 ? <AlertCircle className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform animate-pulse" /> : <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />}
              <span className="font-semibold uppercase tracking-wider text-xs">Saúde do Mês</span>
            </div>
            <div className={`text-3xl font-extrabold mb-1 ${spendingProgress > 100 ? 'text-destructive' : 'text-foreground'}`}>{spendingProgress.toFixed(1)}%</div>
            <p className={`text-xs ${exceededLimits > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>{exceededLimits} {exceededLimits === 1 ? 'limite estourado' : 'limites estourados'}</p>
          </div>
        </div>

        </div>

        {/* Dual Axis Scrolling Container */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          
          {/* Left Column: Spending Limits */}
          <div className="flex flex-col h-full min-h-0 space-y-3" data-tour="spending-goals-section">
            <div className="flex-none flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Wallet className="w-5 h-5 text-lime-400" />
                Limites de Gasto
              </h2>
              <CreateGoalSheet initialGoalType="spending" onCreateGoal={addNewGoal}>
                <Button data-tour="create-spending-goal-btn" size="sm" className="hover:scale-105 transition-transform">
                  + Novo Limite
                </Button>
              </CreateGoalSheet>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              <GoalSection title="" goals={spendingGoals} onAddTransaction={handleOpenTransactionSheet} onDelete={handleDeleteGoal} compactLayout />
            </div>
          </div>

          {/* Right Column: Saving Goals */}
          <div className="flex flex-col h-full min-h-0 space-y-3" data-tour="saving-goals-section">
            <div className="flex-none flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-purple-400" />
                Metas de Poupança
              </h2>
              <CreateGoalSheet initialGoalType="saving" onCreateGoal={addNewGoal}>
                <Button data-tour="create-saving-goal-btn" size="sm" className="hover:scale-105 transition-transform">
                  + Nova Meta
                </Button>
              </CreateGoalSheet>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              <GoalSection title="" goals={savingGoals} onAddTransaction={handleOpenTransactionSheet} onDelete={handleDeleteGoal} compactLayout />
            </div>
          </div>
          
        </div>

      </main>
      <AddTransactionSheet open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} initialData={initialTransactionData}>
        <span className="hidden" />
      </AddTransactionSheet>
    </div>
  )
}

export default Goals