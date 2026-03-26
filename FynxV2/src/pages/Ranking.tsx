import * as React from "react"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Flame, TrendingUp, Trophy, Sparkles, Award, Star,
  Rocket, PiggyBank, Diamond, CheckCircle, Target, Zap, Users,
  ChevronUp, ChevronDown, Minus, SlidersHorizontal, Lock
} from "lucide-react"
import { useRanking, type LeaderboardEntry, type Achievement } from "@/hooks/useRanking"

// ─── constants ───────────────────────────────────────────────────────────────
const LEAGUE_META: Record<string, { label: string; color: string; border: string; bg: string }> = {
  bronze:   { label: 'Bronze',   color: 'text-amber-400',  border: 'border-amber-400/30',  bg: 'bg-amber-400/10'  },
  silver:   { label: 'Prata',    color: 'text-slate-300',  border: 'border-slate-300/30',  bg: 'bg-slate-300/10'  },
  gold:     { label: 'Ouro',     color: 'text-yellow-400', border: 'border-yellow-400/30', bg: 'bg-yellow-400/10' },
  platinum: { label: 'Platina',  color: 'text-cyan-400',   border: 'border-cyan-400/30',   bg: 'bg-cyan-400/10'   },
  diamond:  { label: 'Diamante', color: 'text-[#C4FF0E]',  border: 'border-[#C4FF0E]/30',  bg: 'bg-[#C4FF0E]/10'  },
}

const LEAGUE_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
const LEAGUE_THRESHOLDS: Record<string, number> = {
  bronze: 1000, silver: 5000, gold: 15000, platinum: 40000, diamond: Infinity,
}

function getLeagueMeta(league: string) {
  return LEAGUE_META[league?.toLowerCase()] ?? LEAGUE_META['bronze']
}

// ─── sub-components ──────────────────────────────────────────────────────────
function TrendBadge({ trend, change }: { trend: string; change: number }) {
  if (trend === 'up')   return <span className="flex items-center gap-0.5 text-emerald-400 text-[11px] font-bold tabular-nums">+{change}<ChevronUp className="h-3 w-3" /></span>
  if (trend === 'down') return <span className="flex items-center gap-0.5 text-red-400   text-[11px] font-bold tabular-nums">{change}<ChevronDown className="h-3 w-3" /></span>
  return <Minus className="h-3 w-3 text-[#52525b]" />
}

function LeaderboardRow({ entry, isYou }: { entry: LeaderboardEntry; isYou?: boolean }) {
  const meta = getLeagueMeta(entry.league)
  return (
    <div
      className={`grid items-center px-5 py-3.5 border-b border-white/[0.04] last:border-0 transition-colors select-none
        ${isYou ? 'bg-purple-900/25' : 'hover:bg-white/[0.03]'}`}
      style={{ gridTemplateColumns: '44px 1fr 90px 52px 80px' }}
    >
      <div className={`text-[18px] font-extrabold leading-none tabular-nums
          ${isYou ? 'text-[#e9d5ff]' : entry.position <= 3 ? 'text-[#C4FF0E]' : 'text-[#52525b]'}`}
        style={{ fontFamily: '"Space Grotesk",sans-serif' }}>
        {String(entry.position).padStart(2, '0')}
      </div>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`h-8 w-8 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold text-white
            ${isYou ? 'bg-purple-500/30 border-purple-400/50' : 'bg-white/[0.06] border-white/10'}`}>
          {(entry.username ?? '??').substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-[13px] font-bold truncate leading-tight ${isYou ? 'text-[#e9d5ff]' : 'text-white'}`}>
            {isYou ? 'Você' : entry.username}
          </span>
          <span className="text-[9px] text-[#52525b] font-bold uppercase tracking-widest">Nível {entry.level}</span>
        </div>
      </div>
      <div className="flex justify-center">
        <div className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] border ${meta.border} ${meta.color} ${meta.bg}`}>
          {meta.label}
        </div>
      </div>
      <div className="flex justify-center">
        <TrendBadge trend={entry.trend} change={Math.abs(entry.change)} />
      </div>
      <div className={`text-right text-[14px] font-extrabold tabular-nums ${isYou ? 'text-[#e9d5ff]' : 'text-white'}`}
        style={{ fontFamily: '"Space Grotesk",sans-serif' }}>
        {entry.score.toLocaleString('pt-BR')}
      </div>
    </div>
  )
}

