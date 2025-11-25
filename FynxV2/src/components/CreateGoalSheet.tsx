import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Target, Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"

interface CreateGoalSheetProps {
  children: React.ReactNode
  initialGoalType?: 'saving' | 'spending'
  onCreateGoal: (goalData: {
    goalType: 'saving' | 'spending'
    name: string
    category?: string
    target_value: number
    period?: 'monthly' | 'weekly' | 'yearly'
    start_date?: string
    end_date?: string
    description?: string
    target_date?: string
  }) => void
}

export function CreateGoalSheet({ children, initialGoalType, onCreateGoal }: CreateGoalSheetProps) {
  const [name, setName] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [typedTargetDate, setTypedTargetDate] = useState<string>(() => {
    return targetDate ? targetDate.split("T")[0].split("-").reverse().join("/") : ''
  })
  const [selectedTargetDate, setSelectedTargetDate] = useState<Date | undefined>(() => {
    if (!targetDate) return undefined
    const d = new Date(targetDate)
    return isNaN(d.getTime()) ? undefined : d
  })
  const [goalType, setGoalType] = useState<'saving'|'spending'>(initialGoalType || 'saving')
  const [category, setCategory] = useState('Outros')
  const [period, setPeriod] = useState<'monthly'|'weekly'|'yearly'>('monthly')
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except dots and commas
    const numericValue = value.replace(/[^\d,]/g, '')
    
    // Convert to number for validation
    const numberValue = parseFloat(numericValue.replace(',', '.'))
    
    if (!isNaN(numberValue)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numberValue)
    }
    
    return value
  }

  const handleTargetValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove currency formatting for input
    const numericValue = value.replace(/[^\d,]/g, '')
    setTargetValue(numericValue)
  }

  const handleSave = () => {
    if (!name.trim() || !targetValue.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome da meta e valor alvo são obrigatórios",
        variant: "destructive"
      })
      return
    }

    // Convert target value to number
    const targetValueNumber = parseFloat(targetValue.replace(',', '.'))
    
    if (targetValueNumber <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor da meta deve ser maior que zero",
        variant: "destructive"
      })
      return
    }

    // Additional validation: saving goals require end date (Data Final / Prazo)
    if (goalType === 'saving') {
      if (!targetDate) {
        toast({ title: 'Data final obrigatória', description: 'Para metas de poupança informe a Data Final / Prazo.', variant: 'destructive' })
        return
      }
    }

    // For spending goals, require a reset period
    if (goalType === 'spending') {
      if (!period) {
        toast({ title: 'Período obrigatório', description: 'Para metas de gasto selecione o Período de Reset.', variant: 'destructive' })
        return
      }
    }

    // Create the goal - unify payload and include goalType
    const payload: any = {
      goalType,
      name: name.trim(),
      target_value: targetValueNumber,
      description: description.trim() || undefined,
      // default category to avoid DB NOT NULL constraints when UI removes category
      category: category || 'Outros'
    }

    if (goalType === 'saving') {
      // For saving goals we keep only the final date (end_date). Period is not relevant in the UI,
      // but the backend expects a period value — provide a sensible default.
      payload.period = 'monthly'
      if (targetDate) {
        payload.end_date = targetDate
        // older consumers expect target_date field name in some places — provide both
        payload.target_date = targetDate
      }
    } else {
      // spending goal: no final date, use reset period
      payload.period = period
    }

    onCreateGoal(payload)
    
    toast({
      title: "Meta criada!",
      description: `Meta "${name}" criada com sucesso`,
    })

    // Reset form
    setName("")
    setTargetValue("")
    setDescription("")
    setTargetDate("")
    setIsOpen(false)
  }

  const resetForm = () => {
    setName("")
    setTargetValue("")
    setDescription("")
    setTargetDate("")
    setGoalType(initialGoalType || 'saving')
    setCategory('Outros')
    setPeriod('monthly')
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Criar Nova Meta
          </SheetTitle>
          <SheetDescription>
            Defina seus objetivos financeiros e acompanhe seu progresso ao longo do tempo.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-6 py-4">
          {/* Goal Type selector */}
          <div className="grid gap-2">
            <Label>Tipo de Meta</Label>
            <div className="flex gap-4">
              <button type="button" className={`flex-1 py-2 px-3 rounded ${goalType === 'spending' ? 'bg-red-500 text-white' : 'bg-muted'}`} onClick={() => setGoalType('spending')}>💸 Limite de Gasto</button>
              <button type="button" className={`flex-1 py-2 px-3 rounded ${goalType === 'saving' ? 'bg-green-500 text-white' : 'bg-muted'}`} onClick={() => setGoalType('saving')}>💰 Meta de Poupança</button>
            </div>
          </div>

          {/* Goal Name */}
          <div className="grid gap-2">
            <Label htmlFor="goal-name">Nome da Meta *</Label>
            <Input
              id="goal-name"
              placeholder="Ex: Viagem para Europa, Carro novo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          {/* Target Value */}
          <div className="grid gap-2">
            <Label htmlFor="target-value">{goalType === 'saving' ? 'Valor Alvo *' : 'Limite de Gasto *'}</Label>
            <div className="relative">
              <Input
                id="target-value"
                placeholder="R$ 0"
                value={targetValue ? formatCurrency(targetValue) : ""}
                onChange={handleTargetValueChange}
                className="bg-input border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Digite apenas números. Ex: 15000 para R$ 15.000
            </p>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea 
              id="description"
              placeholder="Descreva sua meta e porque ela é importante para você..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] bg-input border-border resize-none"
            />
          </div>

          {/* Target Date (only for saving) or Reset Period (only for spending) */}
          {goalType === 'saving' ? (
            <div className="grid gap-2">
              <Label htmlFor="target-date">
                Data Final / Prazo
              </Label>
              <div className="relative">
                <Input
                  id="target-date"
                  placeholder="dd/mm/aaaa"
                  value={typedTargetDate}
                  onChange={(e) => setTypedTargetDate(e.target.value)}
                  className="bg-input border-border"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Abrir calendário"
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end" sideOffset={8} avoidCollisions={false}>
                    <Calendar
                      locale={ptBR}
                      initialFocus
                      mode="single"
                      selected={selectedTargetDate}
                      onSelect={(date) => {
                        if (!date) return
                        setSelectedTargetDate(date)
                        const iso = date.toISOString().split('T')[0]
                        setTargetDate(iso)
                        setTypedTargetDate(new Date(date).toLocaleDateString('pt-BR'))
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Período de Reset</Label>
              <Select onValueChange={(v) => setPeriod(v as any)} defaultValue={period}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview */}
          {name && targetValue && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="font-medium text-foreground mb-2">Preview da Meta</h4>
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {goalType === 'saving' ? '💰' : '💸'} {name}
                    </CardTitle>
                    <Badge variant={goalType === 'saving' ? 'default' : 'destructive'}>{category || 'Categoria'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">
                    R$ 0,00 / R$ {Number(targetValue || 0).toLocaleString('pt-BR')}
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {goalType === 'saving' ? (targetDate ? new Date(targetDate).toLocaleDateString('pt-BR') : 'Prazo não definido') : (period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensal' : 'Anual')}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button onClick={handleSave} className="w-full">
            Salvar Meta
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}