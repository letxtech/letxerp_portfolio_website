document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('blog-grid-container');
    const detailsContainer = document.getElementById('blog-details-container');

    if (gridContainer) {
        initBlogGrid(gridContainer);
    } else if (detailsContainer) {
        initBlogDetails(detailsContainer);
    }
});

// Helper: Parse Frontmatter and Markdown
function parseMarkdownFile(markdown) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = markdown.match(frontmatterRegex);
    let meta = {};
    let content = markdown;

    if (match) {
        const fmString = match[1];
        content = markdown.replace(frontmatterRegex, '').trim();
        
        // Simple YAML parser
        const lines = fmString.split('\n');
        lines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > -1) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                // Remove quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                // Array basic parsing for tags
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.substring(1, value.length - 1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                }
                meta[key] = value;
            }
        });
    }
    return { meta, content };
}

async function initBlogGrid(container) {
    try {
        const response = await fetch('blog/posts.json');
        const postsFiles = await response.json();
        
        let gridHTML = '';
        
        for (const file of postsFiles) {
            const res = await fetch(`blog/${file}`);
            const markdown = await res.text();
            const { meta } = parseMarkdownFile(markdown);
            const slug = file.replace('.md', '');
            
            // Build the card HTML EXACTLY matching the rawnews-grid.html template structure
            gridHTML += `
            <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".3s">
                <div class="pp-news-card-item-2 mt-0">
                    <div class="pp-news-image">
                        <img src="${meta.image || 'assets/img/home-2/news/news-1.jpg'}" alt="${meta.title}">
                        <span style="background-color: var(--theme);">${meta.category || 'Blog'}</span>
                    </div>
                    <div class="pp-news-content">
                        <h3>
                            <a href="blog-details.html?post=${slug}">${meta.title}</a>
                        </h3>
                        <ul class="news-post">
                            <li>
                                <i class="fa-regular fa-user"></i>
                                By ${meta.author || 'Admin'}
                            </li>
                            <li class="pp-style-2">
                                <i class="fa-regular fa-calendar-days"></i>
                                ${meta.date}
                            </li>
                        </ul>
                        <a href="blog-details.html?post=${slug}" class="pp-theme-btn mt-4" style="padding: 10px 20px; font-size: 14px;">Read More <i class="fa-solid fa-arrow-right-long"></i></a>
                    </div>
                </div>
            </div>`;
        }
        
        container.innerHTML = gridHTML;
        // Re-initialize wow after dynamic HTML injection to prevent invisibility
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
    } catch (err) {
        console.error("Error loading blog posts:", err);
        if (window.location.protocol === 'file:') {
            container.innerHTML = '<div class="alert alert-danger" style="text-align:left;"><b>CORS Error:</b> You are opening this file directly from your computer (file://). Browsers block local files from fetching other files for security reasons.<br><br><b>How to fix:</b> You must run a local web server (e.g., VS Code "Live Server" extension, or <code>python -m http.server</code>).</div>';
        } else {
            container.innerHTML = '<p>Failed to load blog posts. Check posts.json configuration.</p>';
        }
    }
}

async function initBlogDetails(container) {
    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get('post');
    
    if (!postSlug) {
        container.innerHTML = '<h2>Post not found</h2>';
        return;
    }

    try {
        const res = await fetch(`blog/${postSlug}.md`);
        if (!res.ok) throw new Error("File not found");
        
        const markdown = await res.text();
        const { meta, content } = parseMarkdownFile(markdown);
        
        // Convert markdown to HTML using Marked.js (assumes marked is loaded via CDN)
        const htmlContent = marked.parse(content);
        
        // Update Meta tags for SEO
        document.title = `${meta.title} | LetX ERP`;
        
        let descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute("content", meta.description);
        
        // Inject content matching rawnews-details.html structure EXACTLY
        const postHTML = `
        <div class="pp-details-image">
            <img src="${meta.image || 'assets/img/inner-page/news-details/details-1.jpg'}" alt="${meta.title}">
        </div>
        <div class="pp-news-details-content">
            <h3>${meta.title}</h3>
            <div class="blog-markdown-content mt-4">
                ${htmlContent}
            </div>
            
            <div class="row pp-tag-share-wrap mt-4 mb-5">
                <div class="col-lg-8 col-12">
                    <div class="tagcloud"> 
                        <span>Tags:</span>                                  
                        ${meta.tags ? meta.tags.map(tag => `<a href="#">${tag}</a>`).join('\n') : ''}
                    </div>
                </div>
                <div class="col-lg-4 col-12 mt-3 mt-lg-0 text-lg-end">
                    <div class="social-share">
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fa-brands fa-youtube"></i></a>
                        <a href="#"><i class="fab fa-linkedin-in"></i></a> 
                        <a href="#"><i class="fab fa-facebook-f"></i></a>    
                    </div>
                </div>
            </div>
        </div>`;
        
        container.innerHTML = postHTML;
        // Re-initialize wow after dynamic HTML injection
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
        
        // Add basic markdown styling for headings and lists
        const mdContainer = container.querySelector('.blog-markdown-content');
        if (mdContainer) {
            mdContainer.querySelectorAll('h2').forEach(h => h.style.marginTop = '30px');
            mdContainer.querySelectorAll('h2').forEach(h => h.style.marginBottom = '15px');
            mdContainer.querySelectorAll('h3').forEach(h => h.style.marginTop = '25px');
            mdContainer.querySelectorAll('ul').forEach(ul => {
                ul.style.listStyleType = 'disc';
                ul.style.paddingLeft = '20px';
                ul.style.marginBottom = '20px';
            });
            mdContainer.querySelectorAll('p').forEach(p => p.style.marginBottom = '20px');
        }
        
    } catch (err) {
        console.error("Error loading post:", err);
        if (window.location.protocol === 'file:') {
            container.innerHTML = '<div class="alert alert-danger" style="text-align:left;"><b>CORS Error:</b> You are opening this file directly from your computer (file://). Browsers block local files from fetching other files for security reasons.<br><br><b>How to fix:</b> You must run a local web server (e.g., VS Code "Live Server" extension, or <code>python -m http.server</code>).</div>';
        } else {
            container.innerHTML = '<div class="alert alert-danger">Error loading blog post. It may have been moved or deleted.</div>';
        }
    }
}
