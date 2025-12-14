const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Dynamic import for marked
let marked;

// Your existing config and user data
// These would be better in their own files, but for simplicity, we'll define them here.
const siteConfig = {
    blogTitle: "ABRAHAM_BLOG",
    username: "sungyoungyoo", // Replace with your GitHub username if different
    repositoryName: "srypages", // Replace with your repo name if different
};

const users = [
    {
        "id": 0,
        "username": "Garry",
        "img": "img/user/profile-gary.png"
    },
    // Add other users if you have them
];


const distPath = path.join(__dirname, 'dist');
const publicPath = __dirname; // Assumes assets are in the root

// --- Helper Functions ---

function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}.${month}.${day}`;
}

function createSlug(fileName) {
    const regex = /^\[(\d{8})\]_\[(.*?)\]\.(md|ipynb)$/;
    const matches = fileName.match(regex);
    if (matches) {
        // A simple slug function, you might want a more robust one
        return matches[2].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.html';
    }
    return fileName.replace('.md', '.html');
}


// --- Main Build Logic ---

async function build() {
    console.log("Starting build...");

    // Dynamically import 'marked'
    marked = (await import('marked')).marked;

    // 1. Clean up dist directory
    await fs.emptyDir(distPath);
    console.log("Cleaned dist directory.");

    // 2. Copy static assets
    const assets = ['style', 'img', 'library', 'js', 'CNAME', 'googledc39fa84396297f2.html'];
    for (const asset of assets) {
        const sourcePath = path.join(publicPath, asset);
        const destPath = path.join(distPath, asset);
        if (await fs.pathExists(sourcePath)) {
            await fs.copy(sourcePath, destPath);
        }
    }
    console.log("Copied static assets.");

    // 3. Load HTML template
    const template = await fs.readFile(path.join(__dirname, 'index.html'), 'utf-8');
    
    // 4. Process blog posts
    const posts = [];
    const postFiles = glob.sync('blog/*.md');

    for (const file of postFiles) {
        const fileName = path.basename(file);
        const regex = /^\[(\d{8})\]_\[(.*?)\]\.(md|ipynb)$/;
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
                // Mocking some data that was in local_blogList.json
                category: ["Tech"], // You might need a better way to manage categories
                thumbnail: `img/thumb${Math.floor(Math.random() * 10) + 1}.webp`,
                description: postContentMd.substring(0, 150) + '...', // Simple description
                author: 0,
            };
            posts.push(postData);

            // Create individual post HTML
            let postHtml = template.replace('<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20"></div>', '');
            postHtml = postHtml.replace('<div id="pagination"></div>', '');
            postHtml = postHtml.replace('<div id="contents" class="mt-6 mb-28 grid-cols-3 max-w-[990px] mx-auto"></div>', `<div id="contents" class="mt-6 mb-28 max-w-[990px] mx-auto markdown-body">${postContentHtml}</div>`);
            postHtml = postHtml.replace(/<title>.*<\/title>/, `<title>${postData.title} - ${siteConfig.blogTitle}</title>`);
            
            // Adjust relative paths for assets in post pages
            postHtml = postHtml.replace(/href="\.\//g, 'href="../').replace(/src="\.\//g, 'src="../');
            postHtml = postHtml.replace(/href="style\//g, 'href="../style/').replace(/src="img\//g, 'src="../img/');
            postHtml = postHtml.replace(/src="js\//g, 'src="../js/').replace(/href="CNAME"/g, 'href="../CNAME"');


            await fs.outputFile(path.join(distPath, 'blog', slug), postHtml);
        }
    }
    posts.sort((a, b) => b.date.localeCompare(a.date));
    console.log(`Processed ${posts.length} blog posts.`);

    // 5. Create main index.html with blog list
    let blogListHtml = '';
    posts.forEach((post, index) => {
        // This is a simplified card generator based on your render.js
        const author = users[post.author] || users[0];
        blogListHtml += `
            <div class="flex flex-col rounded-lg shadow-lg overflow-hidden cursor-pointer" onclick="window.location.href='blog/${post.slug}'">
                <div class="flex-shrink-0">
                    <img class="h-48 w-full object-cover" src="${post.thumbnail}" alt="${post.title}">
                </div>
                <div class="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-indigo-600">
                            ${post.category.join(', ')}
                        </p>
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
            </div>
        `;
    });

    let indexHtml = template.replace('<div id="contents" class="mt-6 mb-28 grid-cols-3 max-w-[990px] mx-auto"></div>', '');
    indexHtml = indexHtml.replace('<div id="pagination"></div>', '<!-- Pagination can be added here if needed -->');
    indexHtml = indexHtml.replace('<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20"></div>', `<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20">${blogListHtml}</div>`);
    
    // Fix menu links for root index.html
    indexHtml = indexHtml.replace(/href="\.\/menu\/blog\.md"/g, `href="index.html"`);
    indexHtml = indexHtml.replace(/href="\.\/menu\/about\.md"/g, `href="about.html"`);
    indexHtml = indexHtml.replace(/href="\.\/menu\/contact\.md"/g, `href="contact.html"`);
    indexHtml = indexHtml.replace(/href="\.\/menu\/calculator\.md"/g, `href="calculator.html"`);
    indexHtml = indexHtml.replace(/href="\.\/menu\/privacy-policy\.md"/g, `href="privacy-policy.html"`);


    await fs.outputFile(path.join(distPath, 'index.html'), indexHtml);
    console.log("Created main index.html.");

    // 6. Process other menu pages
    const menuFiles = glob.sync('menu/*.md');
    for (const file of menuFiles) {
        const fileName = path.basename(file);
        const slug = fileName.replace('.md', '.html');
        const menuContentMd = await fs.readFile(file, 'utf-8');
        const menuContentHtml = marked(menuContentMd);

        let menuHtml = template.replace('<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[25px] lg:gap-y-10 gap-y-4 mb-20"></div>', '');
        menuHtml = menuHtml.replace('<div id="pagination"></div>', '');
        menuHtml = menuHtml.replace('<div id="contents" class="mt-6 mb-28 grid-cols-3 max-w-[990px] mx-auto"></div>', `<div id="contents" class="mt-6 mb-28 max-w-[990px] mx-auto markdown-body">${menuContentHtml}</div>`);
        menuHtml = menuHtml.replace(/<title>.*<\/title>/, `<title>${fileName.replace('.md', '')} - ${siteConfig.blogTitle}</title>`);
        
        // Fix menu links for menu pages
        menuHtml = menuHtml.replace(/href="\.\/menu\/blog\.md"/g, `href="index.html"`);
        menuHtml = menuHtml.replace(/href="\.\/menu\/about\.md"/g, `href="about.html"`);
        menuHtml = menuHtml.replace(/href="\.\/menu\/contact\.md"/g, `href="contact.html"`);
        menuHtml = menuHtml.replace(/href="\.\/menu\/calculator\.md"/g, `href="calculator.html"`);
        menuHtml = menuHtml.replace(/href="\.\/menu\/privacy-policy\.md"/g, `href="privacy-policy.html"`);

        await fs.outputFile(path.join(distPath, slug), menuHtml);
    }
    console.log("Processed menu pages.");


    console.log("Build finished successfully!");
}

build().catch(err => {
    console.error("Build failed:", err);
});
