(function () {
  "use strict";

  var blogs = Array.isArray(window.LETX_BLOGS) ? window.LETX_BLOGS : [];

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

  function detailUrl(blog) {
    return "blog-detail.html?slug=" + encodeURIComponent(blog.slug);
  }

  function buildCoverAlt(blog) {
    return (blog.title || "LetX ERP Guide") + " - " + (blog.category || "ERP") + " guide by LetX ERP";
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

  function renderHomeCard(blog) {
    return [
      '<div class="news-block col-md-4 col-sm-6 col-xs-12">',
      '<div class="inner-box">',
      '<div class="image"><a href="' + detailUrl(blog) + '">' + renderResponsiveImg(blog.cover, buildCoverAlt(blog), 1672, 941, true) + '</a></div>',
      '<div class="lower-content">',
      '<h3><a href="' + detailUrl(blog) + '">' + escapeHtml(blog.title) + "</a></h3>",
      '<div class="author">By <span>' + escapeHtml(blog.author) + "</span></div>",
      '<div class="text">' + escapeHtml(blog.description) + "</div>",
      "</div></div></div>"
    ].join("");
  }

  function renderListCard(blog) {
    return [
      '<div class="news-block-two col-md-6 col-sm-6 col-xs-12">',
      '<div class="inner-box">',
      '<div class="image"><a href="' + detailUrl(blog) + '">' + renderResponsiveImg(blog.cover, buildCoverAlt(blog), 1672, 941, true) + '</a></div>',
      '<div class="lower-content">',
      '<div class="upper-box">',
      '<div class="posted-date">' + escapeHtml(formatDate(blog.date)) + "</div>",
      '<ul class="post-meta">',
      "<li>By : " + escapeHtml(blog.author) + "</li>",
      "<li>" + escapeHtml(blog.category) + "</li>",
      "</ul>",
      "</div>",
      '<div class="lower-box">',
      '<h3><a href="' + detailUrl(blog) + '">' + escapeHtml(blog.title) + "</a></h3>",
      '<div class="text">' + escapeHtml(blog.description) + "</div>",
      '<a href="' + detailUrl(blog) + '" class="theme-btn btn-style-two">Read more</a>',
      "</div></div></div></div>"
    ].join("");
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

      if (/^###\s+/.test(trimmed)) {
        closeList();
        html.push("<h4>" + inlineMarkdown(trimmed.replace(/^###\s+/, "")) + "</h4>");
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

  function setJsonLd(blog, url) {
    var existing = document.getElementById("letx-blog-jsonld");
    var script = existing || document.createElement("script");
    script.id = "letx-blog-jsonld";
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      url: url,
      description: blog.description,
      image: new URL(blog.cover, "https://letxerp.com/").href,
      datePublished: blog.date,
      dateModified: blog.date,
      author: {
        "@type": "Organization",
        name: blog.author,
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

  function renderRecentSidebar() {
    var containers = document.querySelectorAll("[data-blog-recent]");
    containers.forEach(function (container) {
      var limit = Number(container.getAttribute("data-blog-limit") || 4);
      container.innerHTML = blogs.slice(0, limit).map(function (blog) {
        return '<article class="post"><div class="text"><a href="' + detailUrl(blog) + '">' + escapeHtml(blog.title) + '</a></div><div class="post-info">' + escapeHtml(formatDate(blog.date)) + "</div></article>";
      }).join("");
    });
  }

  function renderLists() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();

    document.querySelectorAll("[data-blog-list]").forEach(function (container) {
      var type = container.getAttribute("data-blog-list");
      var limit = Number(container.getAttribute("data-blog-limit") || blogs.length);
      var pool = blogs;
      if (type !== "latest" && query) {
        pool = blogs.filter(function (blog) {
          var haystack = [blog.title, blog.description, blog.category, (blog.keywords || []).join(" ")].join(" ").toLowerCase();
          return haystack.indexOf(query) !== -1;
        });
      }
      var selectedBlogs = pool.slice(0, limit);
      var renderer = type === "latest" ? renderHomeCard : renderListCard;
      if (!selectedBlogs.length && type !== "latest" && query) {
        container.innerHTML = '<div class="col-md-12 text-center"><p>No guides matched "' + escapeHtml(params.get("q")) + '". <a href="blog-2.html">Show all ERP &amp; Odoo guides</a>.</p></div>';
        return;
      }
      container.innerHTML = selectedBlogs.map(renderer).join("");
    });
  }

  function renderDetail() {
    var container = document.querySelector("[data-blog-detail]");
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    var matchedBlog = slug ? blogs.find(function (item) { return item.slug === slug; }) : blogs[0];

    if (slug && !matchedBlog) {
      setMeta("robots", "noindex, follow");
      document.title = "Guide Not Found | LetX ERP Blog";
      container.innerHTML = '<div class="inner-box"><div class="lower-content"><h2>Guide Not Found</h2><div class="text"><p>The requested ERP &amp; Odoo guide could not be found. Browse all <a href="blog-2.html">ERP &amp; Odoo insights</a> or <a href="contact.html">contact our team</a>.</p></div></div></div>';
      return;
    }

    var blog = matchedBlog;
    if (!blog) {
      container.innerHTML = "<h3>No blog posts found</h3><p>Add markdown files inside the blogs folder or publish articles in Contentful.</p>";
      return;
    }

    setMeta("robots", "index, follow");
    var currentUrl = "https://letxerp.com/blog-detail.html?slug=" + encodeURIComponent(blog.slug);
    var absoluteCover = new URL(blog.cover, "https://letxerp.com/").href;
    var seoTitle = blog.title + " | LetX ERP Blog";
    document.title = seoTitle;
    setMeta("description", blog.description);
    setMeta("keywords", (blog.keywords || []).join(", "));
    setPropertyMeta("og:title", seoTitle);
    setPropertyMeta("og:description", blog.description);
    setPropertyMeta("og:url", currentUrl);
    setPropertyMeta("og:image", absoluteCover);
    setMeta("twitter:title", seoTitle);
    setMeta("twitter:description", blog.description);
    setMeta("twitter:image", absoluteCover);
    setCanonical(currentUrl);
    setJsonLd(blog, currentUrl);

    container.innerHTML = [
      '<div class="inner-box">',
      '<div class="image">' + renderResponsiveImg(blog.cover, buildCoverAlt(blog), 1672, 941, false) + '</div>',
      '<div class="lower-content">',
      '<div class="upper-box">',
      '<div class="posted-date">' + escapeHtml(formatDate(blog.date)) + "</div>",
      '<ul class="post-meta"><li>By : ' + escapeHtml(blog.author) + "</li><li>" + escapeHtml(blog.category) + "</li></ul>",
      "</div>",
      "<h2>" + escapeHtml(blog.title) + "</h2>",
      '<div class="text blog-detail-content">' + markdownToHtml(blog.content) + "</div>",
      "</div></div>"
    ].join("");
  }


  function syncContentfulBlogs() {
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

        var cfBlogs = [];
        data.items.forEach(function (item) {
          var type = item.sys && item.sys.contentType && item.sys.contentType.sys.id;
          var f = item.fields || {};
          if (type === "erp_blogs") {
            var coverRef = f.cover || f.coverImage;
            var coverUrl = "images/letx/blog-cover.png";
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

            cfBlogs.push({
              title: f.title || "Untitled Blog",
              slug: f.slug || item.sys.id,
              date: dateStr,
              author: f.author || "LetX Technologies",
              category: f.category || "ERP",
              description: f.description || "",
              keywords: keywords,
              cover: coverUrl,
              content: typeof f.content === "string" ? f.content : "",
              source: "contentful"
            });
          }
        });

        if (!cfBlogs.length) return;

        // Merge Contentful items with baseline manifest
        var seenSlugs = {};
        var merged = [];
        cfBlogs.forEach(function (b) {
          if (b.slug && !seenSlugs[b.slug]) {
            seenSlugs[b.slug] = true;
            merged.push(b);
          }
        });
        blogs.forEach(function (b) {
          if (b.slug && !seenSlugs[b.slug]) {
            seenSlugs[b.slug] = true;
            merged.push(b);
          }
        });

        blogs = merged.sort(function (a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        window.LETX_BLOGS = blogs;

        // Re-render UI
        renderLists();
        renderDetail();
        renderRecentSidebar();
      })
      .catch(function () {
        // Silently retain static manifest
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderLists();
    renderDetail();
    renderRecentSidebar();
    syncContentfulBlogs();
  });
})();
