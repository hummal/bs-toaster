import { Toast } from "bootstrap";

const POSITION = {
    TOP_START: "top-0 start-0",
    TOP_CENTER: "top-0 start-50 translate-middle-x",
    TOP_END: "top-0 end-0",
    BOTTOM_START: "bottom-0 start-0",
    BOTTOM_CENTER: "bottom-0 start-50 translate-middle-x",
    BOTTOM_END: "bottom-0 end-0", // Default
    CENTER_START: "top-50 start-0 translate-middle-y",
    CENTER_END: "top-50 end-0 translate-middle-y",
    CENTER: "top-50 start-50 translate-middle",
};

const TYPE = {
    DEFAULT: "bg-default", // Default
    PRIMARY: "bg-primary",
    INFO: "bg-info",
    SUCCESS: "bg-success",
    WARNING: "bg-warning",
    DANGER: "bg-danger",
    DARK: "bg-dark",
};

const TIMER = {
    DISABLED: 0,
    ELAPSED: 1, // Default
    COUNTDOWN: 2,
};

const DEFAULT_DELAY = 5000;

const DEFAULT_ICON_MARKUP = `<i class="p-2 me-2 rounded %TYPE%"></i>`;

const TOAST_CONTAINER_TEMLATE = `<div class="toast-container position-fixed m-3" aria-live="polite"></div>`;

const TOAST_TEMPLATE = `
<div class="toast fade" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
        <span class="bs-toaster-icon d-flex">%ICON%</span>
        <strong class="bs-toaster-title me-auto">%TITLE%</strong>
        <small class="bs-toaster-timer text-muted">%TIMER%</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="bs-toaster-text toast-body">
        %TEXT%
    </div>
</div>
`;

/**
 * TODO: Dark Mode
 */
class Toaster {
    position = POSITION.BOTTOM_END;
    type = TYPE.DEFAULT;
    timer = TIMER.ELAPSED;
    delay = DEFAULT_DELAY;
    defaultIconMarkup = DEFAULT_ICON_MARKUP;

    templateNode = null;
    toastContainer = null;

    constructor({
        position = POSITION.BOTTOM_END,
        type = TYPE.DEFAULT,
        timer = TIMER.ELAPSED,
        delay = DEFAULT_DELAY,
        defaultIconMarkup = DEFAULT_ICON_MARKUP,
    }) {
        this.position = position;
        this.type = type;
        this.timer = timer;
        this.delay = delay;
        this.defaultIconMarkup = defaultIconMarkup;

        this.toastContainer = this.createToastContainer();
        this.templateNode = this.createToastNode();

        // Append container to body
        document.body.appendChild(this.toastContainer);
    }

    createToastContainer() {
        const containerNode = new DOMParser().parseFromString(
            TOAST_CONTAINER_TEMLATE,
            "text/html"
        ).body.childNodes[0];

        containerNode.classList.add(...this.position.split(" "));

        return containerNode;
    }

    createToastNode() {
        return new DOMParser().parseFromString(TOAST_TEMPLATE, "text/html").body
            .childNodes[0];
    }

    renderTime(timerOption, delay, timerNode, toastNode) {
        switch (timerOption) {
            case TIMER.ELAPSED: {
                timerNode.innerText = "just now";
                // Start a timer that updates the text of the time indicator every minute
                let minutes = 1;
                let timerInterval = setInterval(() => {
                    timerNode.innerText = `${minutes}m`;
                    minutes++;
                }, 60 * 1000);

                // Clear interval on toast disposal
                toastNode.addEventListener("hidden.bs.toast", () => {
                    clearInterval(timerInterval);
                });
                break;
            }
            case TIMER.COUNTDOWN: {
                if (delay > 0) {
                    let seconds = delay / 1000;
                    timerNode.innerText = `${seconds}s`;
                    let countdownTimer = setInterval(() => {
                        timerNode.innerText = `${--seconds}s`;
                    }, 1000);

                    // Clear interval on toast disposal
                    toastNode.addEventListener("hidden.bs.toast", () => {
                        clearInterval(countdownTimer);
                    });
                    break;
                }
            }
            default: {
                timerNode.remove();
                break;
            }
        }
    }

    create(
        title,
        text,
        {
            iconMarkup = this.defaultIconMarkup,
            type = this.type,
            timer = this.timer,
            delay = this.delay,
            animation = true,
        }
    ) {
        // Clone template
        const toastNode = this.templateNode.cloneNode(true);

        // Manage Data

        // Set attributes
        toastNode.dataset.bsAutohide = (
            Number.isInteger(delay) && delay > 0
        ).toString();
        toastNode.dataset.bsDelay = delay.toString();
        toastNode.dataset.bsAnimation = animation.toString();

        // Set content
        const iconNode = toastNode.querySelector(".bs-toaster-icon");
        if (iconMarkup) {
            iconMarkup = iconMarkup.replace("%TYPE%", type); // Replace ICON Type if exists
            iconNode.innerHTML = iconMarkup;
        } else {
            iconNode.remove();
        }

        toastNode.querySelector(".bs-toaster-title").innerHTML = title;
        toastNode.querySelector(".bs-toaster-text").innerHTML = text;

        const timerNode = toastNode.querySelector(".bs-toaster-timer");
        this.renderTime(timer, delay, timerNode, toastNode);

        this.render(toastNode);
    }

    render(toastNode) {
        this.toastContainer.appendChild(toastNode);

        // Add remove event
        toastNode.addEventListener("hidden.bs.toast", () => {
            toastNode.remove();
        });

        // Init Boostrap Toast
        const toast = new Toast(toastNode);
        toast.show();
    }
}

export {
    Toaster,
    TYPE as ToasterType,
    POSITION as ToasterPosition,
    TIMER as ToasterTimer,
};
export default Toaster;