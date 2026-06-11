const siteConfig = {
  username: "AbrahamYoo", // GitHub 사용자 이름
  repositoryName: "srypages", // GitHub 저장소 이름
  mainColor: "#6366f1", // 사이트의 주 색상 (Indigo-500)
  textColor: "#e2e8f0", // 기본 텍스트 색상 (Slate-200)
  blogTitle: "Abraham.dev", // 포트폴리오 제목
};

// 여러명의 저자가 글을 쓸 경우 프로필 설정, default는 0번째 사용자
// 저자는 파일에서 숫자로 사용해야 함
const users = [
  {
    id: 0, // default author
    username: "Abraham Yoo",
    company: "Freelance",
    position: "Back-End Engineer",
    img: "img/user/profile-licat.png",
  },
];

const localDataUsing = true; // 로컬 데이터 사용 여부
/*
localDataUsing는 아직 사용하는 데이터가 아닙니다.
1. false일 경우에도 로컬에서 live server(127.0.0.1)를 사용하면 local 데이터를 사용합니다.
2. true일 경우 local 데이터를 사용합니다 접속자가 많을 경우 true 변경하고 local 데이터를 작성하고 사용하시길 권합니다.
*/

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { siteConfig, users, localDataUsing };
}



