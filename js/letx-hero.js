(function () {
  "use strict";

  var hero = document.querySelector("[data-letx-hero]");

  if (!hero) {
    return;
  }

  var slides = hero.querySelectorAll("[data-letx-hero-slide]");
  var previous = hero.querySelector("[data-letx-hero-prev]");
  var next = hero.querySelector("[data-letx-hero-next]");
  var activeIndex = 0;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    Array.prototype.forEach.call(slides, function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
  }

  if (!slides.length) {
    return;
  }

  if (previous) {
    previous.addEventListener("click", function () {
      showSlide(activeIndex - 1);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(activeIndex + 1);
    });
  }
})();
