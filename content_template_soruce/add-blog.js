// add-blog.js
// Edit the BLOG section below, then run:  node add-blog.js
// Creates (or updates, if the slug already exists) an entry in "erp_blogs" and publishes it.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const contentful = require('contentful-management');

// =====================================================================
//  >>> START OF EDIT AREA: change ONLY the values below <<<
//  EDIT THIS SECTION FOR EACH NEW BLOG
// =====================================================================
const BLOG = {
  title: 'Why Your Business Needs an ERP in 2026',
  slug: 'why-your-business-needs-an-erp-in-2026', // lowercase, numbers, hyphens only
  date: '2026-11-10',                              // YYYY-MM-DD (leave '' for today)
  author: 'LetX Technologies',
  category: 'ERP Planning', // ERP Planning | Odoo ERP | ERP Packages | Cloud POS | Industry Insights
  description:
    'Learn how an ERP system helps growing businesses control inventory, sales and finance from one place.', // 50-260 chars
  keywords: ['erp', 'erp planning', 'business software'],

  // Optional cover image: path to a local file (png/jpg/webp). Leave '' to skip.
  coverImage: '', // e.g. './images/letx/my-cover.png'

  // Article body in Markdown. Either write it here...
  content: `
## Introduction

Write your article here using Markdown.

### Key benefits

- Single source of truth for your data
- Faster reporting
- Fewer manual errors

## Conclusion

Talk to LetX ERP to plan your rollout.
`,
  // ...or load it from a .md file (this overrides "content" above). Leave '' to skip.
  contentFile: '', // e.g. './my-posts/erp-2026.md'
};
// =====================================================================

// >>> END OF EDIT AREA. DO NOT CHANGE ANYTHING BELOW THIS LINE <<<

const CONTENT_TYPE_ID = 'erp_blogs';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function validate(b) {
  const errors = [];
  if (!b.title || b.title.length < 5 || b.title.length > 255) errors.push('title must be 5-255 characters');
  if (!SLUG_RE.test(b.slug || '')) errors.push('slug must be lowercase letters, numbers and single hyphens');
  if (b.date && !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) errors.push('date must be YYYY-MM-DD');
  if (!b.category) errors.push('category is required');
  if (!b.description || b.description.length < 50 || b.description.length > 260)
    errors.push(`description must be 50-260 characters (currently ${(b.description || '').length})`);
  if (!b.content || !b.content.trim()) errors.push('content is required');
  return errors;
}

async function uploadCover(environment, locale, filePath, title) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error(`Cover image not found: ${abs}`);
  const ext = path.extname(abs).toLowerCase();
  if (!MIME[ext]) throw new Error('Cover image must be .png, .jpg, .jpeg or .webp');

  console.log('Uploading cover image...');
  let asset = await environment.createAssetFromFiles({
    fields: {
      title: { [locale]: title },
      description: { [locale]: '' },
      file: {
        [locale]: { contentType: MIME[ext], fileName: path.basename(abs), file: fs.readFileSync(abs) },
      },
    },
  });
  asset = await asset.processForAllLocales();
  asset = await asset.publish();
  return { sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } };
}

(async () => {
  try {
    const { CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN } = process.env;
    const envId = process.env.CONTENTFUL_ENVIRONMENT || 'master';
    if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN)
      throw new Error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env');

    const blog = { ...BLOG };
    if (blog.contentFile) blog.content = fs.readFileSync(path.resolve(blog.contentFile), 'utf8');
    if (!blog.date) blog.date = new Date().toISOString().slice(0, 10);
    if (!blog.author) blog.author = 'LetX Technologies';

    const errors = validate(blog);
    if (errors.length) {
      console.error('Please fix these before publishing:');
      errors.forEach((e) => console.error('  - ' + e));
      process.exit(1);
    }

    const client = contentful.createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN });
    const space = await client.getSpace(CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(envId);
    const locale = (await environment.getLocales()).items.find((l) => l.default).code;

    const values = {
      title: blog.title,
      slug: blog.slug,
      date: blog.date,
      author: blog.author,
      category: blog.category,
      description: blog.description,
      keywords: blog.keywords || [],
      content: blog.content.trim(),
    };
    if (blog.coverImage) values.cover = await uploadCover(environment, locale, blog.coverImage, blog.title);

    const existing = await environment.getEntries({
      content_type: CONTENT_TYPE_ID,
      'fields.slug': blog.slug,
      limit: 1,
    });

    let entry;
    let action;
    if (existing.items.length) {
      entry = existing.items[0];
      for (const [k, v] of Object.entries(values)) entry.fields[k] = { [locale]: v };
      entry = await entry.update();
      action = 'updated';
    } else {
      const fields = {};
      for (const [k, v] of Object.entries(values)) fields[k] = { [locale]: v };
      entry = await environment.createEntry(CONTENT_TYPE_ID, { fields });
      action = 'created';
    }
    await entry.publish();

    console.log(`\nBlog ${action} and published: "${blog.title}"`);
    console.log(`Slug: ${blog.slug}`);
    console.log(`Open on site: blog-detail.html?slug=${blog.slug}`);
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.details && err.details.errors) console.error(JSON.stringify(err.details.errors, null, 2));
    process.exit(1);
  }
})();