import { driver, DriveStep, Config } from 'driver.js';
import "driver.js/dist/driver.css";
import "@/styles/driver.css";

// Singleton instance to manage the driver
let driverObj: ReturnType<typeof driver> | null = null;

export const createDriver = (steps: DriveStep[]) => {
    // Destroy existing instance if any
    if (driverObj) {
        driverObj.destroy();
        driverObj = null;
    }

    const config: Config = {
        showProgress: true,
        steps: steps,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayColor: "rgba(0,0,0,0.7)",
        stagePadding: 8,
        popoverClass: "fynx-driver-popover",
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Próximo",
        prevBtnText: "Anterior",
        doneBtnText: "Concluir",
        onDestroyStarted: () => {
            // Ensure we clean up the instance reference
            driverObj = null;
            return true;
        },
        onPopoverRender: (popover, { config, state }) => {
            // Add Skip Button to the footer
            const footer = popover.footerButtons;
            const skipBtn = document.createElement("button");
            skipBtn.innerText = "Pular";
            skipBtn.className = "fynx-skip-btn";

            // Insert as the first child of the footer to be on the left
            footer.insertBefore(skipBtn, footer.firstChild);

            skipBtn.addEventListener("click", () => {
                if (driverObj) {
                    driverObj.destroy();
                    localStorage.setItem('fynx-tour-skipped', 'true');
                }
            });
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
