(function () {
  "use strict";

  var config = window.LETX_SITE_CONFIG || {};

  function cleanValue(value) {
    return String(value || "").trim();
  }

  function digitsOnly(value) {
    return cleanValue(value).replace(/\D/g, "");
  }

  function phoneHref(value) {
    var phone = cleanValue(value);

    if (!phone) {
      return "";
    }

    if (phone.charAt(0) === "+") {
      return "tel:+" + digitsOnly(phone);
    }

    return "tel:" + digitsOnly(phone);
  }

  function whatsappHref(value, message) {
    var digits = digitsOnly(value);

    if (!digits) {
      return "";
    }

    return "https://wa.me/" + digits + (message ? "?text=" + encodeURIComponent(message) : "");
  }

  function disableLink(node) {
    node.setAttribute("href", "#");
    node.setAttribute("aria-disabled", "true");
    node.classList.add("is-disabled");
  }

  function getValue(field) {
    return cleanValue(config[field]);
  }

  function applyText() {
    var nodes = document.querySelectorAll("[data-site-field]");

    Array.prototype.forEach.call(nodes, function (node) {
      var value = getValue(node.getAttribute("data-site-field"));

      if (!value && node.hasAttribute("data-hide-when-empty")) {
        var parent = node.closest ? node.closest("li") : null;
        (parent || node).style.display = "none";
        return;
      }

      if (value || node.hasAttribute("data-allow-empty")) {
        node.textContent = value;
      }
    });
  }

  function applyLinks() {
    var nodes = document.querySelectorAll("[data-site-href]");

    Array.prototype.forEach.call(nodes, function (node) {
      var type = node.getAttribute("data-site-href");
      var href = "";

      if (type === "phone") {
        href = phoneHref(config.phoneNumber);
      }

      if (type === "email") {
        href = getValue("email") ? "mailto:" + getValue("email") : "";
      }

      if (type === "whatsapp") {
        href = whatsappHref(config.whatsappNumber);
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener");
      }

      if (href) {
        node.setAttribute("href", href);
        node.removeAttribute("aria-disabled");
        node.classList.remove("is-disabled");
      } else {
        disableLink(node);
      }
    });
  }

  function applyWhatsappForms() {
    var forms = document.querySelectorAll("[data-whatsapp-message-form]");

    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener("submit", function (event) {
        var message = "";
        var defaultMessage = form.getAttribute("data-default-message") || "Hi LetX Technologies, I want to discuss LetX ERP.";
        var messageField = form.querySelector("[data-whatsapp-message]");

        if (form.hasAttribute("data-whatsapp-contact-form")) {
          var formData = new FormData(form);
          var name = formData.get("username") || "";
          var email = formData.get("email") || "";
          var phone = formData.get("phone") || "";
          var subject = formData.get("subject") || "";
          var body = formData.get("message") || "";

          message = [
            defaultMessage,
            "",
            "Name: " + name,
            "Email: " + email,
            "Phone: " + phone,
            "Subject: " + subject,
            "Message: " + body
          ].join("\n");
        } else {
          message = messageField && messageField.value ? messageField.value : "";
        }

        var text = message || defaultMessage;
        var url = whatsappHref(config.whatsappNumber, text);

        event.preventDefault();

        if (url) {
          window.open(url, "_blank", "noopener");
        }
      });
    });
  }

  function applyMaps() {
    var maps = document.querySelectorAll("[data-site-map]");

    Array.prototype.forEach.call(maps, function (map) {
      var key = map.getAttribute("data-site-map") || "headOffice";
      var point = config.mapPoints && config.mapPoints[key];

      if (!point) {
        return;
      }

      map.setAttribute("data-lat", point.lat);
      map.setAttribute("data-lng", point.lng);
      map.setAttribute("data-zoom", point.zoom || 12);
      map.setAttribute("data-title", point.title || "LetX Technologies");
      map.setAttribute(
        "data-content",
        getValue("headOffice") + "<br><a href='mailto:" + getValue("email") + "'>" + getValue("email") + "</a>"
      );

      if (map.hasAttribute("data-site-map-embed")) {
        var lat = Number(point.lat);
        var lng = Number(point.lng);
        var delta = 0.018;
        var src = "https://www.openstreetmap.org/export/embed.html?bbox="
          + encodeURIComponent((lng - delta) + "," + (lat - delta) + "," + (lng + delta) + "," + (lat + delta))
          + "&layer=mapnik&marker="
          + encodeURIComponent(lat + "," + lng);

        map.innerHTML = '<iframe title="' + (point.title || "LetX Technologies") + '" src="' + src + '" loading="lazy"></iframe>';
      }
    });
  }

  function applyCopyright() {
    var year = new Date().getFullYear();
    var nodes = document.querySelectorAll(".copyright");
    Array.prototype.forEach.call(nodes, function (node) {
      node.innerHTML = "Copyright &copy; " + year + " LetX Technologies. All rights reserved.";
    });

    var createdNodes = document.querySelectorAll(".created");
    Array.prototype.forEach.call(createdNodes, function (node) {
      if (node.textContent.includes("Theme Arc")) {
        node.textContent = "LetX ERP";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyText();
    applyLinks();
    applyMaps();
    applyWhatsappForms();
    applyCopyright();
  });
})();
