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
  title: '5 Signs Your Restaurant Needs a POS System',
  slug: '5-signs-your-restaurant-needs-a-pos-system',
  date: '',
  author: 'LetX Technologies',
  category: 'Cloud POS',
  description:
    'Discover five signs your restaurant needs a POS system, from billing delays and stock problems to poor sales visibility, and learn how Cloud POS can simplify daily operations.',
  keywords: ['restaurant pos', 'cloud pos', 'restaurant management', 'pos system', 'inventory control', 'restaurant billing'],

  // Optional cover image: path to a local file (png/jpg/webp). Leave '' to skip.
  coverImage: '', // e.g. './images/letx/my-cover.png'

  // Article body in Markdown. Either write it here...
  content: `
## Introduction

Running a restaurant involves much more than preparing good food and serving customers. You also need to manage orders, process payments, monitor stock, coordinate staff and keep track of daily sales. When these tasks are handled manually or through separate tools, small problems can quickly become part of everyday operations.

A restaurant POS system can help bring these activities together. Instead of relying on handwritten bills, spreadsheets and disconnected records, a Point of Sale (POS) system gives your team a more organised way to manage sales and daily restaurant operations.

But how do you know when it is time to make the change? Here are five signs your restaurant may need a POS system.

## 1. Billing Takes Too Much Time

One of the clearest signs is that your billing process is slowing down your service.

If your staff still calculate orders manually, write bills by hand or use separate tools to process payments, completing a customer order can take longer than necessary. During busy lunch and dinner periods, these delays can affect the entire service experience.

Manual billing can also lead to problems such as:

- Incorrect item prices or quantities
- Missed items on customer bills
- Calculation mistakes
- Difficulty handling order changes
- Delays when serving several customers at once

A restaurant POS system helps staff record orders and generate bills through a more organised process. When order information is entered into the system, it becomes easier to review the items and calculate the total.

This can make everyday billing more consistent and help your team spend less time on manual calculations.

## 2. You Do Not Have Accurate Stock Information

Food inventory is an important part of restaurant management. You need to know what ingredients and products are available before accepting orders and planning purchases.

If you only check stock manually, it can be difficult to maintain accurate records. Your actual stock may not match what is written in your notebook or spreadsheet.

Common warning signs include:

- Running out of important ingredients unexpectedly
- Finding differences between recorded and actual stock
- Not knowing which items need to be reordered
- Spending too much time checking inventory
- Struggling to identify missing or wasted stock

A POS system with inventory control capabilities can help connect sales information with stock records. This gives restaurant owners and managers a clearer view of inventory movements.

Instead of depending entirely on manual updates, you can use organised stock information to support purchasing decisions and monitor available inventory.

For restaurants with several locations, having a centralised view can also make stock management easier across branches.

## 3. You Cannot Easily Understand Your Daily Sales

Do you know which menu items sell the most? Can you quickly check your total sales for the day? Do you have to spend time collecting bills and calculating figures before understanding how the restaurant performed?

If getting basic sales information requires manual work, your restaurant may have outgrown its current system.

Without organised sales records, it can be difficult to:

- Review daily sales performance
- Identify popular menu items
- Compare sales across different periods
- Understand how much revenue the restaurant generates
- Prepare reports for business decisions

A restaurant POS system helps organise sales information in one place. With access to sales records and reports, managers can review business activity without depending entirely on handwritten calculations.

Real-time reports and dashboards can also help you understand what is happening in your restaurant and make decisions using more accurate information.

Having clear sales information is not only useful for large restaurants. Small cafes, family restaurants and growing food businesses can benefit from better visibility too.

## 4. Managing Staff and Orders Is Becoming Difficult

As your restaurant becomes busier, coordinating staff and customer orders can become more challenging.

For example, a waiter may write down an order incorrectly, forget to communicate a change or struggle to keep track of several tables. Managers may also find it difficult to understand which orders have been entered and how daily sales are being handled.

These problems can create unnecessary confusion between the front-of-house team and kitchen staff.

A POS system provides a more organised way to record and manage customer orders. Staff can enter order details into the system rather than relying only on handwritten notes.

A properly configured system can also support staff accounts and role-based permissions. This helps businesses organise access according to staff responsibilities.

When choosing a POS system, consider how easily your employees can learn and use it. A system should support your restaurant workflow rather than make everyday tasks more complicated.

## 5. You Struggle to Manage Multiple Restaurant Locations

If you operate more than one restaurant or cafe, keeping track of every location can become difficult.

Each branch may have separate sales records, stock information and daily reports. If managers send information through spreadsheets or messages, you may need to collect and compare everything manually.

This makes it harder to maintain a clear picture of the overall business.

Some common challenges include:

- Checking sales at different branches
- Comparing branch performance
- Monitoring stock across locations
- Keeping business information organised
- Getting reports from different managers

A Cloud POS system can help bring restaurant operations together through a centralised system. Depending on the setup, managers can access relevant business information and review activity across multiple branches.

This is especially useful for restaurant owners who want better visibility without depending on separate records from every location.

Even if you currently operate a single restaurant, choosing a system that can support future business growth is worth considering.

## Why Choose a Cloud POS System for Your Restaurant?

A traditional manual process may be enough when a restaurant is very small. However, as customer orders, employees and daily operations increase, managing everything manually becomes more difficult.

A Cloud POS system offers a more organised approach by bringing important restaurant information into one system.

Depending on your business requirements and system configuration, it can help you manage:

- Sales and billing
- Inventory and stock control
- Daily sales information
- Staff accounts and permissions
- Restaurant operations across multiple branches
- Real-time reports and business information

Before choosing a system, consider your restaurant size, daily workflow, reporting needs and future plans. The right setup should match how your business operates.

It is also important to work with an implementation team that understands your requirements, helps configure the system and supports your staff during the rollout.

## Conclusion

If billing takes too long, stock records are inaccurate, sales reports are difficult to prepare, staff struggle with orders or multiple branches are hard to manage, it may be time to consider a restaurant POS system.

A suitable Cloud POS solution can help organise daily operations, improve inventory visibility and give restaurant owners clearer information for business decisions.

At LetX ERP, we provide Cloud POS setup for restaurants and retail businesses. We guide customers step by step, from understanding their requirements and setting up the system to staff training, rollout and ongoing support.

Ready to make your restaurant operations more organised? Contact LetX ERP for a free consultation or demo.

- **WhatsApp:** +94 77 993 6763
- **Email:** info@letxtech.com
- **Website:** letxerp.com
- **Main Office:** Colombo 08, Sri Lanka
- **Branch Office:** UAE

LetX ERP supports businesses worldwide. Visit our Portfolio page at letxerp.com to explore our successful projects.
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