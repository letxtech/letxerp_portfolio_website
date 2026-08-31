(function ($) {
  "use strict";

  function updatePricing(mode) {
    var suffix = mode === "annual" ? "/yr" : "/mo";

    $(".price-section .price-block .inner-box, .letx-package-details .package-detail-block").each(function () {
      var $card = $(this);
      var price = mode === "annual" ? $card.data("annual-price") : $card.data("monthly-price");

      if (price) {
        $card.find(".pricing-amount").text(price);
        $card.find(".price sub").text(suffix);
      }
    });
  }

  $(document).on("click", "[data-pricing-mode]", function () {
    var $button = $(this);
    var mode = $button.data("pricing-mode");

    $button.addClass("active").siblings("[data-pricing-mode]").removeClass("active");
    updatePricing(mode);
  });

  $(function () {
    updatePricing("monthly");
  });
})(window.jQuery);
