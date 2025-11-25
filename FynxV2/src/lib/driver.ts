import { driver, DriveStep, Config } from 'driver.js';
import "driver.js/dist/driver.css";
import "@/styles/driver.css";

// Singleton instance to manage the driver
let driverObj: ReturnType<typeof driver> | null = null;
let handleEscape: ((e: KeyboardEvent) => void) | null = null;

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
        allowKeyboardControl: true,
        // Overlay mais claro para não escurecer tanto o elemento destacado
        overlayColor: "rgba(0,0,0,0.55)",
        // Mantém fundo transparente dentro do recorte
        stageBackgroundColor: "transparent",
        // Aumenta espaço ao redor do elemento para evitar recorte encostado nas bordas do card
        stagePadding: 14,
        popoverClass: "fynx-driver-popover",
        showButtons: ['next', 'previous', 'close'],
        progressText: "{{current}} de {{total}}",
        nextBtnText: "→",
        prevBtnText: "←",
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

            // Remove ESC listener when tour is destroyed
            document.removeEventListener('keydown', handleEscape, true);

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

                // Force styles on navigation buttons
                const prevBtn = footer.querySelector('.driver-prev-btn, button[aria-label*="previous"], button[aria-label*="Previous"]') as HTMLElement;
                const nextBtn = footer.querySelector('.driver-next-btn, button[aria-label*="next"], button[aria-label*="Next"]') as HTMLElement;
                
                // Try to find by index if selectors don't work
                const allButtons = Array.from(footer.querySelectorAll('button')).filter(btn => 
                    !btn.classList.contains('fynx-skip-btn') && 
                    !btn.classList.contains('driver-popover-close-btn')
                );
                
                const firstBtn = allButtons[0] as HTMLElement;
                const secondBtn = allButtons[1] as HTMLElement;

                const applyButtonStyles = (btn: HTMLElement) => {
                    if (!btn) return;
                    
                    // Force inline styles with !important equivalent (direct style object)
                    btn.style.cssText = `
                        border-radius: 50% !important;
                        width: 32px !important;
                        height: 32px !important;
                        min-width: 32px !important;
                        min-height: 32px !important;
                        max-width: 32px !important;
                        max-height: 32px !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background-color: transparent !important;
                        border: 1px solid hsl(var(--border)) !important;
                        color: hsl(var(--foreground)) !important;
                        transition: all 0.2s !important;
                        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
                    `;

                    // Add hover effect
                    btn.addEventListener('mouseenter', () => {
                        btn.style.backgroundColor = 'hsl(var(--accent))';
                        btn.style.color = 'hsl(var(--accent-foreground))';
                        btn.style.borderColor = 'hsl(var(--accent))';
                        btn.style.transform = 'scale(1.05)';
                    });

                    btn.addEventListener('mouseleave', () => {
                        btn.style.backgroundColor = 'transparent';
                        btn.style.color = 'hsl(var(--foreground))';
                        btn.style.borderColor = 'hsl(var(--border))';
                        btn.style.transform = 'scale(1)';
                    });
                };

                if (prevBtn) applyButtonStyles(prevBtn);
                if (nextBtn) applyButtonStyles(nextBtn);
                if (firstBtn) applyButtonStyles(firstBtn);
                if (secondBtn) applyButtonStyles(secondBtn);
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
    
    // Add explicit ESC key handler
    handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            e.stopPropagation();
            console.log('ESC pressed - closing tour');
            if (driverObj) {
                driverObj.destroy();
                driverObj = null;
            }
            if (handleEscape) {
                document.removeEventListener('keydown', handleEscape, true);
                handleEscape = null;
            }
        }
    };
    
    // Use capture phase to ensure we catch the event first
    document.addEventListener('keydown', handleEscape, true);
    
    tour.drive();
};

export const hasSeenTour = () => {
    return localStorage.getItem('fynx-tour-completed') === 'true' || localStorage.getItem('fynx-tour-skipped') === 'true';
};

export const resetTourHistory = () => {
    localStorage.removeItem('fynx-tour-completed');
    localStorage.removeItem('fynx-tour-skipped');
}
