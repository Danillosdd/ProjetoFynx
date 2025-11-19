import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingUp, TrendingDown, Flame, Shield, PiggyBank, Target as TargetIcon, Award, Sparkles, Lock, Coins } from "lucide-react"
import Calendar from "react-github-contribution-calendar"
import { useRanking } from "@/hooks/useRanking"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { AddTransactionSheet } from "@/components/AddTransactionSheet"
import { Plus } from "lucide-react"

type League = "bronze" | "prata" | "ouro" | "diamante" | "platinum" | "silver" | "gold" | "diamond"

// Dados serão trazidos do backend via useRanking

const getLeagueColor = (league: League) => {
  const colors = {
    bronze: "bg-orange-600 text-white",
    prata: "bg-slate-400 text-slate-900",
    silver: "bg-slate-400 text-slate-900",
    ouro: "bg-yellow-500 text-yellow-900",
    gold: "bg-yellow-500 text-yellow-900",
    diamante: "bg-cyan-400 text-cyan-900",
    diamond: "bg-cyan-400 text-cyan-900",
    platinum: "bg-indigo-500 text-white",
  }
  return colors[league]
}

const getLeagueIcon = (league: League) => {
  return <Shield className="h-8 w-8" />
}

// Normaliza ligas do backend para chaves locais
const normalizeLeague = (league?: string): League => {
  switch ((league || '').toLowerCase()) {
    case 'silver':
      return 'prata'
    case 'gold':
      return 'ouro'
    case 'diamond':
      return 'diamante'
    case 'bronze':
      return 'bronze'
    case 'platinum':
      return 'platinum'
    case 'prata':
      return 'prata'
    case 'ouro':
      return 'ouro'
    case 'diamante':
      return 'diamante'
    default:
      return 'ouro'
  }
}

// Traduz rótulos de liga para PT-BR exibidos
const localizeLeagueLabel = (league?: string) => {
  const map: Record<string, string> = {
    bronze: 'bronze',
    silver: 'prata',
    gold: 'ouro',
    diamond: 'diamante',
    platinum: 'platina',
    prata: 'prata',
    ouro: 'ouro',
    diamante: 'diamante',
  }
  const key = (league || '').toLowerCase()
  return map[key] || (league || 'ouro')
}

// Função para converter dados de contribuição do backend para o formato do Calendar
const processContributionData = (contributionData?: any) => {
  if (!contributionData) {
    // Se não há dados do backend, retorna um objeto vazio
    return {}
  }

  // Se os dados já estão no formato correto (objeto com datas como chaves)
  if (typeof contributionData === 'object' && !Array.isArray(contributionData)) {
    return contributionData
  }

  // Se é um array, converte para o formato esperado
  if (Array.isArray(contributionData)) {
    return convertToCalendarData(contributionData)
  }

  return {}
}

