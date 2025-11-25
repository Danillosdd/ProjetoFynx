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
            const footer = popover.footerButtons;

            if (footer) {
                // Remove SVGs duplicados e garante apenas o caractere da seta
                const prevBtn = footer.querySelector('button.driver-prev-btn');
                if (prevBtn) {
                    prevBtn.innerHTML = '←';
                }
                const nextBtn = footer.querySelector('button.driver-next-btn');
                if (nextBtn) {
                    nextBtn.innerHTML = '→';
                }
                // Force footer layout
                footer.style.cssText = `
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    width: 100% !important;
                    gap: 0 !important;
                `;

                // Get all buttons
                const allButtons = Array.from(footer.querySelectorAll('button')).filter(btn => 
                    !btn.classList.contains('driver-popover-close-btn')
                );
                
                // Create a container for buttons if there are buttons
                if (allButtons.length > 0) {
                    // Create wrapper div for buttons
                    const buttonWrapper = document.createElement('div');
                    buttonWrapper.style.cssText = `
                        display: flex !important;
                        gap: 8px !important;
                        order: 0 !important;
                        flex-shrink: 0 !important;
                        align-items: center !important;
                    `;

                    // Move all buttons to wrapper
                    allButtons.forEach(btn => {
                        buttonWrapper.appendChild(btn);
                    });

                    // Create Skip button
                    const skipBtn = document.createElement("button");
                    skipBtn.innerText = "Pular";
                    skipBtn.className = "fynx-skip-btn";

                    skipBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        localStorage.setItem('fynx-tour-skipped', 'true');
                        if (driverObj) {
                            driverObj.destroy();
                            driverObj = null;
                        }
                    });


                    // Estilo idêntico ao botão 'Ver Mais Transações'
                    skipBtn.style.cssText = `
                        background-color: var(--background) !important;
                        border: 1px solid hsl(var(--border)) !important;
                        color: hsl(var(--primary-foreground)) !important;
                        font-size: 13px !important;
                        font-weight: 700 !important;
                        cursor: pointer !important;
                        padding: 0 1.25rem !important;
                        border-radius: 0.375rem !important;
                        height: 2rem !important;
                        line-height: 2rem !important;
                        margin: 0 !important;
                        white-space: nowrap !important;
                        flex-shrink: 0 !important;
                        box-shadow: none !important;
                        transition: background 0.2s, color 0.2s, border 0.2s !important;
                        letter-spacing: 0.01em !important;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.12);
                    `;
                    skipBtn.classList.add('hover:bg-accent', 'hover:text-accent-foreground', 'h-8', 'text-xs');

                    skipBtn.addEventListener('mouseenter', () => {
                        skipBtn.style.backgroundColor = 'hsl(var(--accent))';
                        skipBtn.style.color = 'hsl(var(--accent-foreground))';
                        skipBtn.style.borderColor = 'hsl(var(--accent))';
                        skipBtn.style.fontWeight = '700';
                    });
                    skipBtn.addEventListener('mouseleave', () => {
                        skipBtn.style.backgroundColor = 'var(--background)';
                        skipBtn.style.color = 'hsl(var(--primary-foreground))';
                        skipBtn.style.borderColor = 'hsl(var(--border))';
                        skipBtn.style.fontWeight = '700';
                    });

                    // Add skip button to wrapper after navigation buttons
                    buttonWrapper.appendChild(skipBtn);

                    // Insert wrapper at the beginning of footer
                    footer.insertBefore(buttonWrapper, footer.firstChild);
                }

                // Move progress text to the end
                const progressText = footer.querySelector('.driver-popover-progress-text') as HTMLElement;
                if (progressText) {
                    progressText.style.cssText = `
                        margin-left: auto !important;
                        order: 999 !important;
                        flex-shrink: 0 !important;
                    `;
                    footer.appendChild(progressText);
                }

                const applyButtonStyles = (btn: HTMLElement) => {
                    if (!btn) return;
                    
                    // Não manipula filhos nem força conteúdo, deixa o driver.js renderizar normalmente

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
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background-color: transparent !important;
                        border: none !important;
                        color: hsl(var(--foreground)) !important;
                        transition: none !important;
                        flex-shrink: 0 !important;
                        font-size: 28px !important;
                        line-height: 1 !important;
                        vertical-align: middle !important;
                        box-shadow: none !important;
                        outline: none !important;
                    `;
                    // Remove pseudo-elementos se houver (via CSS)
                    btn.classList.add('no-pseudo');

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

                allButtons.forEach(btn => applyButtonStyles(btn as HTMLElement));
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
