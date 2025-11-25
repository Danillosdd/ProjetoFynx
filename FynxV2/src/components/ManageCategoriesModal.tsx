import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api, BASE_URL } from '@/lib/apiClient'
import { useQueryClient } from '@tanstack/react-query'
import { useList } from '@refinedev/core'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

export function ManageCategoriesModal() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [type, setType] = React.useState<'income'|'expense'>('income')
  const [loading, setLoading] = React.useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // confirmation dialogs state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = React.useState(false)
  const [pendingCategoryId, setPendingCategoryId] = React.useState<string | null>(null)
  const [pendingCounts, setPendingCounts] = React.useState<{ transactions: number; goals: number } | null>(null)

  const listResult = useList({ 
    resource: 'categories/custom', 
    queryOptions: { 
      enabled: open,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    } 
  });
  // Normalize different possible shapes: refine useList may return { data: { data: [...] } } or { data: [...] }
  const categories: any[] = Array.isArray(listResult.data?.data)
    ? listResult.data!.data
    : Array.isArray(listResult.data)
    ? listResult.data
    : [];
  const listError = listResult.error;

  const create = async () => {
    if (!name.trim()) {
      toast({ 
        title: 'Campo obrigatório', 
        description: 'Por favor, preencha o nome da categoria.', 
        variant: 'destructive' 
      })
      return
    }
    if (name.length > 50) {
      toast({ 
        title: 'Nome muito longo', 
        description: 'O nome da categoria deve ter no máximo 50 caracteres.', 
        variant: 'destructive' 
      })
      return
    }
    setLoading(true)
    try {
      await api.post('/categories/custom', { name: name.trim(), type })
      setName('')
      await queryClient.invalidateQueries({ queryKey: ['categories/custom'] })
      await listResult.refetch()
      toast({ title: 'Categoria criada', description: 'Categoria criada com sucesso.' })
    } catch (err: any) {
      console.error('Erro ao criar categoria:', err)
      toast({ title: 'Erro ao criar categoria', description: err?.message || 'Tente novamente.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Open delete confirmation dialog
  const onRequestDeleteCategory = (id: string) => {
    setPendingCategoryId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCategory = async () => {
    const id = pendingCategoryId
    setIsDeleteDialogOpen(false)
    if (!id) return
    try {
      const res = await fetch(`${BASE_URL}/categories/custom/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ['categories/custom'] })
        await listResult.refetch()
        toast({ title: 'Categoria removida', description: 'Categoria deletada com sucesso.' })
        setPendingCategoryId(null)
        return
      }
      let body: any = null
      try { body = await res.json() } catch (e) { body = await res.text() }
      if (res.status === 409) {
        const counts = body && body.counts ? body.counts : null
        const tx = counts?.transactions ?? 0
        const goals = counts?.goals ?? 0
        setPendingCounts({ transactions: tx, goals })
        // open archive confirm dialog
        setIsArchiveDialogOpen(true)
        return
      }
      console.error('Erro ao deletar categoria', res.status, body)
      toast({ title: 'Erro ao deletar categoria', description: 'Tente novamente mais tarde.', variant: 'destructive' })
    } catch (err: any) {
      console.error('Erro ao deletar categoria (fetch)', err)
      toast({ title: 'Erro ao deletar categoria', description: err?.message || 'Tente novamente.', variant: 'destructive' })
    } finally {
      setPendingCategoryId(null)
    }
  }

  // Open archive confirmation dialog
  const onRequestArchiveCategory = (id: string, counts?: { transactions: number; goals: number } | null) => {
    setPendingCategoryId(id)
    if (counts) setPendingCounts(counts)
    setIsArchiveDialogOpen(true)
  }

  const confirmArchiveCategory = async () => {
    const id = pendingCategoryId
    setIsArchiveDialogOpen(false)
    if (!id) return
    try {
      await api.post(`/categories/custom/${id}/archive`, {})
      await queryClient.invalidateQueries({ queryKey: ['categories/custom'] })
      await listResult.refetch()
      toast({ title: 'Categoria arquivada', description: 'A categoria foi arquivada com sucesso.' })
    } catch (err) {
      console.error('Erro ao arquivar:', err)
      toast({ title: 'Erro ao arquivar categoria', description: 'Tente novamente.', variant: 'destructive' })
    } finally {
      setPendingCategoryId(null)
      setPendingCounts(null)
    }
  }

  // Limpar campos ao fechar o modal
  React.useEffect(() => {
    if (!open) {
      setName('')
      setType('income')
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground h-8 text-xs">Gerenciar Categorias</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Gerenciar Categorias Personalizadas</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Café" className="bg-input border-border" />
          </div>
          <div>
            <Label>Tipo</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'income' | 'expense')} className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="font-normal cursor-pointer">Entrada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="font-normal cursor-pointer">Saída</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={create} disabled={loading} className="w-full">
            Salvar categoria personalizada
          </Button>

          <div className="mt-4">
            <h4 className="mb-2">Suas categorias</h4>
            {categories.length === 0 && !listError && (
              <div className="text-sm text-muted-foreground">Nenhuma categoria personalizada encontrada.</div>
            )}

            {listError && (
              <div className="text-sm text-destructive">Erro ao carregar categorias.</div>
            )}

            {categories.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.type === 'income' ? 'Entrada' : 'Saída'}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => onRequestArchiveCategory(String(c.id))}>Arquivar</Button>
                  <Button variant="destructive" onClick={() => onRequestDeleteCategory(String(c.id))}>Deletar</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Delete confirmation dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>Deseja realmente deletar esta categoria?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCategory}>Deletar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Archive confirmation dialog */}
        <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Arquivar categoria</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingCounts
                  ? `Esta categoria está em uso. Transações: ${pendingCounts.transactions}, Metas: ${pendingCounts.goals}. Deseja arquivar?`
                  : 'Deseja arquivar esta categoria? Ela não aparecerá mais na lista ativa.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmArchiveCategory}>Arquivar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </SheetContent>
    </Sheet>
  )
}

export default ManageCategoriesModal
