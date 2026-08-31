const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

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

function readCollection(options) {
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
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

const blogs = readCollection({
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
      content
    };
  }
});

const portfolio = readCollection({
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
      content
    };
  }
});

fs.writeFileSync(
  path.join(rootDir, "js", "blog-manifest.js"),
  `window.LETX_BLOGS = ${JSON.stringify(blogs, null, 2)};\n`,
  "utf8"
);

fs.writeFileSync(
  path.join(rootDir, "js", "portfolio-manifest.js"),
  `window.LETX_PORTFOLIO = ${JSON.stringify(portfolio, null, 2)};\n`,
  "utf8"
);

console.log(`Generated blog manifest with ${blogs.length} post(s).`);
console.log(`Generated portfolio manifest with ${portfolio.length} project(s).`);
