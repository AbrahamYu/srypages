const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Dynamic import for marked
let marked;

const siteConfig = {
    blogTitle: "ABRAHAM_BLOG",
    baseUrl: "https://srypage.kr", // Base URL for sitemap
};

const users = [
    {
        "id": 0,
        "username": "AbrahamYoo",
        "img": "img/user/profile-licat.png"
    },
];

const distPath = path.join(__dirname, 'dist');
const publicPath = __dirname;

function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}.${month}.${day}`;
}

function createSlug(fileName) {
    const regex = /^[(\d{8})]_[(.*?)].(md|ipynb)$/;
    const matches = fileName.match(regex);
    if (matches) {
        return matches[2].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.html';
    }
    return fileName.replace('.md', '.html');
}

async function generateSitemap(pages) {
    const sitemap = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `
  <url>
    <loc>${siteConfig.baseUrl}/${page}</loc>
  </url>`).join('')}
</urlset>`.trim();

    await fs.outputFile(path.join(distPath, 'sitemap.xml'), sitemap);
    console.log("Generated sitemap.xml");
}


async function build() {
    console.log("Starting build...");

    marked = (await import('marked')).marked;

    // 1. Clean up dist directory
    await fs.emptyDir(distPath);
    console.log("Cleaned dist directory.");

    // 2. Copy static assets
    const assets = ['style', 'img', 'library', 'js', 'sideBar', 'data', 'CNAME', 'googledc39fa84396297f2.html'];
    for (const asset of assets) {
        const sourcePath = path.join(publicPath, asset);
        const destPath = path.join(distPath, asset);
        if (await fs.pathExists(sourcePath)) {
            await fs.copy(sourcePath, destPath);
        }
    }
    console.log("Copied static assets.");

    const template = await fs.readFile(path.join(__dirname, 'index.html'), 'utf-8');
    const allPagesForSitemap = [];

    // 3. Process blog posts
    const posts = [];
    const postFiles = glob.sync('blog/*.md');

    for (const file of postFiles) {
        const fileName = path.basename(file);
        const regex = /^[(\d{8})]_[(.*?)].(md|ipynb)$/;
        const matches = fileName.match(regex);

        if (matches) {
            const postContentMd = await fs.readFile(file, 'utf-8');
            const postContentHtml = marked(postContentMd);
            
            const slug = createSlug(fileName);
            const postData = {
                date: matches[1],
                title: matches[2],
                fileType: matches[3],
                name: fileName,
                slug: slug,
                category: ["Tech"], // Placeholder
                thumbnail: `img/thumb${Math.floor(Math.random() * 10) + 1}.webp`,
                description: postContentMd.substring(0, 150).replace(/\n/g, ' ') + '...',
                author: 0,
                download_url: `/blog/${fileName}` // For local JSON
            };
            posts.push(postData);

            let postHtml = template.replace('<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20"></div>', '');
            postHtml = postHtml.replace('<div id="pagination"></div>', '');
            postHtml = postHtml.replace('<div id="contents" class="mt-6 mb-28 grid-cols-3 max-w-[990px] mx-auto"></div>', `<div id="contents" class="mt-6 mb-28 max-w-[990px] mx-auto markdown-body">${postContentHtml}</div>`);
            postHtml = postHtml.replace(/<title>.*<\/title>/, `<title>${postData.title} | ${siteConfig.blogTitle}<\/title>`);
            
            await fs.outputFile(path.join(distPath, 'blog', slug), postHtml);
            allPagesForSitemap.push(`blog/${slug}`);
        }
    }
    posts.sort((a, b) => b.date.localeCompare(a.date));
    console.log(`Processed ${posts.length} blog posts.`);
    
    // Write local_blogList.json
    await fs.writeJson(path.join(__dirname, 'data/local_blogList.json'), posts, { spaces: 4 });
    console.log("Generated data/local_blogList.json");


    // 4. Create main index.html with blog list
    let blogListHtml = '';
    posts.forEach((post) => {
        const author = users.find(u => u.id === post.author) || users[0];
        blogListHtml += `
            <div class="flex flex-col rounded-lg shadow-lg overflow-hidden cursor-pointer" onclick="window.location.href='blog/${post.slug}'">
                <div class="flex-shrink-0">
                    <img class="h-48 w-full object-cover" src="${post.thumbnail}" alt="${post.title}">
                </div>
                <div class="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-indigo-600">${post.category.join(', ')}</p>
                        <a href="blog/${post.slug}" class="block mt-2">
                            <p class="text-xl font-semibold text-gray-900">${post.title}</p>
                            <p class="mt-3 text-base text-gray-500">${post.description}</p>
                        </a>
                    </div>
                    <div class="mt-6 flex items-center">
                        <div class="flex-shrink-0">
                            <img class="h-10 w-10 rounded-full" src="${author.img}" alt="${author.username}">
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900">${author.username}</p>
                            <div class="flex space-x-1 text-sm text-gray-500">
                                <time datetime="${post.date}">${formatDate(post.date)}</time>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    let indexHtml = template.replace('<div id="contents" class="mt-6 mb-28 grid-cols-3 max-w-[990px] mx-auto"></div>', '');
    indexHtml = indexHtml.replace('<div id="pagination"></div>', '');
    indexHtml = indexHtml.replace('<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20"></div>', `<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20">${blogListHtml}</div>`);
    
    await fs.outputFile(path.join(distPath, 'index.html'), indexHtml);
    allPagesForSitemap.push('index.html');
    console.log("Created main index.html.");

    // 5. Process other menu pages
    const menuFiles = glob.sync('menu/*.md');
    const menuData = [];
    for (const file of menuFiles) {
        const fileName = path.basename(file);
        const slug = fileName.replace('.md', '.html');
        menuData.push({ name: fileName, download_url: `/menu/${fileName}` });

        const menuContentMd = await fs.readFile(file, 'utf-8');
        const menuContentHtml = marked(menuContentMd);

        let menuHtml = template.replace('<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20"></div>', '');
        menuHtml = menuHtml.replace('<div id="pagination"></div>', '');
        menuHtml = menuHtml.replace('<div id="contents" class="mt-6 mb-28 grid-cols-3 max-w-[990px] mx-auto"></div>', `<div id="contents" class="mt-6 mb-28 max-w-[990px] mx-auto markdown-body">${menuContentHtml}</div>`);
        menuHtml = menuHtml.replace(/<title>.*<\/title>/, `<title>${fileName.replace('.md', '')} | ${siteConfig.blogTitle}<\/title>`);
        
        await fs.outputFile(path.join(distPath, slug), menuHtml);
        allPagesForSitemap.push(slug);
    }
    console.log("Processed menu pages.");

    // Write local_blogMenu.json
    await fs.writeJson(path.join(__dirname, 'data/local_blogMenu.json'), menuData, { spaces: 4 });
    console.log("Generated data/local_blogMenu.json");

    // 6. Generate Sitemap
    await generateSitemap(allPagesForSitemap);

    console.log("Build finished successfully!");
}

build().catch(err => {
    console.error("Build failed:", err);
});