// Achievement as a compact stack row — inspired by GoalCard pattern
function AchievementRow({ a, index }: { a: Achievement; index: number }) {
  const pct = Math.min(100, (a.progress / Math.max(1, a.target)) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className={`group relative overflow-hidden flex flex-col gap-2.5 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5
        ${a.completed
          ? 'border-[#C4FF0E]/20 bg-[#C4FF0E]/[0.03] shadow-[0_0_20px_rgba(196,255,14,0.05)]'
          : 'border-white/[0.05] bg-white/[0.02]'
        }`}
    >
      {/* Top row: icon + title + lock/check */}
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 shrink-0 rounded-xl border flex items-center justify-center text-base
            ${a.completed ? 'bg-[#C4FF0E]/10 border-[#C4FF0E]/20' : 'bg-white/[0.04] border-white/[0.04]'}`}>
          {a.icon}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className={`text-[12px] font-extrabold uppercase tracking-[0.08em] leading-tight truncate
              ${a.completed ? 'text-white' : 'text-[#a1a1aa]'}`}>
            {a.title}
          </span>
          <span className="text-[10px] text-[#52525b] leading-snug">{a.description}</span>
        </div>
        <div className="shrink-0">
          {a.completed
            ? <CheckCircle className="h-4 w-4 text-[#C4FF0E]" />
            : <Lock className="h-3.5 w-3.5 text-[#52525b]" />}
        </div>
      </div>

      {/* Progress bar row */}
      <div className="flex items-center gap-2.5">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-black/40 ring-1 ring-inset ring-white/[0.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.06 }}
            className={`absolute inset-y-0 left-0 rounded-full ${a.completed
              ? 'bg-gradient-to-r from-[#a3e635] to-[#C4FF0E] shadow-[0_0_8px_rgba(196,255,14,0.4)]'
              : 'bg-gradient-to-r from-purple-600 to-purple-400'
            }`}
          >
            <div className="absolute right-0 top-0 h-full w-1.5 bg-white/40 blur-[1px]" />
          </motion.div>
        </div>
        <span className={`text-[9px] font-bold tabular-nums shrink-0 w-8 text-right
            ${a.completed ? 'text-[#C4FF0E]' : 'text-[#52525b]'}`}>
          {pct.toFixed(0)}%
        </span>
      </div>

      {/* Reward chip */}
      {a.reward?.points && (
        <div className="flex items-center gap-1">
          <Zap className="h-2.5 w-2.5 text-[#C4FF0E]" />
          <span className="text-[8px] font-bold text-[#C4FF0E] uppercase tracking-widest">+{a.reward.points} XP</span>
        </div>
      )}
    </motion.div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function Ranking() {
  const { data, isLoading } = useRanking()
  const [tab, setTab]           = useState<'global' | 'friends' | 'savings' | 'metas'>('global')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')

  const user  = data?.userRanking
  const stats = data?.rankingStats
  const allAchievements = data?.achievements ?? []

  const rawList: LeaderboardEntry[] = useMemo(() => {
    switch (tab) {
      case 'friends': return data?.friendsLeaderboard ?? []
      case 'savings': return data?.categoryLeaderboards?.savings ?? []
      case 'metas':   return data?.categoryLeaderboards?.goals ?? []
      default:        return data?.globalLeaderboard ?? []
    }
  }, [tab, data])

  const fullList: LeaderboardEntry[] = useMemo(() => {
    const alreadyIn = rawList.some(e => e.userId === user?.userId)
    const base = alreadyIn ? rawList : user ? [
      ...rawList,
      { position: user.position, userId: user.userId, username: user.username,
        avatar: user.avatar, score: user.score, level: user.level,
        league: (user.league?.toLowerCase() ?? 'bronze') as LeaderboardEntry['league'],
        change: 0, trend: 'same' as const },
    ].sort((a, b) => a.position - b.position) : rawList
    if (leagueFilter === 'all') return base
    return base.filter(e => e.league?.toLowerCase() === leagueFilter)
  }, [rawList, user, leagueFilter])

  const currentLeague = user?.league?.toLowerCase() ?? 'bronze'
  const meta = getLeagueMeta(currentLeague)
  const nextThreshold = LEAGUE_THRESHOLDS[currentLeague] ?? 1000
  const progressPct = user ? Math.min(100, (user.monthlyScore / nextThreshold) * 100) : 0
  const currentLeagueIndex = LEAGUE_ORDER.indexOf(currentLeague)

  // Fallback static achievements when API returns empty
  const staticAchievements: Achievement[] = [
    { id:'1', title:'Early Adopter', description:'Membro fundador do Fynx', icon:'🚀', progress:1, target:1, completed:true, category:'special', reward:{ points:500 } },
    { id:'2', title:'Cofrinho Cheio', description:'Economizou R$ 10.000', icon:'🐷', progress:10000, target:10000, completed:true, category:'savings', reward:{ points:1000 } },
    { id:'3', title:'High Roller', description:'Realizou transação de R$ 100.000', icon:'💎', progress:42000, target:100000, completed:false, category:'transactions', reward:{ points:5000 } },
    { id:'4', title:'G.O.A.T Status', description:'Top 1% no ranking anual', icon:'✨', progress: stats?.userPercentile ? Math.round((100 - stats.userPercentile)) : 13, target:99, completed:false, category:'ranking', reward:{ points:10000 } },
    { id:'5', title:'Sequência Lendária', description:'30 dias consecutivos de login', icon:'🔥', progress:user?.streakDays ?? 0, target:30, completed:(user?.streakDays ?? 0) >= 30, category:'engagement', reward:{ points:2000 } },
    { id:'6', title:'Caçador de Metas', description:'Conclua 5 metas financeiras', icon:'🎯', progress:user?.goalsCompleted ?? 0, target:5, completed:(user?.goalsCompleted ?? 0) >= 5, category:'goals', reward:{ points:3000 } },
  ]
  const achievements = allAchievements.length > 0 ? allAchievements : staticAchievements

  if (isLoading) return (
    <div className="space-y-5 p-4 animate-pulse">
      <div className="h-72 apple-glass rounded-[2rem]" />
      <div className="h-96 apple-glass rounded-2xl" />
    </div>
  )

  return (
    <div className="min-h-screen bg-transparent text-[#e4e4e7] p-2 lg:p-4 pb-24" style={{ fontFamily: '"Manrope",sans-serif' }}>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════════ */}
      <div className="relative apple-glass border-none rounded-[2rem] p-6 lg:p-10 mb-6 overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-900/8 to-transparent pointer-events-none" />
        <div className="absolute -top-28 -left-24 w-80 h-80 bg-purple-500/25 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-8 -mt-4 font-black leading-none select-none pointer-events-none z-0 text-white"
          style={{ fontSize: 'clamp(110px,17vw,220px)', fontFamily: '"Space Grotesk",sans-serif', opacity: 0.05 }}>
          RANK
        </div>

        {/* LEFT — Identity */}
        <div className="relative z-10 flex-1 flex flex-col justify-between gap-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-bold tracking-[0.25em] text-[#f3e8ff] uppercase">Sessão Ativa</span>
            </div>
            <h1 className="text-[52px] lg:text-[66px] font-extrabold tracking-tight uppercase leading-none mb-3 text-white drop-shadow-xl text-wrap-balance"
              style={{ fontFamily: '"Space Grotesk",sans-serif' }}>
              {user?.username?.toUpperCase() ?? 'SOBERANO'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#C084FC]">
                #{user?.position ?? '—'}
              </span>
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest ${meta.border} ${meta.color} bg-white/[0.04]`}>
                <Trophy className="h-3 w-3" />{meta.label}
              </span>
              {stats && stats.userPercentile > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#C4FF0E]/30 text-[#C4FF0E] bg-[#C4FF0E]/[0.05] text-[9px] font-bold uppercase tracking-widest">
                  <Star className="h-3 w-3" />Top {(100 - stats.userPercentile).toFixed(0)}%
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 text-[#a1a1aa] bg-white/[0.04] text-[9px] font-bold uppercase tracking-widest">
                <Target className="h-3 w-3" />{user?.goalsCompleted ?? 0} Metas
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="bg-black/20 p-4 rounded-2xl border border-white/[0.04]">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#71717a]">Progresso de Liga</span>
              <span className="text-[10px] font-bold text-[#C4FF0E] tabular-nums">
                {(user?.monthlyScore ?? 0).toLocaleString('pt-BR')} / {nextThreshold === Infinity ? '∞' : nextThreshold.toLocaleString('pt-BR')} XP
              </span>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden mb-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-lime-400 to-[#C4FF0E]" />
            </div>
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
              <span className="text-[#a1a1aa]">{meta.label}</span>
              <span className="text-[#d8b4fe]">Próxima Liga</span>
            </div>
          </div>
        </div>

        {/* RIGHT — 2×2 Bento */}
        <div className="relative z-10 grid grid-cols-2 gap-3 w-full lg:w-[440px] shrink-0">
          {[
            { label: 'Pontuação Total', value: (user?.score ?? 0).toLocaleString('pt-BR'), sub: stats ? `Média: ${stats.averageScore.toLocaleString('pt-BR')}` : '', accent: false },
            { label: 'Rank Global', value: `${user?.position ?? '—'}º`, sub: stats ? `De ${stats.totalUsers.toLocaleString('pt-BR')} usuários` : '', accent: true, icon: <TrendingUp className="h-5 w-5 shrink-0" /> },
            { label: 'Taxa de Poupança', value: user?.savingsRate != null ? `${user.savingsRate.toFixed(1)}%` : '—', sub: `R$ ${(user?.totalSavings ?? 0).toLocaleString('pt-BR')} poupados`, accent: false },
            { label: 'Sequência', value: `${user?.streakDays ?? 0}`, suffix: 'dias', sub: 'sem quebrar', accent: false, icon: <Flame className="h-4 w-4 text-red-400 shrink-0" /> },
          ].map(({ label, value, suffix, sub, accent, icon }) => (
            <div key={label} className={`bg-black/30 backdrop-blur-xl rounded-xl p-5 flex flex-col gap-1.5 border transition-all hover:bg-black/40
              ${accent ? 'border-[#C4FF0E]/40 shadow-[0_0_20px_rgba(196,255,14,0.06)]' : 'border-white/[0.07]'}`}>
              <span className="text-[9px] font-bold text-[#71717a] tracking-[0.2em] uppercase">{label}</span>
              <div className={`flex items-baseline gap-1.5 text-[30px] font-extrabold leading-none tabular-nums ${accent ? 'text-[#C4FF0E]' : 'text-white'}`}
                style={{ fontFamily: '"Space Grotesk",sans-serif', fontVariantNumeric: 'tabular-nums' }}>
                {icon}{value}
                {suffix && <span className="text-[15px] text-[#71717a] font-medium tracking-normal">{suffix}</span>}
              </div>
              {sub && <span className="text-[9px] text-[#52525b]">{sub}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ══ BODY ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch">

        {/* ── LEFT ──────────────────────────────────────── */}
        <div className="flex flex-col gap-6 flex-1">

          {/* CLASSIFICAÇÃO GLOBAL */}
          <div className="apple-glass border-none rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* header */}
            <div className="flex flex-col gap-3 px-5 pt-5 pb-4 border-b border-white/[0.04]">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-extrabold text-white tracking-widest uppercase" style={{ fontFamily: '"Space Grotesk",sans-serif' }}>
                  Classificação Global
                </h2>
                <div className="flex bg-black/40 rounded-lg border border-white/[0.08] p-[3px] text-[8px] font-bold uppercase tracking-widest">
                  {(['global', 'friends', 'savings', 'metas'] as const).map(t => {
                    const labels = { global:'Global', friends:'Amigos', savings:'Poupança', metas:'Metas' }
                    return (
                      <button key={t} onClick={() => setTab(t)}
                        className={`px-2.5 py-1.5 rounded-md transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${tab === t ? 'bg-white/10 text-white' : 'text-[#71717a] hover:text-white'}`}>
                        {labels[t]}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* League filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <SlidersHorizontal className="h-3 w-3 text-[#52525b] shrink-0" />
                <span className="text-[9px] font-bold text-[#52525b] uppercase tracking-widest mr-1">Liga:</span>
                {['all', ...LEAGUE_ORDER].map(lg => {
                  const lm = lg === 'all'
                    ? { label: 'Todas', color: 'text-[#a1a1aa]', border: 'border-white/10', bg: 'bg-white/5' }
                    : LEAGUE_META[lg]
                  return (
                    <button key={lg} onClick={() => setLeagueFilter(lg)}
                      className={`px-2.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-widest transition-all
                        ${leagueFilter === lg ? `${lm.border} ${lm.color} ${lm.bg}` : 'border-transparent text-[#52525b] hover:text-white'}`}>
                      {lm.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* col headers */}
            <div className="px-5 py-2.5 text-[9px] font-bold text-[#52525b] uppercase tracking-[0.2em]"
              style={{ display: 'grid', gridTemplateColumns: '44px 1fr 90px 52px 80px' }}>
              <span>Pos</span><span>Usuário</span>
              <span className="text-center">Liga</span>
              <span className="text-center">Var.</span>
              <span className="text-right">Pontos</span>
            </div>

            {/* scrollable — ~5 rows */}
            <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
              {fullList.length === 0
                ? <div className="py-10 text-center text-[#71717a] text-sm">Nenhum dado para este filtro.</div>
                : fullList.map(entry => (
                  <LeaderboardRow key={entry.userId} entry={entry} isYou={entry.userId === user?.userId} />
                ))}
            </div>

            {/* my pinned position */}
            {user && (
              <div className="border-t border-white/[0.04] px-5 py-3 flex items-center justify-between bg-purple-950/15">
                <span className="text-[9px] font-bold text-[#a1a1aa] uppercase tracking-widest">Sua posição</span>
                <span className="text-[13px] font-extrabold text-[#e9d5ff]" style={{ fontFamily:'"Space Grotesk",sans-serif' }}>
                  #{user.position} — {user.score.toLocaleString('pt-BR')} pts
                </span>
              </div>
            )}
          </div>

          {/* ── LEAGUE PATH — HORIZONTAL ────────────────── */}
          <div className="apple-glass border-none rounded-2xl p-5 shadow-xl">
            <h2 className="text-[13px] font-extrabold text-white tracking-widest uppercase mb-5" style={{ fontFamily:'"Space Grotesk",sans-serif' }}>
              Caminho de Liga
            </h2>

            {/* Horizontal strip */}
            <div className="relative flex items-start gap-0">
              {/* connector line behind nodes */}
              <div className="absolute top-[18px] left-[18px] right-[18px] h-[2px] bg-gradient-to-r from-[#C4FF0E]/20 via-purple-500/40 to-white/[0.04] pointer-events-none" />

              {LEAGUE_ORDER.map((lg, idx) => {
                const lm = LEAGUE_META[lg]
                const isCurrent = lg === currentLeague
                const isCompleted = idx < currentLeagueIndex
                const isLocked = idx > currentLeagueIndex
                const icons: Record<string, React.ReactNode> = {
                  bronze:   <Zap className="h-4 w-4" />,
                  silver:   <CheckCircle className="h-4 w-4" />,
                  gold:     <Award className="h-4 w-4" />,
                  platinum: <Trophy className="h-4 w-4" />,
                  diamond:  <Star className="h-4 w-4" fill="currentColor" />,
                }
                return (
                  <div key={lg} className="flex flex-col items-center flex-1 relative z-10">
                    {/* node circle */}
                    <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center mb-3 transition-all
                        ${isCurrent
                          ? 'bg-purple-600/30 border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.4)] ring-4 ring-purple-500/20'
                          : isCompleted
                          ? `${lm.bg} ${lm.border.replace('border-', 'border-')} border`
                          : 'bg-white/[0.03] border-white/10'
                        }`}>
                      <span className={isCurrent ? 'text-[#e9d5ff]' : isCompleted ? lm.color : 'text-[#52525b]'}>
                        {isLocked ? <Lock className="h-3.5 w-3.5" /> : icons[lg]}
                      </span>
                    </div>
                    {/* label */}
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest text-center leading-tight mb-0.5
                        ${isCurrent ? 'text-white' : isCompleted ? lm.color : 'text-[#52525b]'}`}>
                      {lm.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[8px] font-bold text-[#d8b4fe] uppercase tracking-widest">Atual</span>
                    )}
                    {isCompleted && (
                      <span className="text-[8px] font-bold text-[#C4FF0E] uppercase tracking-widest">✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT ─────────────────────────────────────── */}
        <div className="flex flex-col gap-6 xl:w-[380px] h-full overflow-hidden shrink-0">

          {/* CONQUISTAS — spans row 1, taking all available space */}
          <div className="apple-glass border-none rounded-2xl p-5 shadow-2xl flex flex-col min-h-0 overflow-hidden flex-1">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-[12px] font-extrabold text-white tracking-widest uppercase text-wrap-balance" style={{ fontFamily:'"Space Grotesk",sans-serif' }}>
                Conquistas
              </h2>
              <span className="text-[9px] font-bold text-[#52525b] tracking-widest">
                {achievements.filter(a => a.completed).length}/{achievements.length}
              </span>
            </div>

            {/* scrollable stack fills remaining space */}
            <div className="flex flex-col gap-2 overflow-y-auto min-h-0 flex-1 pr-0.5">
              {achievements
                .sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
                .map((a, i) => <AchievementRow key={a.id} a={a} index={i} />)}
            </div>
          </div>

          {/* MISSÕES ATIVAS — compact, shrink-0 */}
          <div className="apple-glass border-none rounded-2xl p-5 shadow-xl shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[12px] font-extrabold text-white tracking-widest uppercase" style={{ fontFamily:'"Space Grotesk",sans-serif' }}>
                Missões Ativas
              </h2>
              <Target className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              {user ? [
                { label: `Top ${Math.max(1, (user.position ?? 13) - 5)} do Ranking`, reward: '+5k XP', done: false, dot: 'bg-[#C4FF0E]', rc: 'text-[#C4FF0E]' },
                { label: `Sequência de ${Math.max(7, (user.streakDays ?? 0) + 2)} dias`, reward: user.streakDays >= 7 ? 'COMPLETA' : `${user.streakDays}/7`, done: user.streakDays >= 7, dot: 'bg-[#d8b4fe]', rc: user.streakDays >= 7 ? 'text-[#C4FF0E]' : 'text-[#d8b4fe]' },
                { label: `${user.goalsCompleted + 1}ª Meta Financeira`, reward: `${user.goalsCompleted}/5`, done: false, dot: 'bg-[#52525b]', rc: 'text-[#52525b]' },
              ].map(({ label, reward, done, dot, rc }, i) => (
                <div key={i} className={`flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0 ${done ? 'opacity-50' : ''}`}>
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
                  <span className={`text-[11px] flex-1 leading-snug ${done ? 'line-through text-[#52525b]' : 'text-[#d4d4d8]'}`}>{label}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest shrink-0 ${rc}`}>{reward}</span>
                </div>
              )) : <p className="text-[#71717a] text-sm py-2 text-center">Carregando...</p>}
            </div>
          </div>

          {/* ESTATÍSTICAS — compact, shrink-0 */}
          <div className="apple-glass border-none rounded-2xl p-5 shadow-xl shrink-0">
            <h2 className="text-[12px] font-extrabold text-white tracking-widest uppercase mb-3 text-wrap-balance" style={{ fontFamily:'"Space Grotesk",sans-serif' }}>
              Estatísticas
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:'Total Usuários',   value: stats?.totalUsers?.toLocaleString('pt-BR') ?? '—', icon:<Users className="h-3 w-3 text-[#a1a1aa]"/> },
                { label:'Top Pontuação',     value: stats?.topScore?.toLocaleString('pt-BR') ?? '—',   icon:<Trophy className="h-3 w-3 text-[#C4FF0E]"/> },
                { label:'Metas Concluídas', value: user?.goalsCompleted ?? '—',                        icon:<Target className="h-3 w-3 text-emerald-400"/> },
                { label:'Nível Atual',       value: user?.level ?? '—',                                icon:<Zap className="h-3 w-3 text-purple-400"/> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-black/20 rounded-xl p-3 border border-white/[0.04]">
                  <div className="flex items-center gap-1 mb-1.5">{icon}
                    <span className="text-[8px] font-bold text-[#52525b] uppercase tracking-widest">{label}</span>
                  </div>
                  <span className="text-[18px] font-extrabold text-white leading-none tabular-nums" style={{ fontFamily:'"Space Grotesk",sans-serif', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}