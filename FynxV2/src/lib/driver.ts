import { driver, DriveStep, Config } from 'driver.js';
import "driver.js/dist/driver.css";
import "@/styles/driver.css";

// Singleton instance to manage the driver
let driverObj: ReturnType<typeof driver> | null = null;

export const createDriver = (steps: DriveStep[]) => {
    // Destroy existing instance if any
    if (driverObj) {
        try {
            driverObj.destroy();
        } catch (e) {
            console.error('Error destroying previous driver instance:', e);
        }
        driverObj = null;
    }

    const config: Config = {
        showProgress: true,
        steps: steps,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        // Overlay mais claro para não escurecer tanto o elemento destacado
        overlayColor: "rgba(0,0,0,0.55)",
        // Mantém fundo transparente dentro do recorte
        stageBackgroundColor: "transparent",
        // Aumenta espaço ao redor do elemento para evitar recorte encostado nas bordas do card
        stagePadding: 14,
        popoverClass: "fynx-driver-popover",
        showButtons: ['next', 'previous', 'close'],
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Próximo",
        prevBtnText: "Anterior",
        doneBtnText: "Concluir",

        // Hook for the Close (X) button
        onCloseClick: () => {
            console.log('Close button clicked via onCloseClick hook');
            if (driverObj) {
                driverObj.destroy();
                driverObj = null;
            }
        },

        // Hook for Next/Finish button
        onNextClick: (element, step, { state }) => {
            if (driverObj) {
                const isLastStep = state.activeIndex === steps.length - 1;

                if (isLastStep) {
                    console.log('Finish button clicked (onNextClick)');
                    localStorage.setItem('fynx-tour-completed', 'true');
                    driverObj.destroy();
                    driverObj = null;
                } else {
                    driverObj.moveNext();
                }
            }
        },

        onDestroyStarted: () => {
            console.log('onDestroyStarted triggered');

            // Check if we are on the last step to mark as completed
            if (driverObj) {
                const activeIndex = driverObj.getActiveIndex();
                // If we are at the last step, mark as completed
                if (typeof activeIndex === 'number' && activeIndex === steps.length - 1) {
                    console.log('Tour completed naturally');
                    localStorage.setItem('fynx-tour-completed', 'true');
                }
            }

            // Allow destruction to proceed
            return true;
        },

        onPopoverRender: (popover, { config, state }) => {
            // Add Skip Button to the footer
            const footer = popover.footerButtons;

            if (footer) {
                // Handle Skip Button
                if (!footer.querySelector('.fynx-skip-btn')) {
                    const skipBtn = document.createElement("button");
                    skipBtn.innerText = "Pular";
                    skipBtn.className = "fynx-skip-btn";
                    footer.insertBefore(skipBtn, footer.firstChild);

                    skipBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Skip button clicked');

                        localStorage.setItem('fynx-tour-skipped', 'true');
                        if (driverObj) {
                            driverObj.destroy();
                            driverObj = null;
                        }
                    });
                }
            }
        },

        // When element is highlighted we can tweak additional styles if needed
        onHighlighted: (element) => {
            // If element has a dark background, temporarily add a lighter ring class
            try {
                if (element) {
                    element.classList.add('driver-active-element');
                }
            } catch (e) {
                console.warn('onHighlighted style application failed:', e);
            }
        }
    };

    driverObj = driver(config);
    return driverObj;
};

export const startTour = (steps: DriveStep[]) => {
    const tour = createDriver(steps);
    tour.drive();
};

export const hasSeenTour = () => {
    return localStorage.getItem('fynx-tour-completed') === 'true' || localStorage.getItem('fynx-tour-skipped') === 'true';
};

export const resetTourHistory = () => {
    localStorage.removeItem('fynx-tour-completed');
    localStorage.removeItem('fynx-tour-skipped');
}
