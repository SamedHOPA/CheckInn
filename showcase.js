(function () {
    "use strict";

    const carousels = document.querySelectorAll("[data-showcase-carousel]");
    if (!carousels.length) {
        return;
    }

    carousels.forEach((carousel) => {
        const slides = Array.from(carousel.querySelectorAll(".showcase-slide"));
        const dots = Array.from(carousel.querySelectorAll(".showcase-dot"));
        const shots = Array.from(carousel.querySelectorAll(".showcase-shot"));
        const prevButton = carousel.querySelector("[data-showcase-prev]");
        const nextButton = carousel.querySelector("[data-showcase-next]");

        if (!slides.length) {
            return;
        }

        shots.forEach((shot) => {
            if (shot.querySelector(".showcase-caption")) {
                return;
            }

            const image = shot.querySelector("img");
            const customCaption = shot.dataset.caption ? shot.dataset.caption.trim() : "";
            const captionText = customCaption || (image && image.alt ? image.alt.trim() : "");
            if (!captionText) {
                return;
            }

            const caption = document.createElement("span");
            caption.className = "showcase-caption";
            caption.textContent = captionText;
            shot.appendChild(caption);
        });

        const intervalValue = Number.parseInt(carousel.dataset.interval || "3500", 10);
        const interval = Number.isFinite(intervalValue) && intervalValue >= 800 ? intervalValue : 3500;

        let currentIndex = 0;
        let timerId = null;
        let startX = 0;
        let startY = 0;
        let isMouseTracking = false;
        let shouldSuppressClick = false;
        let suppressTimerId = null;

        const swipeThreshold = 45;

        const setSlide = (nextIndex) => {
            currentIndex = (nextIndex + slides.length) % slides.length;

            slides.forEach((slide, index) => {
                const isActive = index === currentIndex;
                slide.classList.toggle("is-active", isActive);
                slide.setAttribute("aria-hidden", isActive ? "false" : "true");
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

        const restart = () => {
            stop();
            start();
        };

        const next = () => {
            setSlide(currentIndex + 1);
            restart();
        };

        const prev = () => {
            setSlide(currentIndex - 1);
            restart();
        };

        const handleSwipe = (deltaX, deltaY) => {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (absX <= swipeThreshold || absX <= absY) {
                return false;
            }

            if (deltaX < 0) {
                next();
            } else {
                prev();
            }

            shouldSuppressClick = true;
            if (suppressTimerId !== null) {
                window.clearTimeout(suppressTimerId);
            }
            suppressTimerId = window.setTimeout(() => {
                shouldSuppressClick = false;
                suppressTimerId = null;
            }, 450);
            return true;
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                setSlide(index);
                restart();
            });
        });

        if (prevButton) {
            prevButton.addEventListener("click", prev);
        }

        if (nextButton) {
            nextButton.addEventListener("click", next);
        }

        carousel.addEventListener(
            "touchstart",
            (event) => {
                const touch = event.changedTouches[0];
                if (!touch) {
                    return;
                }

                startX = touch.clientX;
                startY = touch.clientY;
                stop();
            },
            { passive: true }
        );

        carousel.addEventListener(
            "touchend",
            (event) => {
                const touch = event.changedTouches[0];
                if (touch) {
                    const swiped = handleSwipe(touch.clientX - startX, touch.clientY - startY);
                    if (!swiped) {
                        start();
                    }
                } else {
                    start();
                }
            },
            { passive: true }
        );

        carousel.addEventListener("mousedown", (event) => {
            if (event.button !== 0) {
                return;
            }

            isMouseTracking = true;
            startX = event.clientX;
            startY = event.clientY;
            stop();
        });

        window.addEventListener("mouseup", (event) => {
            if (!isMouseTracking) {
                return;
            }

            isMouseTracking = false;
            const swiped = handleSwipe(event.clientX - startX, event.clientY - startY);
            if (!swiped) {
                start();
            }
        });

        carousel.addEventListener(
            "click",
            (event) => {
                if (!shouldSuppressClick) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                shouldSuppressClick = false;
                if (suppressTimerId !== null) {
                    window.clearTimeout(suppressTimerId);
                    suppressTimerId = null;
                }
            },
            true
        );

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        carousel.addEventListener("focusin", stop);
        carousel.addEventListener("focusout", (event) => {
            const nextTarget = event.relatedTarget;
            if (!nextTarget || !carousel.contains(nextTarget)) {
                start();
            }
        });

        if (!carousel.hasAttribute("tabindex")) {
            carousel.setAttribute("tabindex", "0");
        }

        carousel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                prev();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                next();
            }
        });

        setSlide(0);
        start();
    });
})();
