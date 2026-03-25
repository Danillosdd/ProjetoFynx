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
  compactLayout?: boolean;
}

export const GoalSection = ({ title, goals, onAddTransaction, onDelete, compactLayout }: GoalSectionProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showAll, setShowAll] = useState(false);

  if (!goals || goals.length === 0) {
    return null;
  }

  const renderGrid = () => (
    <div className={compactLayout ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
      {goals.map((goal, index) => (
        <div key={goal.id} className="animate-slide-in-up flex-shrink-0" style={{ animationDelay: `${200 + index * 50}ms`, animationFillMode: 'both' }}>
          <GoalCard goal={goal} onAddTransaction={onAddTransaction} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );

  const renderCarousel = () => (
    <div className="relative">
      <Carousel className="w-full" orientation="horizontal" opts={{ loop: goals.length > 1 }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {goals.map((goal, index) => (
            <CarouselItem key={goal.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4 animate-slide-in-up" style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: 'both' }}>
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