// Função para converter dados do grid para o formato do Calendar
const convertToCalendarData = (contributionData: number[][]) => {
  const values: Record<string, number> = {}
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (52 * 7)) // 52 semanas atrás

  let currentDate = new Date(startDate)

  for (let week = 0; week < contributionData.length; week++) {
    for (let day = 0; day < contributionData[week].length; day++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      values[dateStr] = contributionData[week][day]
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  return values
}

const Ranking = () => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false)
  const { data, isLoading, error } = useRanking()
  const user = data?.userRanking
  const globalLeaderboard = data?.globalLeaderboard ?? []
  const contributionData = processContributionData(data?.contributionData)

  const normalizeCategory = (c?: string) => (c ?? '').toLowerCase()
  const getBadgeMeta = (category?: string) => {
    const key = normalizeCategory(category)
    switch (key) {
      case 'savings':
        return {
          icon: <PiggyBank className="h-4 w-4" />,
          className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
          label: 'Economia'
        }
      case 'goals':
        return {
          icon: <TargetIcon className="h-4 w-4" />,
          className: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
          label: 'Metas'
        }
      case 'streak':
        return {
          icon: <Flame className="h-4 w-4" />,
          className: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
          label: 'Sequência'
        }
      case 'spending':
        return {
          icon: <Coins className="h-4 w-4" />,
          className: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
          label: 'Gastos'
        }
      case 'special':
        return {
          icon: <Sparkles className="h-4 w-4" />,
          className: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
          label: 'Especial'
        }
      default:
        return {
          icon: <Award className="h-4 w-4" />,
          className: 'bg-muted text-muted-foreground border-border',
          label: 'Badge'
        }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Ranking</h1>
        <p className="text-muted-foreground">Carregando dados do ranking...</p>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="h-64 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Ranking</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Não foi possível carregar o ranking.</p>
          <p className="text-muted-foreground text-sm">Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ranking</h1>
          <p className="text-muted-foreground">Leaderboard dos usuários mais ativos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Ranking List */}
        <div className="lg:col-span-3">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Classificação Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {globalLeaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-primary w-8">
                      #{entry.position}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{entry.username}</div>
                      <Badge className={`mt-1 ${getLeagueColor(normalizeLeague(entry.league))}`}>
                        {localizeLeagueLabel(entry.league).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{entry.score.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {entry.change > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-success">+{entry.change}</span>
                        </>
                      ) : entry.change < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">{entry.change}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* User Stats Sidebar */}
        <div className="space-y-6">
          {/* User Position Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sua Posição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">#{user?.position ?? '--'}</div>
                <div className="text-xl font-semibold text-foreground">{(user?.score ?? 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">pontos</div>
              </div>
            </CardContent>
          </Card>

          {/* League Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Liga Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="flex justify-center mb-2">
                  {getLeagueIcon(normalizeLeague(user?.league) as League)}
                </div>
                {(() => {
                  const userLeague = normalizeLeague(user?.league || 'Bronze')
                  return (
                    <Badge className={`${getLeagueColor(userLeague)} text-lg px-3 py-1`}>
                      {localizeLeagueLabel(userLeague).toUpperCase()}
                    </Badge>
                  )
                })()}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-foreground">{user?.monthlyScore ?? 0} / {(data?.rankingStats?.topScore ?? 0)}</span>
                </div>
                <Progress
                  value={((user?.monthlyScore ?? 0) / (data?.rankingStats?.topScore ?? 1)) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {(data?.rankingStats?.topScore ?? 0) - (user?.monthlyScore ?? 0)} pontos para topo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                Check-in Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-orange-500 mb-1">{user?.streakDays ?? 0}</div>
                <div className="text-sm text-muted-foreground">dias consecutivos</div>
              </div>

              {/* GitHub-style contribution calendar */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Atividade dos últimos 12 meses</div>
                <Calendar
                  values={contributionData}
                  until={new Date().toISOString().split('T')[0]}
                  panelColors={[
                    "#00000033", // nível 0
                    "#9AE6B4", // nível 1 - success/20
                    "#68D391", // nível 2 - success/40  
                    "#48BB78", // nível 3 - success/60
                    "#22C55E", // nível 4 - success
                  ]}
                  weekNames={["D", "S", "T", "Q", "Q", "S", "S"]}
                  monthNames={[
                    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
                  ]}
                  panelAttributes={{ rx: 2, ry: 2 }}
                  monthLabelAttributes={{ style: { fontSize: 10, fill: "#6b7280" } }}
                  weekLabelAttributes={{ style: { fontSize: 9, fill: "#6b7280" } }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conquistas e Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conquistas */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(user?.achievements ?? []).length === 0 ? (
              <p className="text-muted-foreground">Nenhuma conquista ainda.</p>
            ) : (
              (user?.achievements ?? []).map((ach) => {
                const percent = Math.min(100, Math.round((ach.progress / ach.target) * 100))
                return (
                  <div key={ach.id} className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{ach.title}</div>
                        <div className="text-sm text-muted-foreground">{ach.description}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{percent}%</div>
                    </div>
                    <Progress value={percent} className="h-2 mt-2" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Badges conquistados */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle>Seus Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(user?.badges ?? []).length === 0 ? (
              <p className="text-muted-foreground">Sem badges por enquanto.</p>
            ) : (
              (user?.badges ?? []).map((b) => {
                const meta = getBadgeMeta(b.category)
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors border border-border">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center border ${meta.className}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.description}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      {meta.label}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Badges disponíveis */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle>Badges Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.availableBadges ?? []).length === 0 ? (
              <p className="text-muted-foreground">Nenhum badge disponível.</p>
            ) : (
              (data?.availableBadges ?? []).map((b) => {
                const meta = getBadgeMeta(b.category)
                return (
                  <div key={b.id} className="relative flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors border border-border">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center border ${meta.className} opacity-70 grayscale`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground/90">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.description}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      {meta.label}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
      {/* Sheet control para adicionar transação */}
      <AddTransactionSheet open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <span className="hidden" />
      </AddTransactionSheet>

      {/* Botão Flutuante - Add Transaction */}
      {!isAddTransactionOpen && (
        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}

export default Ranking