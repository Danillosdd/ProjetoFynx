import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AddTransactionSheet, InitialTransactionData } from "@/components/AddTransactionSheet"
import { CreateGoalSheet } from "@/components/CreateGoalSheet"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { useList, useInvalidate } from "@refinedev/core"
import { useDashboard, useDeleteTransaction } from "@/hooks/useDashboard"
import {
  Eye, TrendingUp, TrendingDown, Users,
  ArrowUpRight, ArrowDownRight, Plus,
  MoreHorizontal, CheckCircle, Clock, AlertCircle, CalendarIcon, Trash2,
  Target as TargetIcon, PiggyBank, ChevronDown
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, YAxis, Tooltip, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DashboardData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useGoals, useCreateSpendingGoal, useDeleteGoal } from '@/hooks/useGoals'
import { useNavigate, useSearchParams } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/apiClient"
import { useQueryClient } from "@tanstack/react-query"
import { List as VirtualList } from "react-window"
import { X } from "lucide-react"
import { TourButton } from '@/components/TourButton'
import { useTour } from '@/hooks/useTour'
import { dashboardSteps } from '@/tours/dashboardTour'
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
} from "@/components/ui/alert-dialog"
import { WalletGoalsWidget } from "@/components/WalletGoalsWidget"

// Map overview titles to icons from lucide-react
const overviewIconMap: Record<string, React.ComponentType<any>> = {
  "Total Balance": Eye,
  "Monthly Balance": Eye,
  "Monthly Income": TrendingUp,
  "Total Income": TrendingUp,
  "Monthly Expenses": TrendingDown,
  "Total Expense": TrendingDown,
  "Total Expenses": TrendingDown,
  "Savings Rate": Users,
  "Saving Rate": Users,
}









const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "#8b5cf6",
  },
  despesas: {
    label: "Despesas",
    color: "#84cc16",
  },
} satisfies ChartConfig;

