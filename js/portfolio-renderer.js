(function () {
  "use strict";

  var projects = Array.isArray(window.LETX_PORTFOLIO) ? window.LETX_PORTFOLIO : [];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  }

  function detailUrl(project) {
    return "portfolio-detail.html?slug=" + encodeURIComponent(project.slug);
  }

  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, function (_m, text, url) {
        var isExternal = /^https?:\/\//i.test(url);
        return isExternal
          ? '<a href="' + url + '" target="_blank" rel="noopener">' + text + "</a>"
          : '<a href="' + url + '">' + text + "</a>";
      });
  }

  function markdownToHtml(markdown) {
    var html = [];
    var lines = String(markdown || "").split(/\r?\n/);
    var listOpen = false;

    function closeList() {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
    }

    lines.forEach(function (line) {
      var trimmed = line.trim();

      if (!trimmed) {
        closeList();
        return;
      }

      if (/^##\s+/.test(trimmed)) {
        closeList();
        html.push("<h3>" + inlineMarkdown(trimmed.replace(/^##\s+/, "")) + "</h3>");
        return;
      }

      if (/^#\s+/.test(trimmed)) {
        closeList();
        return;
      }

      if (/^-\s+/.test(trimmed)) {
        if (!listOpen) {
          html.push("<ul>");
          listOpen = true;
        }
        html.push("<li>" + inlineMarkdown(trimmed.replace(/^-\s+/, "")) + "</li>");
        return;
      }

      closeList();
      html.push("<p>" + inlineMarkdown(trimmed) + "</p>");
    });

    closeList();
    return html.join("");
  }

  function setMeta(name, content) {
    if (!content) return;
    var tag = document.querySelector('meta[name="' + name + '"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setPropertyMeta(property, content) {
    if (!content) return;
    var tag = document.querySelector('meta[property="' + property + '"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setCanonical(url) {
    var link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);
  }

  function localWebpPath(src) {
    var m = String(src || "").match(/^(images\/letx\/(?:blog-cover|portfolio-cover|erp-implementation-team|erp-two-paths|hero-erp-dashboard|hero-mobile-erp|hero-mobile-odoo|hero-laptop-erp-modules|hero-laptop-erp-workflow))\.png$/i);
    return m ? m[1] + ".webp" : "";
  }

  function renderResponsiveImg(src, alt, w, h, lazy) {
    var webp = localWebpPath(src);
    var attrs = 'src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '" width="' + w + '" height="' + h + '" decoding="async"' + (lazy ? ' loading="lazy"' : "");
    var imgTag = "<img " + attrs + " />";
    return webp ? '<picture><source srcset="' + escapeHtml(webp) + '" type="image/webp">' + imgTag + "</picture>" : imgTag;
  }

  function setJsonLd(project, url) {
    var existing = document.getElementById("letx-portfolio-jsonld");
    var script = existing || document.createElement("script");
    script.id = "letx-portfolio-jsonld";
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.title,
      url: url,
      description: project.description,
      image: new URL(project.cover, "https://letxerp.com/").href,
      datePublished: project.date,
      about: project.solution,
      creator: {
        "@type": "Organization",
        name: "LetX Technologies",
        url: "https://letxerp.com/"
      },
      publisher: {
        "@type": "Organization",
        name: "LetX Technologies",
        url: "https://letxerp.com/",
        logo: {
          "@type": "ImageObject",
          url: "https://letxerp.com/images/letx/letx-logo-full-white.png"
        }
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url
      }
    });
    if (!existing) {
      document.head.appendChild(script);
    }
  }

  function buildCoverAlt(project) {
    return (project.title || "LetX ERP Client") + " - " + (project.solution || "ERP Solution") + " (" + (project.package || "ERP") + ") by LetX ERP";
  }

  function renderPortfolioCard(project) {
    return [
      '<div class="gallery-item col-md-4 col-sm-6 col-xs-12">',
      '<div class="inner-box">',
      '<figure class="image-box"><a href="' + detailUrl(project) + '">' + renderResponsiveImg(project.cover, buildCoverAlt(project), 1672, 941, true) + '</a></figure>',
      '<h3><a href="' + detailUrl(project) + '">' + escapeHtml(project.title) + "</a></h3>",
      '<div class="designation">' + escapeHtml(project.package) + " | " + escapeHtml(project.industry) + "</div>",
      '<div class="portfolio-card-text">' + escapeHtml(project.description) + "</div>",
      "</div></div>"
    ].join("");
  }

  function renderList() {
    document.querySelectorAll("[data-portfolio-list]").forEach(function (container) {
      container.innerHTML = projects.map(renderPortfolioCard).join("");
    });
  }

  function renderDetail() {
    var container = document.querySelector("[data-portfolio-detail]");
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    var matchedProject = slug ? projects.find(function (item) { return item.slug === slug; }) : projects[0];

    if (slug && !matchedProject) {
      setMeta("robots", "noindex, follow");
      document.title = "Case Study Not Found | LetX ERP Portfolio";
      container.innerHTML = '<div class="inner-container"><div class="lower-content"><div class="upper-box"><div class="sec-title-two"><h2>Case Study Not Found</h2></div><p>The requested client implementation could not be found. Browse our <a href="portfolio-1.html">ERP &amp; Odoo portfolio</a> or <a href="contact.html">contact our team</a>.</p></div></div></div>';
      return;
    }

    var project = matchedProject;
    if (!project) {
      container.innerHTML = "<h3>No portfolio projects found</h3><p>Add markdown files inside the portfolio folder or configure Contentful entries to display client case studies.</p>";
      return;
    }

    setMeta("robots", "index, follow");
    var currentUrl = "https://letxerp.com/portfolio-detail.html?slug=" + encodeURIComponent(project.slug);
    var absoluteCover = new URL(project.cover, "https://letxerp.com/").href;
    var seoTitle = project.title + " — " + project.solution + " | LetX ERP Case Study";
    document.title = seoTitle;
    setMeta("description", project.description);
    setMeta("keywords", (project.keywords || []).join(", "));
    setPropertyMeta("og:title", seoTitle);
    setPropertyMeta("og:description", project.description);
    setPropertyMeta("og:url", currentUrl);
    setPropertyMeta("og:image", absoluteCover);
    setMeta("twitter:title", seoTitle);
    setMeta("twitter:description", project.description);
    setMeta("twitter:image", absoluteCover);
    setCanonical(currentUrl);
    setJsonLd(project, currentUrl);

    container.innerHTML = [
      '<div class="inner-container">',
      '<div class="upper-content">',
      '<div class="image">' + renderResponsiveImg(project.cover, buildCoverAlt(project), 1672, 941, false) + '</div>',
      '<div class="image-info"><div class="row clearfix">',
      '<div class="info-column col-md-6 col-sm-6 col-xs-12"><ul>',
      '<li><span>Client :</span>' + escapeHtml(project.client) + "</li>",
      '<li><span>Industry :</span>' + escapeHtml(project.industry) + "</li>",
      '<li><span>Package :</span>' + escapeHtml(project.package) + "</li>",
      "</ul></div>",
      '<div class="info-column col-md-6 col-sm-6 col-xs-12"><ul>',
      '<li><span>Status :</span>' + escapeHtml(project.status) + "</li>",
      '<li><span>Solution :</span>' + escapeHtml(project.solution) + "</li>",
      '<li><span>Date :</span>' + escapeHtml(formatDate(project.date)) + "</li>",
      "</ul></div>",
      "</div></div></div>",
      '<div class="lower-content"><div class="upper-box"><div class="sec-title-two"><h2>' + escapeHtml(project.title) + "</h2></div>",
      '<div class="text portfolio-detail-content">' + markdownToHtml(project.content) + "</div>",
      "</div></div></div>"
    ].join("");
  }


  function syncContentfulPortfolio() {
    var config = window.LETX_CONTENTFUL_CONFIG;
    if (!config || !config.spaceId || !config.accessToken || typeof fetch !== "function") {
      return;
    }

    var url = "https://cdn.contentful.com/spaces/" + encodeURIComponent(config.spaceId) +
              "/environments/" + encodeURIComponent(config.environment || "master") +
              "/entries?access_token=" + encodeURIComponent(config.accessToken) +
              "&include=2";

    fetch(url)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.items)) return;

        var assetsMap = {};
        if (data.includes && Array.isArray(data.includes.Asset)) {
          data.includes.Asset.forEach(function (a) {
            var id = a.sys && a.sys.id;
            var u = a.fields && a.fields.file && a.fields.file.url;
            if (id && u) assetsMap[id] = u.indexOf("//") === 0 ? "https:" + u : u;
          });
        }

        var cfPortfolio = [];
        data.items.forEach(function (item) {
          var type = item.sys && item.sys.contentType && item.sys.contentType.sys.id;
          var f = item.fields || {};
          if (type === "erp_portfolio") {
            var coverRef = f.cover || f.coverImage;
            var coverUrl = "images/letx/portfolio-cover.png";
            if (coverRef) {
              if (typeof coverRef === "string") {
                coverUrl = coverRef.indexOf("//") === 0 ? "https:" + coverRef : coverRef;
              } else if (coverRef.sys && assetsMap[coverRef.sys.id]) {
                coverUrl = assetsMap[coverRef.sys.id];
              }
            }

            var rawDate = f.date || f.publishDate || (item.sys && item.sys.createdAt) || "";
            var dateStr = rawDate.indexOf("T") !== -1 ? rawDate.split("T")[0] : rawDate;
            var keywords = Array.isArray(f.keywords) ? f.keywords : (typeof f.keywords === "string" ? f.keywords.split(",").map(function(s){return s.trim();}).filter(Boolean) : []);

            cfPortfolio.push({
              title: f.title || "Untitled Project",
              slug: f.slug || item.sys.id,
              client: f.client || f.title || "LetX Client",
              industry: f.industry || "Business Solutions",
              package: f.package || f.projectType || "ERP",
              solution: f.solution || f.projectType || f.industry || "Custom ERP Solution",
              date: dateStr,
              status: f.status || "Implemented",
              description: f.description || "",
              keywords: keywords,
              cover: coverUrl,
              content: typeof f.content === "string" ? f.content : "",
              source: "contentful"
            });
          }
        });

        if (!cfPortfolio.length) return;

        var seenSlugs = {};
        var merged = [];
        cfPortfolio.forEach(function (p) {
          if (p.slug && !seenSlugs[p.slug]) {
            seenSlugs[p.slug] = true;
            merged.push(p);
          }
        });
        projects.forEach(function (p) {
          if (p.slug && !seenSlugs[p.slug]) {
            seenSlugs[p.slug] = true;
            merged.push(p);
          }
        });

        projects = merged.sort(function (a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        window.LETX_PORTFOLIO = projects;

        // Re-render UI
        renderList();
        renderDetail();
      })
      .catch(function () {
        // Silently retain static manifest
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderList();
    renderDetail();
    syncContentfulPortfolio();
  });
})();
