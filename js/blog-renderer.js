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

  function renderHomeCard(blog, index) {
    var delay = index * 300;
    return [
      '<div class="news-block col-md-4 col-sm-6 col-xs-12">',
      '<div class="inner-box wow fadeInLeft" data-wow-delay="' + delay + 'ms" data-wow-duration="1500ms">',
      '<div class="image"><a href="' + detailUrl(blog) + '"><img src="' + escapeHtml(blog.cover) + '" alt="' + escapeHtml(blog.title) + '" /></a></div>',
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
      '<div class="image"><a href="' + detailUrl(blog) + '"><img src="' + escapeHtml(blog.cover) + '" alt="' + escapeHtml(blog.title) + '" /></a></div>',
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
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
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
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.description,
      image: new URL(blog.cover, window.location.href).href,
      datePublished: blog.date,
      author: { "@type": "Organization", name: blog.author },
      publisher: { "@type": "Organization", name: "LetX Technologies" },
      mainEntityOfPage: url
    });
    document.head.appendChild(script);
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
    document.querySelectorAll("[data-blog-list]").forEach(function (container) {
      var type = container.getAttribute("data-blog-list");
      var limit = Number(container.getAttribute("data-blog-limit") || blogs.length);
      var selectedBlogs = blogs.slice(0, limit);
      var renderer = type === "latest" ? renderHomeCard : renderListCard;
      container.innerHTML = selectedBlogs.map(renderer).join("");
    });
  }

  function renderDetail() {
    var container = document.querySelector("[data-blog-detail]");
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get("slug");
    var blog = blogs.find(function (item) { return item.slug === slug; }) || blogs[0];

    if (!blog) {
      container.innerHTML = "<h3>No blog posts found</h3><p>Add markdown files inside the blogs folder and run the build script.</p>";
      return;
    }

    var currentUrl = window.location.origin + window.location.pathname + "?slug=" + encodeURIComponent(blog.slug);
    document.title = blog.title + " | LetX ERP Blog";
    setMeta("description", blog.description);
    setMeta("keywords", (blog.keywords || []).join(", "));
    setCanonical(currentUrl);
    setJsonLd(blog, currentUrl);

    container.innerHTML = [
      '<div class="inner-box">',
      '<div class="image"><img src="' + escapeHtml(blog.cover) + '" alt="' + escapeHtml(blog.title) + '" /></div>',
      '<div class="lower-content">',
      '<div class="upper-box">',
      '<div class="posted-date">' + escapeHtml(formatDate(blog.date)) + "</div>",
      '<ul class="post-meta"><li>By : ' + escapeHtml(blog.author) + "</li><li>" + escapeHtml(blog.category) + "</li></ul>",
      "</div>",
      "<h3>" + escapeHtml(blog.title) + "</h3>",
      '<div class="text blog-detail-content">' + markdownToHtml(blog.content) + "</div>",
      "</div></div>"
    ].join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderLists();
    renderDetail();
    renderRecentSidebar();
  });
})();
