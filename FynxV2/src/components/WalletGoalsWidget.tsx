import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InitialTransactionData } from "./AddTransactionSheet";
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
} from "@/components/ui/alert-dialog";

interface Goal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    category?: string;
    goalType?: 'spending' | 'saving';
}

interface WalletGoalsWidgetProps {
    spendingGoals: Goal[];
    savingGoals: Goal[];
    onAddTransaction: (data: InitialTransactionData) => void;
    onDeleteGoal: (id: string) => void;
}

export const WalletGoalsWidget: React.FC<WalletGoalsWidgetProps> = ({ spendingGoals, savingGoals, onAddTransaction, onDeleteGoal }) => {
    const [view, setView] = useState<'spending' | 'saving'>('spending');
    const [orderedGoals, setOrderedGoals] = useState<Goal[]>([]);

    // Sync orderedGoals when view or props change
    useEffect(() => {
        const goals = view === 'spending' ? spendingGoals : savingGoals;
        setOrderedGoals(goals);
    }, [view, spendingGoals, savingGoals]);

    const handleNext = () => {
        if (orderedGoals.length <= 1) return;
        setOrderedGoals(prev => {
            const [first, ...rest] = prev;
            return [...rest, first];
        });
    };

    const handlePrev = () => {
        if (orderedGoals.length <= 1) return;
        setOrderedGoals(prev => {
            const last = prev[prev.length - 1];
            const rest = prev.slice(0, -1);
            return [last, ...rest];
        });
    };

    // Calculate active index for dots based on the original list
    const currentSourceGoals = view === 'spending' ? spendingGoals : savingGoals;
    const activeGoalId = orderedGoals[0]?.id;
    const activeDotIndex = currentSourceGoals.findIndex(g => g.id === activeGoalId);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <Card className="bg-card border-border h-full flex flex-col overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 z-10 bg-card/80 backdrop-blur-sm">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Minhas Metas
                </CardTitle>
                <div className="flex items-center bg-muted rounded-full p-1 relative">
                    {/* Animated background pill */}
                    <motion.div
                        layoutId="active-pill"
                        className="absolute bg-background rounded-full shadow-sm h-[calc(100%-8px)] top-1"
                        initial={false}
                        animate={{
                            left: view === 'spending' ? '4px' : '50%',
                            width: 'calc(50% - 4px)',
                            x: view === 'saving' ? '0%' : '0%'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button
                        onClick={() => setView('spending')}
                        className={cn(
                            "relative z-10 px-3 py-1 text-xs font-medium rounded-full transition-colors",
                            view === 'spending' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Gastos
                    </button>
                    <button
                        onClick={() => setView('saving')}
                        className={cn(
                            "relative z-10 px-3 py-1 text-xs font-medium rounded-full transition-colors",
                            view === 'saving' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Poupança
                    </button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 relative min-h-[300px] flex items-center justify-center p-6 pt-10">
                <div className="w-full max-w-[320px] h-[220px] relative perspective-1000">
                    <AnimatePresence mode='popLayout'>
                        {orderedGoals.length > 0 ? (
                            orderedGoals.map((goal, index) => {
                                // Only show top 3 cards
                                if (index > 2) return null;

                                const isActive = index === 0;
                                const offset = index;

                                // Logic from GoalCard.tsx
                                const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                                const isOverLimit = goal.currentAmount > goal.targetAmount;
                                const isSaving = view === 'saving';

                                // Styling logic
                                const cardBg = isSaving
                                    ? "bg-gradient-to-br from-card to-blue-50/5 dark:to-blue-900/10 border-blue-500/30"
                                    : "bg-gradient-to-br from-card to-secondary/30 border-border";

                                const progressColor = isSaving
                                    ? "bg-blue-500"
                                    : (isOverLimit ? "bg-destructive" : percentage > 80 ? "bg-yellow-500" : "bg-emerald-500");

                                return (
                                    <motion.div
                                        key={goal.id}
                                        layoutId={goal.id}
                                        initial={false}
                                        animate={{
                                            scale: 1 - (offset * 0.05),
                                            y: -(offset * 15),
                                            zIndex: 10 - offset,
                                            opacity: 1 - (offset * 0.2),
                                            rotateX: isActive ? 0 : 5,
                                        }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className={cn(
                                            "absolute inset-0 rounded-xl border p-5 shadow-xl flex flex-col justify-between transition-shadow hover:shadow-2xl bg-card",
                                            cardBg
                                        )}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transformOrigin: "top center"
                                        }}
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-foreground tracking-tight truncate">{goal.title}</h4>
                                                {goal.category && (
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1",
                                                        isSaving ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-secondary text-muted-foreground"
                                                    )}>
                                                        {goal.category}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                {/* Add Transaction Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "h-8 w-8 transition-opacity hover:bg-muted",
                                                        isSaving ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" : ""
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAddTransaction({
                                                            type: isSaving ? 'income' : 'expense',
                                                            goalId: isSaving ? goal.id : undefined,
                                                            spendingLimitId: !isSaving ? goal.id : undefined
                                                        });
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>

                                                {/* Delete Button */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 transition-opacity text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tem certeza que deseja excluir a meta "{goal.title}"? Esta ação não pode ser desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteGoal(goal.id);
                                                                }}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Excluir
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="space-y-3">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                        {isSaving ? "Acumulado" : "Gasto Atual"}
                                                    </p>
                                                    <p className={cn(
                                                        "text-2xl font-bold",
                                                        isSaving ? "text-blue-600 dark:text-blue-400" : (isOverLimit ? 'text-destructive' : 'text-foreground')
                                                    )}>
                                                        {formatCurrency(goal.currentAmount)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        {isSaving ? "Objetivo" : "Limite"}
                                                    </p>
                                                    <p className="text-sm font-semibold">{formatCurrency(goal.targetAmount)}</p>
                                                </div>
                                            </div>

                                            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                                                <div
                                                    className={cn("h-full transition-all duration-500 ease-out", progressColor)}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-xs font-medium">
                                                <span className={cn(
                                                    isSaving ? "text-blue-600 dark:text-blue-400" : (isOverLimit ? "text-destructive" : "text-emerald-600")
                                                )}>
                                                    {isSaving
                                                        ? (percentage >= 100 ? "Meta Atingida! 🎉" : "Em progresso")
                                                        : (isOverLimit ? "Limite Excedido" : "Dentro do limite")
                                                    }
                                                </span>
                                                <span className="text-muted-foreground">{Math.round(percentage)}% {isSaving ? "concluído" : "usado"}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-muted rounded-2xl bg-card/50">
                                <p className="text-muted-foreground text-sm mb-4">Nenhuma meta encontrada.</p>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Plus className="w-4 h-4" /> Criar Meta
                                </Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                {orderedGoals.length > 1 && (
                    <>
                        <div className="absolute bottom-4 left-4 z-20">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full shadow-lg hover:bg-accent hover:text-accent-foreground transition-all"
                                onClick={handlePrev}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                            {currentSourceGoals.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                        idx === activeDotIndex ? "bg-accent w-4" : "bg-muted-foreground/30"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="absolute bottom-4 right-4 z-20">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full shadow-lg hover:bg-accent hover:text-accent-foreground transition-all"
                                onClick={handleNext}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
