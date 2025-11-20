import { useEffect, useState, useCallback } from 'react';
import { startTour as startDriverTour, hasSeenTour as checkHasSeenTour, resetTourHistory } from '@/lib/driver';
import { DriveStep } from 'driver.js';

export const useTour = () => {
    const [isTourActive, setIsTourActive] = useState(false);

    // Verifica se é a primeira visita do usuário
    const isFirstVisit = !checkHasSeenTour();

    // Inicia um tour específico
    const startTour = useCallback((tourSteps: DriveStep[]) => {
        startDriverTour(tourSteps);
        setIsTourActive(true);
    }, []);

    // Reseta o tour (útil para desenvolvimento/testes)
    const resetTour = useCallback(() => {
        resetTourHistory();
    }, []);

    return {
        startTour,
        resetTour,
        isFirstVisit,
        isTourActive,
        tourStatus: {
            hasSeenTour: checkHasSeenTour()
        }
    };
};
