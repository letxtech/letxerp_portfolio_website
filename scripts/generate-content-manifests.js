const fs = require("fs");
const path = require("path");
const https = require("https");

const rootDir = path.resolve(__dirname, "..");

// 1. Load environment variables from .env if present
function loadEnv() {
  const envPath = path.join(rootDir, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnv();

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

// 2. Existing Markdown parser functions
function parseValue(value) {
  const trimmed = value.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  return trimmed.replace(/^["']|["']$/g, "");
}

function parseMarkdown(filePath) {
  const fileName = path.basename(filePath);
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`${fileName} is missing frontmatter.`);
  }

  const frontmatter = {};

  match[1].split(/\r?\n/).forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    frontmatter[key] = parseValue(value);
  });

  const slug = frontmatter.slug || fileName.replace(/\.md$/i, "");
  const content = match[2].trim();
  const plainText = content
    .replace(/^#.*$/gm, "")
    .replace(/[#*_>`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return { frontmatter, slug, content, plainText };
}

function readMarkdownCollection(options) {
  const dir = path.join(rootDir, options.dir);
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .map((file) => {
      const parsed = parseMarkdown(path.join(dir, file));
      return options.map(parsed);
    });
}

// 3. Contentful API Fetcher
function fetchContentfulEntries() {
  if (!spaceId || !accessToken) {
    return Promise.resolve(null);
  }

  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?access_token=${accessToken}&include=2`;

  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              console.warn(`Contentful CDA returned status ${res.statusCode}: ${data}`);
              resolve(null);
            }
          } catch (e) {
            console.warn("Failed to parse Contentful JSON response:", e.message);
            resolve(null);
          }
        });
      })
      .on("error", (err) => {
        console.warn("Could not connect to Contentful API (will use Markdown only):", err.message);
        resolve(null);
      });
  });
}

function resolveAssetUrl(assetRef, assetsMap) {
  if (!assetRef) return "";
  if (typeof assetRef === "string") {
    if (assetRef.startsWith("//")) return "https:" + assetRef;
    return assetRef;
  }
  const assetId = assetRef.sys && assetRef.sys.id;
  if (!assetId || !assetsMap[assetId]) return "";
  const url = assetsMap[assetId];
  if (url && url.startsWith("//")) return "https:" + url;
  return url || "";
}

function parseContentfulData(apiData) {
  if (!apiData || !Array.isArray(apiData.items)) {
    return { blogs: [], portfolio: [] };
  }

  const assetsMap = {};
  if (apiData.includes && Array.isArray(apiData.includes.Asset)) {
    apiData.includes.Asset.forEach((asset) => {
      const id = asset.sys && asset.sys.id;
      const fileUrl = asset.fields && asset.fields.file && asset.fields.file.url;
      if (id && fileUrl) {
        assetsMap[id] = fileUrl;
      }
    });
  }

  const blogs = [];
  const portfolio = [];

  apiData.items.forEach((item) => {
    const type = item.sys && item.sys.contentType && item.sys.contentType.sys.id;
    const f = item.fields || {};

    // Match erp_blogs and legacy blog/blogs
    if (type === "erp_blogs") {
      const coverUrl = resolveAssetUrl(f.cover || f.coverImage, assetsMap) || "images/letx/blog-cover.png";
      const rawDate = f.date || f.publishDate || (item.sys && item.sys.createdAt) || "";
      const dateStr = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;

      let keywords = [];
      if (Array.isArray(f.keywords)) keywords = f.keywords;
      else if (typeof f.keywords === "string") keywords = f.keywords.split(",").map((s) => s.trim()).filter(Boolean);
      else if (typeof f.tags === "string") keywords = f.tags.split(",").map((s) => s.trim()).filter(Boolean);

      blogs.push({
        title: f.title || "Untitled Blog",
        slug: f.slug || item.sys.id,
        date: dateStr,
        author: f.author || "LetX Technologies",
        category: f.category || "ERP",
        description: f.description || "",
        keywords,
        cover: coverUrl,
        content: typeof f.content === "string" ? f.content : "",
        source: "contentful"
      });
    }

    // Match erp_portfolio and legacy portfolio
    if (type === "erp_portfolio") {
      const coverUrl = resolveAssetUrl(f.cover || f.coverImage, assetsMap) || "images/letx/portfolio-cover.png";
      const rawDate = f.date || f.publishDate || (item.sys && item.sys.createdAt) || "";
      const dateStr = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;

      let keywords = [];
      if (Array.isArray(f.keywords)) keywords = f.keywords;
      else if (typeof f.keywords === "string") keywords = f.keywords.split(",").map((s) => s.trim()).filter(Boolean);
      else if (typeof f.tags === "string") keywords = f.tags.split(",").map((s) => s.trim()).filter(Boolean);

      portfolio.push({
        title: f.title || "Untitled Project",
        slug: f.slug || item.sys.id,
        client: f.client || f.title || "LetX Client",
        industry: f.industry || "Business Solutions",
        package: f.package || f.projectType || "ERP",
        solution: f.solution || f.projectType || f.industry || "Custom ERP Solution",
        date: dateStr,
        status: f.status || "Implemented",
        description: f.description || "",
        keywords,
        cover: coverUrl,
        content: typeof f.content === "string" ? f.content : "",
        source: "contentful"
      });
    }
  });

  return { blogs, portfolio };
}

// 4. Merge Markdown and Contentful collections
function mergeCollections(markdownList, contentfulList) {
  const seenSlugs = new Set();
  const merged = [];

  // Contentful items take precedence for updates
  contentfulList.forEach((item) => {
    if (item.slug && !seenSlugs.has(item.slug)) {
      seenSlugs.add(item.slug);
      merged.push(item);
    }
  });

  // Then add local Markdown items
  markdownList.forEach((item) => {
    if (item.slug && !seenSlugs.has(item.slug)) {
      seenSlugs.add(item.slug);
      merged.push(item);
    }
  });

  // Sort by date descending (newest first)
  return merged.sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeB - timeA;
  });
}

async function main() {
  // Read local Markdown
  const mdBlogs = readMarkdownCollection({
    dir: "blogs",
    map({ frontmatter, slug, content, plainText }) {
      return {
        title: frontmatter.title || slug,
        slug,
        date: frontmatter.date || "",
        author: frontmatter.author || "LetX Technologies",
        category: frontmatter.category || "ERP",
        description: frontmatter.description || plainText.slice(0, 155),
        keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
        cover: frontmatter.cover || "images/letx/blog-cover.png",
        content,
        source: "markdown"
      };
    }
  });

  const mdPortfolio = readMarkdownCollection({
    dir: "portfolio",
    map({ frontmatter, slug, content, plainText }) {
      return {
        title: frontmatter.title || slug,
        slug,
        client: frontmatter.client || frontmatter.title || slug,
        industry: frontmatter.industry || "",
        package: frontmatter.package || "",
        solution: frontmatter.solution || "",
        date: frontmatter.date || "",
        status: frontmatter.status || "Implemented",
        description: frontmatter.description || plainText.slice(0, 155),
        keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
        cover: frontmatter.cover || "images/letx/portfolio-cover.png",
        content,
        source: "markdown"
      };
    }
  });

  // Fetch from Contentful
  let cfBlogs = [];
  let cfPortfolio = [];
  if (spaceId && accessToken) {
    try {
      const apiData = await fetchContentfulEntries();
      const parsed = parseContentfulData(apiData);
      cfBlogs = parsed.blogs;
      cfPortfolio = parsed.portfolio;
    } catch (err) {
      console.warn("Error fetching Contentful data:", err.message);
    }
  }

  // Merge both sources
  const finalBlogs = mergeCollections(mdBlogs, cfBlogs);
  const finalPortfolio = mergeCollections(mdPortfolio, cfPortfolio);

  // Write static manifests
  fs.writeFileSync(
    path.join(rootDir, "js", "blog-manifest.js"),
    `window.LETX_BLOGS = ${JSON.stringify(finalBlogs, null, 2)};\n`,
    "utf8"
  );

  fs.writeFileSync(
    path.join(rootDir, "js", "portfolio-manifest.js"),
    `window.LETX_PORTFOLIO = ${JSON.stringify(finalPortfolio, null, 2)};\n`,
    "utf8"
  );

  // Write public client config for optional browser-side live sync
  if (spaceId && accessToken) {
    const clientConfig = {
      spaceId,
      accessToken,
      environment
    };
    fs.writeFileSync(
      path.join(rootDir, "js", "contentful-config.js"),
      `window.LETX_CONTENTFUL_CONFIG = ${JSON.stringify(clientConfig, null, 2)};\n`,
      "utf8"
    );
  }

  console.log(
    `Generated blog manifest with ${finalBlogs.length} post(s) (${mdBlogs.length} markdown, ${cfBlogs.length} Contentful).`
  );
  console.log(
    `Generated portfolio manifest with ${finalPortfolio.length} project(s) (${mdPortfolio.length} markdown, ${cfPortfolio.length} Contentful).`
  );
}

main().catch((err) => {
  console.error("Fatal error generating content manifests:", err);
  process.exit(1);
});