const Index = () => {
  const [chartView, setChartView] = React.useState<"income" | "expense">("income")
  const [monthlyTimeRange, setMonthlyTimeRange] = React.useState("12m")
  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false)
  const [initialTransactionData, setInitialTransactionData] = React.useState<InitialTransactionData | null>(null);
  const { data: dashboardData } = useDashboard()
  // const { data: transactionHistory } = useTransactionHistory()
  const { data: goalsData, isLoading: goalsLoading, error: goalsError } = useGoals()
  const createGoal = useCreateSpendingGoal()
  const deleteGoal = useDeleteGoal()
  const spendingGoals = React.useMemo(() => (goalsData?.spendingGoals || []).filter((g: any) => (g.goalType || 'spending') === 'spending'), [goalsData])
  const savingGoals = React.useMemo(() => (goalsData?.spendingGoals || []).filter((g: any) => (g.goalType || 'spending') === 'saving'), [goalsData])

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
      }
      createGoal.mutate(payload, {
        onSuccess: () => toast({ title: 'Meta criada!', description: `Meta "${goalData.name}" criada com sucesso` }),
        onError: () => toast({ title: 'Erro ao criar meta', description: 'Não foi possível criar a meta', variant: 'destructive' })
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
    }
    createGoal.mutate(payload, {
      onSuccess: () => toast({ title: 'Meta criada!', description: `Meta "${goalData.name}" criada com sucesso` }),
      onError: () => toast({ title: 'Erro ao criar meta', description: 'Não foi possível criar a meta', variant: 'destructive' })
    })
  }
  const dashboard = dashboardData as DashboardData
  const { toast } = useToast()
  const { mutate: deleteTransaction } = useDeleteTransaction()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deleteTargetId, setDeleteTargetId] = React.useState<number | string | null>(null)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isExpandedOpen, setIsExpandedOpen] = React.useState(() => {
    const fromListFlag = searchParams.has("ListTransaction")
    const fromModal = searchParams.get("modal") === "transactions"
    return fromListFlag || fromModal
  })
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortField, setSortField] = React.useState<"date" | "type" | "category">("date")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = React.useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = React.useState<string>("all")
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set())
  // Dados paginados da modal de transações
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(100)
  const [items, setItems] = React.useState<any[]>([])
  const [searchDebounced, setSearchDebounced] = React.useState("")

  const { data: txPage, isFetching: isFetchingTx } = useList({
    resource: "transactions",
    pagination: { current: page, pageSize },
    filters: [
      filterType !== "all" ? { field: "type", operator: "eq", value: filterType } : undefined,
      filterCategory !== "all" ? { field: "category", operator: "eq", value: filterCategory } : undefined,
      searchDebounced ? { field: "search", operator: "contains", value: searchDebounced } : undefined,
    ].filter(Boolean) as any,
    sorters: [{ field: sortField, order: sortOrder }],
    queryOptions: { keepPreviousData: true, enabled: isExpandedOpen },
  })

  // Debounce de busca
  React.useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Reset de paginação ao mudar filtros/ordenacao/busca ou abrir modal
  React.useEffect(() => {
    if (!isExpandedOpen) return
    setPage(1)
    setItems([])
  }, [isExpandedOpen, filterType, filterCategory, sortField, sortOrder, searchDebounced])

  // Acumular páginas
  React.useEffect(() => {
    const pageData = txPage?.data ?? []
    if (!isExpandedOpen) return
    if (page === 1) {
      setItems(pageData)
    } else if (pageData.length) {
      setItems((prev) => {
        const seen = new Set(prev.map((p: any) => p.id))
        const merged = [...prev]
        for (const it of pageData) {
          if (!seen.has(it.id)) merged.push(it)
        }
        return merged
      })
    }
  }, [txPage?.data, page, isExpandedOpen])

  const total = txPage?.total ?? 0
  const hasMore = items.length < total

  // Sentinel para scroll infinito dentro da lista virtualizada
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    if (!isExpandedOpen) return
    const outer = sentinelRef.current?.parentElement?.parentElement || null
    if (!outer) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingTx) {
          setPage((p) => p + 1)
        }
      },
      { root: outer, rootMargin: "200px", threshold: 0 }
    )
    const el = sentinelRef.current
    if (el) obs.observe(el)
    return () => {
      if (el) obs.unobserve(el)
      obs.disconnect()
    }
  }, [hasMore, isFetchingTx, isExpandedOpen])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = React.useState(false)
  const queryClient = useQueryClient()

  // Tour integration
  const { startTour, isFirstVisit } = useTour();

  // Auto-start tour for first-time visitors
  React.useEffect(() => {
    if (isFirstVisit) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        startTour(dashboardSteps);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit, startTour]);

  const invalidate = useInvalidate()
  const [listHeight, setListHeight] = React.useState(500)
  const [listWidth, setListWidth] = React.useState<number>(900)

  const recentTransactionsSorted = React.useMemo(() => {
    const arr = dashboard?.recentTransactions ?? []
    return [...arr].sort((a: any, b: any) => {
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()
      if (timeB !== timeA) return timeB - timeA
      const idA = Number(a.id) || 0
      const idB = Number(b.id) || 0
      return idB - idA
    })
  }, [dashboard?.recentTransactions])

  const availableCategories = React.useMemo(() => {
    const set = new Set<string>()
    for (const t of items) {
      if (t?.category) set.add(t.category)
    }
    return Array.from(set)
  }, [items])

  const expandedTransactions = items

  const clearFilters = () => {
    setSearchQuery("")
    setSortField("date")
    setSortOrder("desc")
    setFilterType("all")
    setFilterCategory("all")
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = React.useMemo(() => {
    const arr = expandedTransactions
    if (arr.length === 0) return false
    return arr.every((t: any) => selectedIds.has(Number(t.id)))
  }, [expandedTransactions, selectedIds])

  const selectAllFiltered = () => {
    const allIds = expandedTransactions.map((t: any) => Number(t.id))
    setSelectedIds(new Set(allIds))
  }

  const clearSelection = () => setSelectedIds(new Set())

  const toggleSelectAll = () => {
    if (allSelected) clearSelection()
    else selectAllFiltered()
  }

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return
    setIsBulkDeleteDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    try {
      const body = {
        userId: 1,
        operation: "delete",
        transactionIds: Array.from(selectedIds),
      }
      const res = await api.post<{ successCount: number; failedCount: number; errors?: string[] }>("/transactions/bulk", body)

      // Mensagens de toast mais amigáveis
      if (res.failedCount === 0) {
        toast({ title: "Transações apagadas", description: `${res.successCount} transações foram removidas com sucesso.` })
      } else if (res.successCount > 0) {
        toast({ title: "Remoção concluída", description: `${res.successCount} removidas. ${res.failedCount} não puderam ser removidas.` })
      } else {
        toast({ title: "Nada foi removido", description: "Não foi possível remover as transações selecionadas.", variant: "destructive" })
      }

      setIsBulkDeleteDialogOpen(false)
      setSelectedIds(new Set())

      // Resetar paginação e lista para refletir o estado atualizado
      setPage(1)
      setItems([])

      // Invalidações para sincronizar outras visões
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      await queryClient.invalidateQueries({ queryKey: ["transactions"] })
      invalidate({ resource: "transactions", invalidates: ["list"] })
    } catch (e: any) {
      toast({ title: "Erro na exclusão", description: e.message, variant: "destructive" })
      setIsBulkDeleteDialogOpen(false)
    }
  }

  React.useEffect(() => {
    const h = Math.ceil(window.innerHeight * 0.6)
    setListHeight(Math.min(h, 700))
    const w = Math.min(960, window.innerWidth - 80)
    setListWidth(w)
  }, [])

  React.useEffect(() => {
    const modal = searchParams.get("modal")
    const listFlag = searchParams.has("ListTransaction")
    if (modal === "transactions" || listFlag) {
      setIsExpandedOpen(true)
    }
    const sq = searchParams.get("search")
    const sf = (searchParams.get("sort") as "date" | "type" | "category") || undefined
    const so = (searchParams.get("order") as "asc" | "desc") || undefined
    const ft = (searchParams.get("type") as "all" | "income" | "expense") || undefined
    const fc = searchParams.get("category") || undefined
    if (sq !== null) setSearchQuery(sq)
    if (sf) setSortField(sf)
    if (so) setSortOrder(so)
    if (ft) setFilterType(ft)
    if (fc) setFilterCategory(fc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (!isExpandedOpen) return
    // Manter a URL limpa: apenas ?ListTransaction
    navigate(`${window.location.pathname}?ListTransaction`, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpandedOpen])

  const handleExpandedOpenChange = (open: boolean) => {
    setIsExpandedOpen(open)
    if (open) {
      navigate(`${window.location.pathname}?ListTransaction`, { replace: true })
    } else {
      clearSelection()
      navigate(`${window.location.pathname}`, { replace: true })
    }
  }

  const handleDelete = (id: number | string) => {
    setDeleteTargetId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTargetId) return
    deleteTransaction(deleteTargetId, {
      onSuccess: () => {
        // Remover imediatamente a transação da lista da modal
        setItems((prev) => prev.filter((t: any) => String(t.id) !== String(deleteTargetId)))
        // Remover da seleção, se estiver selecionada
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(Number(deleteTargetId))
          return next
        })
        // Invalidar a lista do Refine para manter o estado em sincronia
        invalidate({ resource: "transactions", invalidates: ["list"] })
        // Toast amigável
        toast({ title: "Transação apagada", description: "A transação foi removida com sucesso." })
      },
      onError: () => {
        toast({ title: "Não foi possível remover", description: "Tente novamente mais tarde.", variant: "destructive" })
      },
      onSettled: () => {
        setIsDeleteDialogOpen(false)
        setDeleteTargetId(null)
      },
    })
  }

  // Estados para o Daily Comparison
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    return {
      from: thirtyDaysAgo,
      to: today
    }
  })

  // Handler para o Calendar
  const handleDateRangeSelect = (range: { from: Date | undefined; to?: Date | undefined } | undefined) => {
    if (range) {
      setDateRange({
        from: range.from,
        to: range.to
      })
    }
  }

  const handleOpenTransactionSheet = (data: InitialTransactionData | null) => {
    setInitialTransactionData(data);
    setIsAddTransactionOpen(true);
  };

  // Backend-driven datasets
  const incomePalette = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#14b8a6", "#22c55e", "#6366f1"]
  const expensePalette = ["#ef4444", "#f97316", "#8b5cf6", "#06b6d4", "#10b981", "#6b7280", "#eab308"]

  const incomeChartData = (dashboard?.incomeByCategory ?? []).map((item, index) => ({
    category: item.category,
    value: item.value,
    fill: incomePalette[index % incomePalette.length],
  }))
  const expenseChartData = (dashboard?.spendingByCategory ?? []).map((item, index) => ({
    category: item.category,
    value: item.value,
    fill: expensePalette[index % expensePalette.length],
  }))

  const dailyDataBackend = (dashboard?.dailyPerformance ?? []).map((item) => ({
    date: item.date,
    receitas: item.income,
    despesas: item.expense,
  }))

  const monthlyDataBackend = (dashboard?.monthlyPerformance ?? []).map((item) => ({
    month: item.month,
    receitas: item.income,
    despesas: item.expense,
  }))

  // Filtrar dados diários baseado no range de datas selecionado
  const filteredDailyData = dailyDataBackend.filter((item) => {
    if (!dateRange.from || !dateRange.to) return true
    const itemDate = new Date(item.date)
    return itemDate >= dateRange.from && itemDate <= dateRange.to
  })

  // Filtrar dados mensais para o gráfico de barras
  const filteredMonthlyData = monthlyDataBackend.filter((item, index) => {
    let monthsToShow = 12
    if (monthlyTimeRange === "6m") {
      monthsToShow = 6
    } else if (monthlyTimeRange === "3m") {
      monthsToShow = 3
    }
    return index >= monthlyDataBackend.length - monthsToShow
  })
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visão Geral Financeira</h1>
          <p className="text-muted-foreground">Acompanhe seu desempenho financeiro</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(dashboard?.overview || []).map((item, index) => {
          const title = String(item.title || '').toLowerCase();
          const getTourKey = (t: string) => {
            if (t.includes('balance')) return 'balance-card';
            if (t.includes('income')) return 'income-card';
            if (t.includes('expense') || t.includes('expenses')) return 'expenses-card';
            if (t.includes('saving') || t.includes('savings')) return 'savings-card';
            return undefined;
          };
          const tourKey = getTourKey(title);
          const tourAttr = tourKey ? ({ ['data-tour']: tourKey } as any) : {};

          return (
            <Card key={index} {...tourAttr} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
                  {overviewIconMap[item.title] ? (
                    React.createElement(overviewIconMap[item.title], { className: "h-5 w-5 text-muted-foreground" })
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className={`text-sm flex items-center ${item.trend === "up" ? "text-success" : "text-destructive"
                    }`}>
                    {item.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {item.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Breakdown Chart - First (1/4) */}
        <Card data-tour="category-chart" className="bg-card border-border col-span-1">
          <CardHeader className="pb-2">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold">Detalhamento por Categoria</CardTitle>
                </div>
                <Select value={chartView} onValueChange={(value: "income" | "expense") => setChartView(value)}>
                  <SelectTrigger className="w-[120px] flex-shrink-0 hover:bg-accent hover:text-accent-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">Visualize suas entradas e saídas</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartView === "income" ? incomeChartData : expenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="75%"
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {(chartView === "income" ? incomeChartData : expenseChartData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  {chartView === "income" ? "Total Entradas" : "Total Saídas"}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-center">
                  R$ {(chartView === "income"
                    ? incomeChartData.reduce((sum, item) => sum + item.value, 0)
                    : expenseChartData.reduce((sum, item) => sum + item.value, 0)
                  ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(chartView === "income" ? incomeChartData : expenseChartData).map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-muted-foreground truncate flex-1">{item.category}</span>
                  <span className="text-sm font-medium whitespace-nowrap">
                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Comparison Chart - Second (2/4) */}
        <Card data-tour="revenue-chart" className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle className="text-lg font-semibold">Comparação Diária</CardTitle>
              <CardDescription>
                Receitas e despesas diárias no período selecionado
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecionar período</span>
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end" sideOffset={8} avoidCollisions={false}>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[320px] w-full"
            >
              <AreaChart data={filteredDailyData}>
                <defs>
                  <linearGradient id="fillReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-receitas)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-receitas)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-despesas)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-despesas)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })
                      }}
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
                    />
                  }
                />
                <Area
                  dataKey="despesas"
                  type="natural"
                  fill="url(#fillDespesas)"
                  stroke="var(--color-despesas)"
                  stackId="a"
                />
                <Area
                  dataKey="receitas"
                  type="natural"
                  fill="url(#fillReceitas)"
                  stroke="var(--color-receitas)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Confirmação de Exclusão */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open)
            if (!open) setDeleteTargetId(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transação</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. Tem certeza que deseja excluir?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Wallet Goals Widget - Third (1/4) */}
        <div className="col-span-1 h-full">
          <WalletGoalsWidget
            spendingGoals={spendingGoals}
            savingGoals={savingGoals}
            onAddTransaction={handleOpenTransactionSheet}
            onDeleteGoal={handleDeleteGoal}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card data-tour="recent-transactions" className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid gap-4 text-sm font-medium text-muted-foreground pb-2" style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 1.2fr 0.6fr' }}>
                <span>Descrição</span>
                <span>Tipo</span>
                <span>Valor</span>
                <span>Data</span>
                <span>Categoria</span>
                <span>Ações</span>
              </div>

              {/* Transaction Rows */}
              {recentTransactionsSorted.map((transaction: any) => {
                const isBackend = typeof transaction.amount === 'number'
                const color = (transaction.type === 'income' || transaction.type === 'Income') ? 'success' : 'destructive'
                const amountStr = isBackend ? `R$ ${Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : transaction.amount
                const dateStr = isBackend ? format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR }) : transaction.date
                const typeLabel = isBackend ? (transaction.type === 'income' ? 'Entrada' : 'Saída') : transaction.type
                return (
                  <div key={transaction.id} className="grid gap-4 items-center py-3 border-b border-border last:border-0" style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr 1.2fr 0.6fr' }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${color === 'success' ? 'bg-success' :
                        color === 'destructive' ? 'bg-destructive' :
                          'bg-warning'
                        }`} />
                      <span className="font-medium text-foreground">{transaction.description}</span>
                    </div>
                    <span className="text-muted-foreground">{typeLabel}</span>
                    <span className={`font-semibold ${color === 'success' ? 'text-success' : 'text-destructive'
                      }`}>
                      {amountStr}
                    </span>
                    <span className="text-muted-foreground">{dateStr}</span>
                    <span className="text-muted-foreground">{transaction.category}</span>
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleDelete(transaction.id)}
                        aria-label="Remover transação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground h-8 text-xs" onClick={() => setIsExpandedOpen(true)}>
                Ver Mais Transações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal Expandido - Recent Transactions */}
        <Dialog open={isExpandedOpen} onOpenChange={handleExpandedOpenChange}>
          <DialogContent className="sm:max-w-5xl">
            <DialogHeader className="flex items-center">
              <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight">Transação</DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Fechar"
                className="absolute right-4 top-4 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
            <div className="flex flex-col gap-4">
              {/* Controles de busca, ordenação e filtros */}
              {/* Campo de busca em linha separada */}
              <div>
                <Label>Buscar</Label>
                <Input
                  placeholder="Buscar por descrição, categoria, data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              {/* Demais filtros alinhados na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <Label>Ordenar por</Label>
                  <Select value={sortField} onValueChange={(v) => setSortField(v as any)}>
                    <SelectTrigger className="hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="type">Tipo</SelectItem>
                      <SelectItem value="category">Categoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                    <SelectTrigger className="hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Ordem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                    <SelectTrigger className="hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Entrada</SelectItem>
                      <SelectItem value="expense">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v)}>
                    <SelectTrigger className="hover:bg-accent hover:text-accent-foreground">
                      <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">Limpar Filtros</Button>
                </div>
              </div>

              {/* Ações de seleção */}
              <div className="flex items-center justify-end gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleBulkDeleteClick}
                    disabled={selectedIds.size === 0}
                  >
                    Excluir selecionadas ({selectedIds.size})
                  </Button>
                </div>
              </div>

              {/* Lista expandida de transações */}
              <div className="space-y-2 overflow-x-auto">
                <div className="grid gap-4 text-sm font-medium text-muted-foreground pb-2 min-w-[900px] border-b border-border" style={{ gridTemplateColumns: '80px 2fr 1fr 1.2fr 1fr 1.2fr 0.6fr' }}>
                  <div className="flex items-center justify-center border-r border-border">
                    <Checkbox 
                      checked={allSelected} 
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </div>
                  <span className="border-r border-border text-center">Descrição</span>
                  <span className="border-r border-border text-center">Tipo</span>
                  <span className="border-r border-border text-center">Valor</span>
                  <span className="border-r border-border text-center">Data</span>
                  <span className="border-r border-border text-center">Categoria</span>
                  <span className="text-center">Ações</span>
                </div>
                <div className="min-w-[900px]">
                  <VirtualList
                    className="divide-y divide-border"
                    style={{ height: listHeight }}
                    rowCount={expandedTransactions.length + 1}
                    rowHeight={64}
                    overscanCount={12}
                    rowProps={{ items: expandedTransactions, selectedIds, toggleSelect, handleDelete, hasMore, isFetchingTx }}
                    rowComponent={({ index, style, ariaAttributes, ...rowProps }) => {
                      const { items, selectedIds, toggleSelect, handleDelete, hasMore, isFetchingTx } = rowProps as any
                      // Sentinel na última linha para scroll infinito
                      if (index === items.length) {
                        return (
                          <div style={{ ...style, display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1.2fr 1fr 1.2fr 0.6fr', gap: '1rem', minWidth: '900px' }} {...ariaAttributes}>
                            <div ref={sentinelRef} style={{ gridColumn: '1 / -1' }} className="flex items-center justify-center py-2">
                              {hasMore ? (
                                <span className="text-sm text-muted-foreground">{isFetchingTx ? "Carregando mais..." : "Role para carregar mais"}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Fim das transações</span>
                              )}
                            </div>
                          </div>
                        )
                      }
                      const transaction = items[index]
                      const color = transaction.type === 'income' ? 'success' : 'destructive'
                      const amountStr = `R$ ${Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      const dateStr = format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })
                      const typeLabel = transaction.type === 'income' ? 'Entrada' : 'Saída'
                      const checked = selectedIds.has(Number(transaction.id))
                      return (
                        <div style={{ ...style, display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1.2fr 1fr 1.2fr 0.6fr', gap: '1rem', alignItems: 'center', paddingLeft: '0.5rem', paddingRight: '0.5rem', minWidth: '900px' }} {...ariaAttributes}>
                          <div className="flex items-center justify-center border-r border-border">
                            <Checkbox checked={checked} onCheckedChange={() => toggleSelect(Number(transaction.id))} />
                          </div>
                          <div className="flex items-center gap-2 border-r border-border">
                            <div className={`w-2 h-2 rounded-full ${color === 'success' ? 'bg-success' : 'bg-destructive'}`} />
                            <span className="font-medium text-foreground">{transaction.description}</span>
                          </div>
                          <span className="text-muted-foreground border-r border-border">{typeLabel}</span>
                          <span className={`font-semibold border-r border-border ${color === 'success' ? 'text-success' : 'text-destructive'}`}>{amountStr}</span>
                          <span className="text-muted-foreground border-r border-border">{dateStr}</span>
                          <span className="text-muted-foreground border-r border-border">{transaction.category}</span>
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDelete(transaction.id)}
                              aria-label="Remover transação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    }}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmação de Exclusão em Lote */}
        <AlertDialog
          open={isBulkDeleteDialogOpen}
          onOpenChange={(open) => setIsBulkDeleteDialogOpen(open)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir transações selecionadas</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação removerá {selectedIds.size} transações. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Entradas e Saídas Mensais */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">Entradas e Saídas Mensais</CardTitle>
              <p className="text-sm text-muted-foreground">Visualize o fluxo de caixa mensal</p>
            </div>
            <Select value={monthlyTimeRange} onValueChange={setMonthlyTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px] hover:bg-accent hover:text-accent-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="12m">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[320px] w-full"
            >
              <BarChart data={filteredMonthlyData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
                    />
                  }
                />
                <Bar
                  dataKey="receitas"
                  fill="var(--color-receitas)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="despesas"
                  fill="var(--color-despesas)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            {/* Summary */}
            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Receitas</p>
                <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>
                  R$ {filteredMonthlyData.reduce((sum, item) => sum + item.receitas, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Despesas</p>
                <p className="text-lg font-bold" style={{ color: '#84cc16' }}>
                  R$ {filteredMonthlyData.reduce((sum, item) => sum + item.despesas, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>






      {/* Botão Flutuante - Add Transaction (expansão dinâmica) */}
      <AddTransactionSheet open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} initialData={initialTransactionData}>
        <Button
          data-tour="add-transaction-btn"
          onClick={() => handleOpenTransactionSheet(null)}
          className="group fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full group-hover:rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:w-[200px]"
          aria-label="Adicionar Transação"
        >
          <div className="flex items-center justify-center w-full h-full">
            {/* Ícone + central no estado compacto; desloca para a esquerda quando expande */}
            <Plus className="h-6 w-6 text-white transition-all duration-300 ease-out group-hover:mr-2 shrink-0" />
            {/* Texto que aparece no hover */}
            <span className="text-sm font-medium whitespace-nowrap opacity-0 max-w-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:max-w-[150px] overflow-hidden">
              Adicionar Transação
            </span>
          </div>
        </Button>
      </AddTransactionSheet>



    </div>



  );



};

export default Index;