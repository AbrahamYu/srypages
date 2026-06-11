const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// 기본 경로 설정
const CWD = process.cwd();
const DIST_DIR = path.join(CWD, 'dist');
const BLOG_DIR = path.join(CWD, 'blog');
const MENU_DIR = path.join(CWD, 'menu');
const DATA_DIR = path.join(CWD, 'data');
const ASSETS_DIR = ['style', 'img', 'library', 'js'];

// 설정 파일 및 데이터 로드
const config = require(path.join(CWD, 'config.js'));
const blogList = require(path.join(DATA_DIR, 'local_blogList.json'));
const blogMenu = require(path.join(DATA_DIR, 'local_blogMenu.json'));
const users = config.users;

// 템플릿 로드
const listTemplate = fs.readFileSync(path.join(CWD, 'list-template.html'), 'utf-8');
const postTemplate = fs.readFileSync(path.join(CWD, 'post-template.html'), 'utf-8');

// 날짜 포맷 함수
function formatDate(dateString) {
    if (!dateString) return 'Unknown Date'; // 날짜가 없는 경우를 위한 방어 코드
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}.${month}.${day}`;
}

// 메뉴 HTML 생성
function generateMenuHtml() {
    let menuHtml = '';
    blogMenu.forEach(menu => {
        const menuName = menu.name.split('.')[0];
        // 'blog.md'는 'index.html'로, 나머지는 '/[name].html'로 링크
        const link = menu.name === 'blog.md' ? '/index.html' : `/${menuName}.html`;
        menuHtml += `<a href="${link}" class="text-gray-700 hover:text-primary transition-colors duration-300 px-4 py-2">${menuName.charAt(0).toUpperCase() + menuName.slice(1)}</a>`;
    });
    return menuHtml;
}

// 카드 엘리먼트 생성 (빌드 스크립트용으로 수정)
function createCardHtml(postInfo, index) {
    const postLink = `/blog/${postInfo.id}.html`;
    const thumb = postInfo.thumbnail || `img/thumb${Math.floor(Math.random() * 10) + 1}.webp`;
    const author = users[postInfo.author || 0];

    // 카드 스타일 (render.js의 스타일 클래스명을 참고하되, 단순화)
    const cardClass = index === 0 ? 'md:col-span-2 lg:col-span-3 grid md:grid-cols-2 gap-8 items-center' : 'flex flex-col';
    const imgClass = index === 0 ? 'w-full h-full object-cover rounded-lg' : 'w-full h-48 object-cover rounded-lg';
    
    let categoryHtml = '';
    if (postInfo.category) {
        postInfo.category.forEach(cat => {
            categoryHtml += `<span class="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${cat}</span>`;
        });
    }

    return `
        <a href="${postLink}" class="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden ${cardClass}">
            <img src="/${thumb}" alt="${postInfo.title}" class="${imgClass}">
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex gap-2 mb-2">${categoryHtml}</div>
                <h2 class="text-xl font-bold mb-2 text-gray-800 flex-grow">${postInfo.title}</h2>
                ${index === 0 ? `<p class="text-gray-600 mb-4">${postInfo.description || ''}</p>` : ''}
                <div class="flex items-center text-sm text-gray-500 mt-auto">
                    <img src="/${author.img}" alt="${author.username}" class="w-8 h-8 rounded-full mr-3">
                    <span>${author.username}</span>
                    <span class="mx-2">•</span>
                    <span>${formatDate(postInfo.date)}</span>
                </div>
            </div>
        </a>
    `;
}


async function build() {
    console.log('🚀 빌드를 시작합니다...');

    // 1. dist 폴더 초기화
    await fs.emptyDir(DIST_DIR);
    console.log('- dist 폴더를 초기화했습니다.');

    // 2. 정적 에셋 복사
    for (const dir of ASSETS_DIR) {
        await fs.copy(path.join(CWD, dir), path.join(DIST_DIR, dir));
    }
    console.log('- 에셋 파일들을 복사했습니다.');

    const menuHtml = generateMenuHtml();

    // 3. 블로그 게시물 페이지 생성
    const blogPostDir = path.join(DIST_DIR, 'blog');
    await fs.ensureDir(blogPostDir);

    // blogList에 id 부여
    const processedBlogList = blogList.map((post, index) => ({ ...post, id: index + 1 }));

    for (const post of processedBlogList) {
        const mdContent = await fs.readFile(path.join(BLOG_DIR, post.name), 'utf-8');
        const contentHtml = marked(mdContent);
        
        let finalHtml = postTemplate
            .replace('<!-- PAGE_TITLE -->', `${post.title} | ${config.siteConfig.blogTitle}`)
            .replace('<!-- BLOG_TITLE -->', config.siteConfig.blogTitle)
            .replace('<!-- MENU_PLACEHOLDER -->', menuHtml)
            .replace('<!-- POST_CONTENT_PLACEHOLDER -->', contentHtml);
        
        await fs.writeFile(path.join(blogPostDir, `${post.id}.html`), finalHtml);
    }
    console.log(`- ${processedBlogList.length}개의 블로그 게시물을 생성했습니다.`);

    // 4. 메뉴 페이지 생성
    for (const menu of blogMenu) {
        if (menu.name === 'blog.md') continue; // 블로그는 index.html로 처리

        const menuName = menu.name.split('.')[0];
        const mdContent = await fs.readFile(path.join(MENU_DIR, menu.name), 'utf-8');
        const contentHtml = marked(mdContent);

        let finalHtml = postTemplate
            .replace('<!-- PAGE_TITLE -->', `${menuName} | ${config.siteConfig.blogTitle}`)
            .replace('<!-- BLOG_TITLE -->', config.siteConfig.blogTitle)
            .replace('<!-- MENU_PLACEHOLDER -->', menuHtml)
            .replace('<!-- POST_CONTENT_PLACEHOLDER -->', contentHtml);
            
        await fs.writeFile(path.join(DIST_DIR, `${menuName}.html`), finalHtml);
    }
    console.log(`- ${blogMenu.length - 1}개의 메뉴 페이지를 생성했습니다.`);


    // 5. 메인 index.html 생성 (dynamic rendering을 위해 root의 index.html을 그대로 복사/작성합니다)
    const indexHtml = await fs.readFile(path.join(CWD, 'index.html'), 'utf-8');
    await fs.writeFile(path.join(DIST_DIR, 'index.html'), indexHtml);
    console.log('- 메인 index.html 페이지를 생성(복사)했습니다.');

    console.log('✅ 빌드가 완료되었습니다! `dist` 폴더를 확인하세요.');
}

build();