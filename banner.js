(function () {
    "use strict";

    const carousels = document.querySelectorAll("[data-banner-carousel]");
    if (!carousels.length) {
        return;
    }

    carousels.forEach((carousel) => {
        const slides = Array.from(carousel.querySelectorAll(".banner-slide"));
        const dots = Array.from(carousel.querySelectorAll(".banner-dot"));

        if (!slides.length) {
            return;
        }

        const interval = Number.parseInt(carousel.dataset.interval || "3500", 10);
        let currentIndex = 0;
        let timerId = null;

        const setSlide = (nextIndex) => {
            currentIndex = (nextIndex + slides.length) % slides.length;

            slides.forEach((slide, index) => {
                slide.classList.toggle("is-active", index === currentIndex);
            });

            dots.forEach((dot, index) => {
                const isActive = index === currentIndex;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-selected", isActive ? "true" : "false");
            });
        };

        const stop = () => {
            if (timerId !== null) {
                window.clearInterval(timerId);
                timerId = null;
            }
        };

        const start = () => {
            stop();
            timerId = window.setInterval(() => {
                setSlide(currentIndex + 1);
            }, interval);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                setSlide(index);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        carousel.addEventListener("focusin", stop);
        carousel.addEventListener("focusout", start);

        setSlide(0);
        start();
    });
})();
