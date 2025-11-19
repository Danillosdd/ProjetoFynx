import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { GoalCard } from "@/components/GoalCard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { InitialTransactionData } from "./AddTransactionSheet";

type Goal = {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  description?: string;
  goalType?: 'spending' | 'saving';
};

interface GoalSectionProps {
  title: string;
  goals: Goal[];
  onAddTransaction: (data: InitialTransactionData) => void;
  onDelete?: (id: string) => void;
}

export const GoalSection = ({ title, goals, onAddTransaction, onDelete }: GoalSectionProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showAll, setShowAll] = useState(false);

  if (!goals || goals.length === 0) {
    return null;
  }

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} onAddTransaction={onAddTransaction} onDelete={onDelete} />
      ))}
    </div>
  );

  const renderCarousel = () => (
    <div className="relative">
      <Carousel className="w-full" orientation="horizontal" opts={{ loop: goals.length > 1 }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {goals.map((goal) => (
            <CarouselItem key={goal.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
              <GoalCard goal={goal} onAddTransaction={onAddTransaction} onDelete={onDelete} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {!isDesktop && (
          <Button size="sm" variant="ghost" onClick={() => setShowAll((s) => !s)}>
            {showAll ? 'Mostrar menos' : 'Exibir todos'}
          </Button>
        )}
      </div>

      {isDesktop ? renderGrid() : (showAll ? renderGrid() : renderCarousel())}
    </div>
  );
};
