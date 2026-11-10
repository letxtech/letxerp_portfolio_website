(function () {
  "use strict";

  var hero = document.querySelector("[data-letx-hero]");
  if (!hero) {
    return;
  }

  var slides = hero.querySelectorAll("[data-letx-hero-slide]");
  var previous = hero.querySelector("[data-letx-hero-prev]");
  var next = hero.querySelector("[data-letx-hero-next]");
  var indicators = hero.querySelectorAll("[data-letx-hero-indicator]");

  if (!slides.length) {
    return;
  }

  var activeIndex = 0;
  var isTransitioning = false;
  var AUTO_INTERVAL = 6500; // 6.5s total cycle (allows 4.5s resting + 2s smooth transition)
  var TRANSITION_DURATION = 2000; // Exact 2000ms transition as requested
  var autoTimer = null;
  var isPaused = false;

  function resetIndicatorProgress() {
    Array.prototype.forEach.call(indicators, function (ind) {
      ind.classList.remove("is-running");
    });

    if (indicators[activeIndex]) {
      void indicators[activeIndex].offsetWidth; // trigger reflow
      if (!isPaused) {
        indicators[activeIndex].classList.add("is-running");
      }
    }
  }

  function showSlide(index, userInitiated) {
    if (isTransitioning && !userInitiated) {
      return;
    }

    var nextIndex = (index + slides.length) % slides.length;
    if (nextIndex === activeIndex && slides[activeIndex].classList.contains("active")) {
      return;
    }

    isTransitioning = true;
    activeIndex = nextIndex;

    Array.prototype.forEach.call(slides, function (slide, slideIndex) {
      var isActive = slideIndex === activeIndex;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", (!isActive).toString());
    });

    Array.prototype.forEach.call(indicators, function (ind, indIndex) {
      var isActive = indIndex === activeIndex;
      ind.classList.toggle("active", isActive);
      ind.setAttribute("aria-selected", isActive.toString());
    });

    resetIndicatorProgress();

    setTimeout(function () {
      isTransitioning = false;
    }, TRANSITION_DURATION);

    if (userInitiated) {
      restartTimer();
    }
  }

  function nextSlide() {
    showSlide(activeIndex + 1, false);
  }

  function startTimer() {
    clearTimer();
    if (slides.length > 1 && !isPaused) {
      autoTimer = setInterval(nextSlide, AUTO_INTERVAL);
      if (indicators[activeIndex]) {
        indicators[activeIndex].classList.add("is-running");
      }
    }
  }

  function clearTimer() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function pause() {
    isPaused = true;
    clearTimer();
    if (indicators[activeIndex]) {
      indicators[activeIndex].classList.remove("is-running");
    }
  }

  function resume() {
    isPaused = false;
    startTimer();
  }

  function restartTimer() {
    clearTimer();
    startTimer();
  }

  // Navigation arrow buttons
  if (previous) {
    previous.addEventListener("click", function (e) {
      e.preventDefault();
      showSlide(activeIndex - 1, true);
    });
  }

  if (next) {
    next.addEventListener("click", function (e) {
      e.preventDefault();
      showSlide(activeIndex + 1, true);
    });
  }

  // Indicator pills
  Array.prototype.forEach.call(indicators, function (indicator, idx) {
    indicator.addEventListener("click", function (e) {
      e.preventDefault();
      showSlide(idx, true);
    });
  });

  // Pause on hover, resume on mouse leave
  hero.addEventListener("mouseenter", pause);
  hero.addEventListener("mouseleave", resume);

  // Pause on focus, resume on blur
  hero.addEventListener("focusin", pause);
  hero.addEventListener("focusout", resume);

  // Tab visibility handling
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pause();
    } else {
      resume();
    }
  });

  // Touch swipe support for mobile
  var touchStartX = 0;
  var touchStartY = 0;

  hero.addEventListener(
    "touchstart",
    function (e) {
      if (!e.touches || e.touches.length === 0) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      pause();
    },
    { passive: true }
  );

  hero.addEventListener(
    "touchend",
    function (e) {
      if (!e.changedTouches || e.changedTouches.length === 0) {
        resume();
        return;
      }
      var touchEndX = e.changedTouches[0].clientX;
      var touchEndY = e.changedTouches[0].clientY;
      var diffX = touchEndX - touchStartX;
      var diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          showSlide(activeIndex + 1, true);
        } else {
          showSlide(activeIndex - 1, true);
        }
      }
      resume();
    },
    { passive: true }
  );

  // Initialize
  showSlide(0, false);
  startTimer();
})();
