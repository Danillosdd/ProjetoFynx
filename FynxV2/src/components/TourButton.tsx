import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTour } from '@/hooks/useTour';
import { dashboardSteps } from '@/tours/dashboardTour';
import { getTransactionsTourSteps } from '@/tours/transactionsTour';
import { goalsSteps } from '@/tours/goalsTour';
import { getRankingTourSteps } from '@/tours/rankingTour';

export const TourButton = () => {
    const { startTour, resetTour } = useTour();

    const handleStartDashboardTour = () => {
        startTour(dashboardSteps);
    };

    const handleStartTransactionsTour = () => {
        startTour(getTransactionsTourSteps());
    };

    const handleStartGoalsTour = () => {
        startTour(goalsSteps);
    };

    const handleStartRankingTour = () => {
        startTour(getRankingTourSteps());
    };

    const handleResetTour = () => {
        if (confirm('Isso vai resetar o progresso do tour. Deseja continuar?')) {
            resetTour();
            alert('Tour resetado! Recarregue a página para ver o tour automaticamente.');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Ajuda e Tours"
                >
                    <HelpCircle className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Guias Interativos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleStartDashboardTour}>
                    <span className="mr-2">📊</span>
                    Tour do Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStartTransactionsTour}>
                    <span className="mr-2">💸</span>
                    Como adicionar transações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStartGoalsTour}>
                    <span className="mr-2">🎯</span>
                    Como criar metas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStartRankingTour}>
                    <span className="mr-2">🏆</span>
                    Entender o ranking
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetTour} className="text-muted-foreground text-xs">
                    <span className="mr-2">🔄</span>
                    Resetar tour
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
