// add-portfolio.js
// Edit the PORTFOLIO section below, then run:  node add-portfolio.js
// Creates (or updates, if the slug already exists) an entry in "erp_portfolio" and publishes it.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const contentful = require('contentful-management');

// =====================================================================
//  >>> START OF EDIT AREA: change ONLY the values below <<<
//  EDIT THIS SECTION FOR EACH NEW PORTFOLIO ITEM
// =====================================================================
const PORTFOLIO = {
  title: 'Alpha Logistics ERP',
  slug: 'alpha-logistics-erp', // lowercase, numbers, hyphens only
  client: 'Alpha Logistics',
  industry: 'Supply Chain & Logistics',
  package: 'Core', // Desktop | Essential | Core | Advanced | Starter ERP | Odoo Pro ...
  solution: 'Warehouse & Fleet Management',
  date: '2026-11-10', // Implementation date, YYYY-MM-DD (leave '' for today)
  status: 'Implemented',
  description:
    'End-to-end cloud ERP rollout for warehouse operations and real-time fleet logistics tracking.', // 50-260 chars
  keywords: ['logistics', 'warehouse', 'fleet', 'erp'],

  // Optional cover image: path to a local file (png/jpg/webp). Leave '' to skip.
  coverImage: '', // e.g. './images/letx/alpha-cover.png'

  // Case study body in Markdown. Either write it here...
  content: `
## Alpha Logistics ERP

Alpha Logistics partnered with LetX ERP for a comprehensive ERP rollout.

## What We Delivered

- Warehouse inventory sync
- Multi-branch logistics reporting
- Fleet expense workflows

## Result

Full operational visibility achieved with zero manual spreadsheet reconciliation.
`,
  // ...or load it from a .md file (this overrides "content" above). Leave '' to skip.
  contentFile: '', // e.g. './my-posts/alpha-logistics.md'
};
// =====================================================================

// >>> END OF EDIT AREA. DO NOT CHANGE ANYTHING BELOW THIS LINE <<<

const CONTENT_TYPE_ID = 'erp_portfolio';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function validate(p) {
  const errors = [];
  if (!p.title || p.title.length < 3 || p.title.length > 255) errors.push('title must be 3-255 characters');
  if (!SLUG_RE.test(p.slug || '')) errors.push('slug must be lowercase letters, numbers and single hyphens');
  if (!p.client || p.client.length > 150) errors.push('client is required (max 150 characters)');
  if (!p.industry) errors.push('industry is required');
  if (!p.package) errors.push('package is required');
  if (!p.solution) errors.push('solution is required');
  if (p.date && !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) errors.push('date must be YYYY-MM-DD');
  if (!p.description || p.description.length < 50 || p.description.length > 260)
    errors.push(`description must be 50-260 characters (currently ${(p.description || '').length})`);
  if (!p.content || !p.content.trim()) errors.push('content is required');
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

    const item = { ...PORTFOLIO };
    if (item.contentFile) item.content = fs.readFileSync(path.resolve(item.contentFile), 'utf8');
    if (!item.date) item.date = new Date().toISOString().slice(0, 10);
    if (!item.status) item.status = 'Implemented';

    const errors = validate(item);
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
      title: item.title,
      slug: item.slug,
      client: item.client,
      industry: item.industry,
      package: item.package,
      solution: item.solution,
      date: item.date,
      status: item.status,
      description: item.description,
      keywords: item.keywords || [],
      content: item.content.trim(),
    };
    if (item.coverImage) values.cover = await uploadCover(environment, locale, item.coverImage, item.title);

    const existing = await environment.getEntries({
      content_type: CONTENT_TYPE_ID,
      'fields.slug': item.slug,
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

    console.log(`\nPortfolio ${action} and published: "${item.title}"`);
    console.log(`Slug: ${item.slug}`);
    console.log(`Open on site: portfolio-detail.html?slug=${item.slug}`);
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.details && err.details.errors) console.error(JSON.stringify(err.details.errors, null, 2));
    process.exit(1);
  }
})();