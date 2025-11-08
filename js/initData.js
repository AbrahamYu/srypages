// GitHub API를 사용하여 폴더 내의 파일 목록 가져오기 (스키마 및 url 참고)
// https://api.github.com/repos/paullabkorea/github_blog/contents/menu
// https://api.github.com/repos/paullabkorea/github_blog/contents/blog
let blogList = [];
let blogMenu = [];
let isInitData = false;

async function initDataBlogList() {
    /*
    blogList를 초기화 하기 위한 함수
    if 로컬이라면 blogList = /data/local_blogList.json 데이터 할당
    else if 배포상태이면 blogList = GitHub에 API 데이터 할당
    */
    if (blogList.length > 0) {
        // blogList 데이터가 이미 있을 경우 다시 로딩하지 않기 위함(API 호출 최소화)
        return blogList;
    }

    // 데이터 초기화를 한 번 했다는 것을 알리기 위한 변수
    isInitData = true;

    let rawBlogList = [];

    if (isLocal) {
        // 로컬 환경
        const response = await fetch(
            url.origin + "/data/local_blogList.json"
        );
        rawBlogList = await response.json();
    } else {
        // GitHub 배포 상태
        // 만약 siteConfig.username이 비어있거나 siteConfig.repositoryName이 비어 있다면 해당 값을 지정하여 시작
        // config에서 값이 없을 경우 URL에서 추출
        if (!siteConfig.username || !siteConfig.repositoryName) {
            const urlConfig = extractFromUrl();
            siteConfig.username = siteConfig.username || urlConfig.username;
            siteConfig.repositoryName =
                siteConfig.repositoryName || urlConfig.repositoryName;
        }

        let response;

        // 배포 상태에서 GitHub API를 사용(이용자가 적을 때)
        if (!localDataUsing) {
            response = await fetch(
                `https://api.github.com/repos/${siteConfig.username}/${siteConfig.repositoryName}/contents/blog`
            );
        } else {
            // 배포 상태에서 Local data를 사용(이용자가 많을 때)
            response = await fetch(
                url.origin + `/${siteConfig.repositoryName}/data/local_blogList.json`
            );
        }
        rawBlogList = await response.json();
    }

    // 파일 이름에서 추가 정보를 추출하고, 기존 메타데이터와 결합합니다.
    blogList = rawBlogList.map(post => {
        const regex = /^\[(\d{8})\]_\[(.*?)\]\.(md|ipynb)$/;
        const matches = post.name.match(regex);

        if (matches) {
            return {
                // From filename
                date: matches[1],
                title: matches[2],
                fileType: matches[3],
                // From original JSON object
                name: post.name,
                download_url: post.download_url,
                category: post.category || [],
                thumbnail: post.thumnail ? "img/" + post.thumnail : `img/thumb${Math.floor(Math.random() * 10) + 1}.webp`,
                description: post.description,
                author: post.author ? parseInt(post.author) : 0,
            };
        }
        return null; // 정규식에 맞지 않는 파일은 제외
    }).filter(Boolean); // null 항목 제거

    // 날짜를 기준으로 최신순으로 정렬
    blogList.sort(function (a, b) {
        return b.date.localeCompare(a.date);
    });
    
    return blogList;
}

async function initDataBlogMenu() {
    if (blogMenu.length > 0) {
        // blogMenu 데이터가 이미 있을 경우(API 호출 최소화)
        return blogMenu;
    }

    if (isLocal) {
        // 로컬환경
        const response = await fetch(
            url.origin + "/data/local_blogMenu.json"
        );
        blogMenu = await response.json();
    } else {
        // GitHub 배포 상태
        // 만약 siteConfig.username이 비어있거나 siteConfig.repositoryName이 비어 있다면 해당 값을 지정하여 시작
        // config에서 값이 없을 경우 URL에서 추출
        if (!siteConfig.username || !siteConfig.repositoryName) {
            const urlConfig = extractFromUrl();
            siteConfig.username = siteConfig.username || urlConfig.username;
            siteConfig.repositoryName =
                siteConfig.repositoryName || urlConfig.repositoryName;
        }

        let response;

        // 배포 상태에서 GitHub API를 사용(이용자가 적을 때)
        if (!localDataUsing) {
            response = await fetch(
                `https://api.github.com/repos/${siteConfig.username}/${siteConfig.repositoryName}/contents/menu`
            );
        } else {
            // 배포 상태에서 Local data를 사용(이용자가 많을 때)
            response = await fetch(
                url.origin + `/${siteConfig.repositoryName}/data/local_blogMenu.json`
            );
        }
        blogMenu = await response.json();
    }
    return blogMenu;
}
