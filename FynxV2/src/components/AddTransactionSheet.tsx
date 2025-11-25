import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Upload, X, CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "@/lib/zod-pt-br"
import {
  useCreate,
  useInvalidate,
  useList,
} from "@refinedev/core"
import { useGoals } from '@/hooks/useGoals'
import ManageCategoriesModal from './ManageCategoriesModal'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

// Define the type for the initial data
export interface InitialTransactionData {
  type: "income" | "expense";
  goalId?: string;
  spendingLimitId?: string;
}

interface AddTransactionSheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: InitialTransactionData | null;
}

const transactionFormSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().optional(),
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().default(false),
  spendingGoalId: z.string().optional(),
  savingGoalId: z.string().optional(),
  // customCategoryName removed: custom categories must be created via manager
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

const categories = {
  income: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Negócios',
    'Presente',
    'Outros Ganhos',
  ],
  expense: [
    'Moradia',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Entretenimento',
    'Compras',
    'Contas',
    'Educação',
    'Viagem',
    'Outros',
  ],
};

export function AddTransactionSheet({
  children,
  open,
  onOpenChange,
  initialData,
}: AddTransactionSheetProps) {
  const { toast } = useToast();
  const invalidate = useInvalidate();
  const [linkToSpendingLimit, setLinkToSpendingLimit] = useState(false);
  const [linkToSavingGoal, setLinkToSavingGoal] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      isRecurring: false,
      date: new Date().toISOString().split('T')[0], // Data de hoje no formato YYYY-MM-DD
    },
  });

  const [typedDate, setTypedDate] = useState<string>(() => {
    const iso = new Date().toISOString().split('T')[0]
    const d = parse(iso, "yyyy-MM-dd", new Date())
    return format(d, "dd/MM/yyyy")
  })

  // Normaliza entradas como "4/4/25" -> "04/04/2025"
  const normalizeDateInput = (val: string): string | null => {
    if (!val) return null
    const cleaned = val.replace(/[^\d/]/g, "")
    const parts = cleaned.split("/")
    if (parts.length < 3) return null
    let [d, m, y] = parts
    if (!d || !m || !y) return null
    d = d.slice(0, 2).padStart(2, "0")
    m = m.slice(0, 2).padStart(2, "0")
    y = y.slice(0, 4)
    if (y.length <= 2) {
      const yy = parseInt(y, 10)
      if (Number.isNaN(yy)) return null
      y = String(2000 + yy)
    } else if (y.length === 3) {
      // Pouco comum: manter como está e deixar parse validar
    }
    return `${d}/${m}/${y}`
  }

  // Máscara em tempo real: insere barras após dia e mês, e converte ano "yy" para "20yy"
  const maskDateOnInput = (val: string): string => {
    const digits = val.replace(/[^\d]/g, "")
    const d = digits.slice(0, 2)
    const m = digits.slice(2, 4)
    const yRaw = digits.slice(4, 8)
    let y = yRaw
    if (yRaw.length === 2) {
      y = `20${yRaw}`
    }
    let masked = ""
    if (d.length) {
      masked = d
      if (d.length === 2) masked += "/"
    }
    if (m.length) {
      masked += m
      if (m.length === 2) masked += "/"
    }
    if (y.length) {
      masked += y
    }
    return masked
  }

  const [typedAmount, setTypedAmount] = useState<string>("")

  const transactionType = form.watch("type");

  const { mutate: createTransaction, isLoading } = useCreate({
    resource: "transactions",
  });
  const { data: spendingGoals } = useList({
    resource: "goals/spending-goals",
    queryOptions: {
      enabled: transactionType === "expense" && linkToSpendingLimit,
    },
  });

  // Fetch goals overview (includes goalType) to filter by type when linking transactions
  const { data: goalsOverview } = useGoals();
  const allGoals = goalsOverview?.spendingGoals ?? [];
  const availableGoalsForTransaction = transactionType === 'income'
    ? allGoals.filter((g: any) => g.goalType === 'saving')
    : allGoals.filter((g: any) => g.goalType === 'spending')

  const { data: customCategories } = useList({
    resource: 'categories/custom',
    queryOptions: { enabled: true },
  });

  useEffect(() => {
    if (open && initialData) {
      form.setValue("type", initialData.type);
      if (initialData.type === "expense" && initialData.spendingLimitId) {
        setLinkToSpendingLimit(true);
        form.setValue("spendingGoalId", initialData.spendingLimitId);
      }
      if (initialData.type === "income" && initialData.goalId) {
        setLinkToSavingGoal(true);
        form.setValue("savingGoalId", initialData.goalId);
      }
    } else if (!open) {
      // Reset form and state when sheet closes
      form.reset({
        isRecurring: false,
        date: new Date().toISOString().split('T')[0],
      });
      setTypedAmount("");
      setLinkToSpendingLimit(false);
      setLinkToSavingGoal(false);
      const d = parse(new Date().toISOString().split('T')[0], "yyyy-MM-dd", new Date())
      setTypedDate(format(d, "dd/MM/yyyy"))
    }
  }, [open, initialData, form]);

  const onSubmit = (values: TransactionFormValues) => {
    (async () => {
      try {
        // Validação manual dos campos obrigatórios
        if (!values.description || values.description.trim() === '') {
          toast({
            title: "Campo obrigatório",
            description: "A descrição é obrigatória",
            variant: "destructive"
          });
          return;
        }

        if (!values.amount || values.amount <= 0) {
          toast({
            title: "Campo obrigatório",
            description: "O valor deve ser maior que zero",
            variant: "destructive"
          });
          return;
        }

        if (!values.type) {
          toast({
            title: "Campo obrigatório",
            description: "O tipo da transação é obrigatório",
            variant: "destructive"
          });
          return;
        }

        if (!values.category || values.category.trim() === '') {
          toast({
            title: "Campo obrigatório",
            description: "A categoria é obrigatória",
            variant: "destructive"
          });
          return;
        }

        if (!values.date || values.date.trim() === '') {
          toast({
            title: "Campo obrigatório",
            description: "A data é obrigatória",
            variant: "destructive"
          });
          return;
        }

        let finalCategory = values.category;

        // Do NOT auto-create categories when adding a transaction.
        // Custom categories should be created via the "Gerenciar categorias" modal.
        if (values.category === 'Outros') {
          toast({ title: 'Categoria personalizada', description: 'Crie a categoria em "Gerenciar categorias" antes de usá-la.', });
          return;
        }

        // If user selected an existing custom category (value like 'custom:ID'), resolve its name
        if (String(values.category).startsWith('custom:')) {
          const id = String(values.category).split(':')[1];
          const found = customCategories?.data?.find((c: any) => String(c.id) === id);
          if (found) finalCategory = found.name;
        }

        // Build payload with resolved category
        const payload = { ...values, category: finalCategory };

        createTransaction(
          {
            values: payload,
          },
          {
            onSuccess: () => {
          toast({
            title: "Transação adicionada",
            description: "Sua transação foi adicionada com sucesso.",
          });
          form.reset();
          setTypedAmount("");
          onOpenChange?.(false);
          
          // Invalidar cache do dashboard e transações
          invalidate({
            invalidates: ["list"],
            resource: "dashboard",
          });
          invalidate({
            invalidates: ["list"],
            resource: "transactions",
          });
          invalidate({
            invalidates: ["list"],
            resource: "overview",
          });

          // Garantir refetch das queries do React Query usadas no dashboard
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // Also refetch goals so linked goals reflect updated progress immediately
      queryClient.invalidateQueries({ queryKey: ["goals"] });
            },
            onError: (error) => {
          toast({
            title: "Erro ao adicionar transação",
            description: "Ocorreu um erro ao tentar adicionar a transação.",
            variant: "destructive",
          });
          console.error("Erro ao criar transação:", error);
        },
          }
        );
      } catch (err) {
        console.error('Erro no fluxo de criação de transação:', err);
      }
    })();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Transação
          </SheetTitle>
          <SheetDescription>
            Registre suas receitas e despesas para acompanhar suas finanças em tempo real.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Salário, Supermercado" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      value={typedAmount}
                      onChange={(e) => {
                        const val = e.target.value
                        // Permite apenas dígitos e vírgula; remove pontos para recalcular formatação
                        const sanitized = val.replace(/[^\d,]/g, "").replace(/,{2,}/g, ",")
                        const [intPartRaw = "", decPartRaw = ""] = sanitized.split(",")
                        const intDigits = intPartRaw.replace(/\D/g, "")
                        const decDigits = decPartRaw.replace(/\D/g, "").slice(0, 2)
                        const intWithDots = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        const hasComma = sanitized.includes(",")
                        const formatted = hasComma
                          ? (decDigits ? `${intWithDots},${decDigits}` : `${intWithDots},`)
                          : intWithDots
                        setTypedAmount(formatted)
                        // Atualiza valor numérico do formulário quando possível
                        const numericStr = decDigits ? `${intDigits}.${decDigits}` : intDigits
                        if (numericStr) {
                          const n = parseFloat(numericStr)
                          if (!Number.isNaN(n)) {
                            field.onChange(n)
                          }
                        }
                      }}
                      onBlur={() => {
                        if (!typedAmount) return
                        const [intPartRaw = "", decPartRaw = ""] = typedAmount.split(",")
                        const intDigits = intPartRaw.replace(/\./g, "")
                        // Se não há parte decimal ou está vazia, preenche com "00"
                        const decDigits = decPartRaw ? decPartRaw.padEnd(2, "0").slice(0, 2) : "00"
                        const intWithDots = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        const finalFormatted = `${intWithDots},${decDigits}`
                        setTypedAmount(finalFormatted)
                        const n = parseFloat(`${intDigits}.${decDigits}`)
                        if (!Number.isNaN(n)) {
                          field.onChange(n)
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Entrada</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">Saída</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                          {transactionType &&
                            categories[transactionType].map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}

                          {/* Custom categories (user-defined) */}
                          {customCategories?.data && customCategories.data.length > 0 && (
                            <>
                              <div className="px-3 py-2 text-xs text-muted-foreground">Suas categorias</div>
                              {customCategories.data
                                .filter((c: any) => c.type === transactionType && c.isActive)
                                .map((c: any) => (
                                  <SelectItem key={`custom:${c.id}`} value={`custom:${c.id}`}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                            </>
                          )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

                  <div className="flex justify-end">
                    <ManageCategoriesModal />
                  </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => {
                const selectedDate = field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined
                return (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <div className="relative w-full">
                      <FormControl>
                        <Input
                          placeholder="dd/mm/yyyy"
                          inputMode="numeric"
                          value={typedDate}
                          onChange={(e) => {
                            const masked = maskDateOnInput(e.target.value)
                            setTypedDate(masked)
                            // Atualiza o valor do formulário apenas quando houver data completa válida
                            const parsed = parse(masked, "dd/MM/yyyy", new Date())
                            if (
                              masked.length >= 10 &&
                              isValid(parsed) &&
                              parsed <= new Date()
                            ) {
                              field.onChange(format(parsed, "yyyy-MM-dd"))
                            }
                          }}
                          onBlur={() => {
                            const normalized = normalizeDateInput(typedDate)
                            if (!normalized) return
                            setTypedDate(normalized)
                            const parsed = parse(normalized, "dd/MM/yyyy", new Date())
                            if (isValid(parsed) && parsed <= new Date()) {
                              field.onChange(format(parsed, "yyyy-MM-dd"))
                            }
                          }}
                        />
                      </FormControl>
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
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (!date) return
                              setTypedDate(format(date, "dd/MM/yyyy", { locale: ptBR }))
                              field.onChange(format(date, "yyyy-MM-dd"))
                            }}
                            disabled={{ after: new Date() }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Transação Recorrente</FormLabel>
                    <FormDescription>
                      Esta transação se repetirá mensalmente.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {transactionType === "expense" && (
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Vincular a limite de gasto</FormLabel>
                </div>
                <Switch
                  checked={linkToSpendingLimit}
                  onCheckedChange={setLinkToSpendingLimit}
                />
              </div>
            )}

            {transactionType === "income" && (
              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Vincular a meta de poupança</FormLabel>
                </div>
                <Switch
                  checked={linkToSavingGoal}
                  onCheckedChange={setLinkToSavingGoal}
                />
              </div>
            )}

            {transactionType === "expense" && linkToSpendingLimit && (
              <FormField
                control={form.control}
                name="spendingGoalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta de Gasto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma meta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableGoalsForTransaction.map((goal: any) => (
                          <SelectItem key={goal.id} value={String(goal.id)}>
                            {goal.title || goal.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            {transactionType === "income" && linkToSavingGoal && (
              <FormField
                control={form.control}
                name="savingGoalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta de Poupança</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma meta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableGoalsForTransaction.map((goal: any) => (
                          <SelectItem key={goal.id} value={String(goal.id)}>
                            {goal.title || goal.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}


            {/* If user selected 'Outros', prompt to use category manager (do not auto-create) */}
            {form.watch('category') === 'Outros' && (
              <div className="p-3 rounded bg-muted/50 text-sm">
                Para usar uma categoria personalizada, primeiro crie-a em "Gerenciar categorias" e então selecione-a aqui.
                <div className="mt-2">
                  <ManageCategoriesModal />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Transação"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}