// create-test-entries.js
// Creates and publishes one test entry in erp_blogs and one in erp_portfolio.
//
// Needs in your root .env:
//   CONTENTFUL_SPACE_ID=xxxx
//   CONTENTFUL_ENVIRONMENT=master
//   CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-xxxx   <-- Content Management token (NOT the delivery token)
//
// Run:  node create-test-entries.js

require('dotenv').config();
const contentful = require('contentful-management');

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const MGMT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE_ID || !MGMT_TOKEN) {
  console.error('Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN in .env');
  process.exit(1);
}

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const blogContent = `## Welcome to Contentful on LetX ERP

This article was published through Contentful CMS. It seamlessly combines with our existing Markdown blog posts.

### Features

- Zero disruption to existing posts
- Published directly from Contentful
- Fully responsive layout
`;

const portfolioContent = `## Alpha Logistics ERP

Alpha Logistics partnered with LetX ERP for a comprehensive ERP rollout.

## What We Delivered

- Warehouse inventory sync
- Multi-branch logistics reporting
- Fleet expense workflows

## Result

Full operational visibility achieved with zero manual spreadsheet reconciliation.
`;

async function upsertEntry(environment, locale, contentTypeId, slug, fields) {
  // Skip if an entry with this slug already exists
  const existing = await environment.getEntries({
    content_type: contentTypeId,
    'fields.slug': slug,
    limit: 1,
  });
  if (existing.items.length > 0) {
    console.log(`- ${contentTypeId}: "${slug}" already exists, skipping.`);
    return;
  }

  // Wrap each value in the locale key
  const localized = {};
  for (const [key, value] of Object.entries(fields)) {
    localized[key] = { [locale]: value };
  }

  const entry = await environment.createEntry(contentTypeId, { fields: localized });
  await entry.publish();
  console.log(`+ ${contentTypeId}: "${slug}" created and published (id ${entry.sys.id}).`);
}

(async () => {
  try {
    const client = contentful.createClient({ accessToken: MGMT_TOKEN });
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENV_ID);

    const locales = await environment.getLocales();
    const locale = locales.items.find((l) => l.default).code;
    console.log(`Space ${SPACE_ID} / env ${ENV_ID} / locale ${locale}\n`);

    await upsertEntry(environment, locale, 'erp_blogs', 'test-contentful-article', {
      title: 'Test Contentful Article',
      slug: 'test-contentful-article',
      date: TODAY,
      author: 'LetX Technologies',
      category: 'ERP Planning',
      description:
        'This is a test blog post published directly from Contentful CMS, combined with our existing Markdown posts.',
      keywords: ['contentful', 'erp', 'test'],
      content: blogContent,
    });

    await upsertEntry(environment, locale, 'erp_portfolio', 'alpha-logistics-erp', {
      title: 'Alpha Logistics ERP',
      slug: 'alpha-logistics-erp',
      client: 'Alpha Logistics',
      industry: 'Supply Chain & Logistics',
      package: 'Core',
      solution: 'Warehouse & Fleet Management',
      date: TODAY,
      status: 'Implemented',
      description:
        'End-to-end cloud ERP rollout for warehouse operations and real-time fleet logistics tracking.',
      keywords: ['logistics', 'warehouse', 'fleet', 'erp'],
      content: portfolioContent,
    });

    console.log('\nDone. Check the Content tab in Contentful.');
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.details) console.error(JSON.stringify(err.details, null, 2));
    process.exit(1);
  }
})();