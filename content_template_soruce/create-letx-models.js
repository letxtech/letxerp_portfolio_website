// create-letx-models.js
// Creates the erp_blogs and erp_portfolio content types in Contentful.
//
// Run:
//   contentful space migration --space-id YOUR_SPACE_ID --environment-id master create-letx-models.js

const SLUG_PATTERN = '^[a-z0-9]+(?:-[a-z0-9]+)*$';

module.exports = function (migration) {
  // ---------------------------------------------------------------
  // Model A: erp_blogs
  // ---------------------------------------------------------------
  const blogs = migration
    .createContentType('erp_blogs')
    .name('ERP Blogs')
    .description('Blog articles and technical ERP guides for LetX ERP.')
    .displayField('title');

  blogs
    .createField('title')
    .name('Title')
    .type('Symbol')
    .required(true)
    .validations([{ size: { min: 5, max: 255 } }]);

  blogs
    .createField('slug')
    .name('Slug')
    .type('Symbol')
    .required(true)
    .validations([
      { unique: true },
      {
        regexp: { pattern: SLUG_PATTERN },
        message: 'Use lowercase letters, numbers and single hyphens only.',
      },
    ]);

  blogs
    .createField('date')
    .name('Publication Date')
    .type('Date')
    .required(true);

  blogs
    .createField('author')
    .name('Author')
    .type('Symbol')
    .required(false);

  blogs
    .createField('category')
    .name('Category')
    .type('Symbol')
    .required(true);

  // Short text is capped at 255 chars by Contentful, so a 260 limit needs Long text.
  blogs
    .createField('description')
    .name('Description')
    .type('Text')
    .required(true)
    .validations([{ size: { min: 50, max: 260 } }]);

  blogs
    .createField('keywords')
    .name('Keywords')
    .type('Array')
    .items({ type: 'Symbol' })
    .required(false);

  blogs
    .createField('cover')
    .name('Cover Image')
    .type('Link')
    .linkType('Asset')
    .required(false)
    .validations([{ linkMimetypeGroup: ['image'] }]);

  blogs
    .createField('content')
    .name('Content')
    .type('Text')
    .required(true);

  // Field appearance (editor widgets)
  blogs.changeFieldControl('slug', 'builtin', 'slugEditor', { trackingFieldId: 'title' });
  blogs.changeFieldControl('date', 'builtin', 'datePicker', { format: 'dateonly' });
  blogs.changeFieldControl('keywords', 'builtin', 'tagEditor');
  blogs.changeFieldControl('content', 'builtin', 'markdown');

  // ---------------------------------------------------------------
  // Model B: erp_portfolio
  // ---------------------------------------------------------------
  const portfolio = migration
    .createContentType('erp_portfolio')
    .name('ERP Portfolio')
    .description(
      'Portfolio case studies, client ERP rollouts, and implementation stories for LetX ERP.'
    )
    .displayField('title');

  portfolio
    .createField('title')
    .name('Title')
    .type('Symbol')
    .required(true)
    .validations([{ size: { min: 3, max: 255 } }]);

  portfolio
    .createField('slug')
    .name('Slug')
    .type('Symbol')
    .required(true)
    .validations([
      { unique: true },
      {
        regexp: { pattern: SLUG_PATTERN },
        message: 'Use lowercase letters, numbers and single hyphens only.',
      },
    ]);

  portfolio
    .createField('client')
    .name('Client Name')
    .type('Symbol')
    .required(true)
    .validations([{ size: { max: 150 } }]);

  portfolio
    .createField('industry')
    .name('Industry')
    .type('Symbol')
    .required(true);

  portfolio
    .createField('package')
    .name('ERP Package')
    .type('Symbol')
    .required(true);

  portfolio
    .createField('solution')
    .name('Solution')
    .type('Symbol')
    .required(true);

  portfolio
    .createField('date')
    .name('Implementation Date')
    .type('Date')
    .required(true);

  portfolio
    .createField('status')
    .name('Status')
    .type('Symbol')
    .required(false);

  portfolio
    .createField('description')
    .name('Description')
    .type('Text')
    .required(true)
    .validations([{ size: { min: 50, max: 260 } }]);

  portfolio
    .createField('keywords')
    .name('Keywords')
    .type('Array')
    .items({ type: 'Symbol' })
    .required(false);

  portfolio
    .createField('cover')
    .name('Cover Image')
    .type('Link')
    .linkType('Asset')
    .required(false)
    .validations([{ linkMimetypeGroup: ['image'] }]);

  portfolio
    .createField('content')
    .name('Content')
    .type('Text')
    .required(true);

  portfolio.changeFieldControl('slug', 'builtin', 'slugEditor', { trackingFieldId: 'title' });
  portfolio.changeFieldControl('date', 'builtin', 'datePicker', { format: 'dateonly' });
  portfolio.changeFieldControl('keywords', 'builtin', 'tagEditor');
  portfolio.changeFieldControl('content', 'builtin', 'markdown');
};