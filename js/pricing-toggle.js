(function ($) {
  "use strict";

  function updatePricing(mode) {
    var standardSuffix = mode === "annual" ? "/yr" : "/mo";

    $(
      ".price-section .price-block .inner-box, .letx-package-details .package-detail-block, [data-pricing-card]"
    ).each(function () {
      var $card = $(this);
      var billingType = $card.data("billing-type");

      // 1. Desktop: Fixed One-Time Price ($119), NEVER changes on toggle
      if (billingType === "one-time") {
        $card.find(".pricing-amount").text("$119");
        $card.find(".pricing-period, sub.pricing-period, .package-price sub").text("/one-time");
        return;
      }

      // 2. Advanced: Custom Quote, NEVER changes on toggle
      if (billingType === "custom") {
        var customLabel = $card.data("custom-label") || "Contact Team";
        $card.find(".pricing-amount").text(customLabel);
        $card.find(".pricing-period, sub.pricing-period, .package-price sub").text("");
        return;
      }

      // 3. Essential & Core: Starting Subscription Prices ($11/mo vs $91/yr, $19/mo vs $169/yr)
      var price = mode === "annual" ? $card.data("annual-price") : $card.data("monthly-price");
      var suffix = standardSuffix;

      if (price) {
        $card.find(".pricing-amount").text(price);
        $card.find(".pricing-period, sub.pricing-period, .package-price sub").text(suffix);
      }
    });
  }

  $(document).on("click", "[data-pricing-mode]", function (e) {
    e.preventDefault();
    var $button = $(this);
    var mode = $button.data("pricing-mode");

    $button.addClass("active").siblings("[data-pricing-mode]").removeClass("active");
    updatePricing(mode);
  });

  $(function () {
    updatePricing("monthly");
  });
})(window.jQuery);
