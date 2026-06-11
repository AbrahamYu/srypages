// menu style
const menuListStyle = `md:ml-10 text-sm font-semibold tracking-wide text-gray-300 hover:text-white hover:bg-slate-800/50 px-4 py-2 rounded-lg transition-all duration-300 capitalize`;

// mobile menu style
const mobileMenuStyle = `m-0 block py-4 px-6 text-gray-300 hover:text-white hover:bg-slate-800/80 transition-all duration-300`;

// blog style과 notebook style (다크 모드에 최적화된 모던 레이아웃)
const posth1Style = `text-3xl md:text-4xl font-extrabold text-white mb-6 mt-8 border-b border-slate-800 pb-3 tracking-tight`;
const posth2Style = `text-2xl md:text-3xl font-bold text-white mb-4 mt-8 border-b border-slate-800 pb-2.5 tracking-tight`;
const posth3Style = `text-xl md:text-2xl font-bold text-gray-100 mb-4 mt-6 tracking-tight`;
const posth4Style = `text-lg md:text-xl font-bold text-gray-200 mb-3 mt-5`;
const posth5Style = `text-base md:text-lg font-bold text-gray-300 mb-2 mt-4`;
const posth6Style = `text-sm md:text-base font-bold text-gray-400 mb-2 mt-4`;

const postpStyle = `text-base md:text-lg my-5 font-normal leading-relaxed text-gray-300 tracking-wide text-justify`;
const postimgStyle = `border border-slate-800 rounded-2xl my-8 mx-auto block max-w-full h-auto shadow-2xl`;
const postaStyle = `text-indigo-400 hover:text-indigo-300 underline transition-colors duration-200`;

const postulStyle = `list-disc list-inside text-base md:text-lg font-normal leading-relaxed text-gray-300 tracking-wide text-justify mb-4 pl-2`;
const postolStyle = `list-decimal list-inside text-base md:text-lg font-normal leading-relaxed text-gray-300 tracking-wide text-justify mb-4 pl-2`;
const postliStyle = `pl-2 mb-2 leading-relaxed tracking-wide text-justify text-gray-300`;

const postblockquoteStyle = `border-l-4 border-indigo-500 bg-slate-900/60 pl-5 pr-4 py-3 rounded-r-xl text-gray-400 italic font-medium my-6`;
const postpreStyle = `relative bg-slate-950/80 p-5 rounded-2xl border border-slate-800 mb-6 text-sm font-mono overflow-auto whitespace-pre-wrap break-words text-left max-w-full h-auto align-middle shadow-inner text-indigo-200`;
const postcodeStyle = `font-mono text-sm bg-transparent text-indigo-300`;

const posttableStyle = `table-auto w-full border-collapse mb-8 h-auto align-middle text-left border border-slate-800 rounded-xl overflow-hidden`;
const posttheadStyle = `text-left bg-slate-900/80`;
const postthStyle = `overflow-auto border-b border-slate-800 px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-300`;
const posttbodyStyle = `text-left divide-y divide-slate-800/40`;
const posttdStyle = `px-5 py-3.5 text-sm text-gray-400 break-keep`;

const posthrStyle = `my-8 border-slate-800`;
const postemStyle = `text-base md:text-lg font-medium italic pr-0.5 text-indigo-300`;
const poststrongStyle = `text-base md:text-lg font-bold text-white`;

// blog에 최상단 제목과 이미지 날짜 카테고리를 표시하는 부분
const postcategoryStyle = `bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white`;
const posttitleStyle = `text-3xl md:text-5xl leading-tight font-extrabold text-white my-4 tracking-tight`;

const postauthordateDivStyle = `flex items-center gap-4 border-b border-slate-800 pb-6 mb-8`;
const postauthorDivStyle = `flex items-center`;
const postauthorImgStyle = `w-10 h-10 rounded-full object-cover object-center mr-3 border-2 border-indigo-500/30 overflow-hidden`;
const postauthorStyle = `text-sm font-semibold text-gray-200`;
const postdateStyle = `text-slate-500 text-sm font-normal`;
const postimgtitleStyle = `w-full max-h-[480px] object-cover object-center my-6 rounded-2xl mx-auto block max-w-full align-middle border border-slate-800 shadow-2xl`;
const postsectionStyle = `w-full mb-10 md:mb-[60px] max-w-full h-auto align-middle`;

// notebook에 code cell을 표시하는 부분
const notebookpreStyle = `relative bg-slate-950/80 p-6 rounded-2xl border border-slate-800 mb-6 text-sm font-mono overflow-auto whitespace-pre-wrap break-words text-left max-w-full h-auto align-middle shadow-inner text-indigo-200`;
const notebookcodeStyle = `font-mono text-sm bg-transparent text-indigo-300`;
const notebookcopyButtonStyle = `copy-button bg-slate-800/80 hover:bg-slate-700 text-gray-300 rounded-lg absolute top-4 right-4 p-2 transition-all duration-200 border border-slate-700`;
const notebookdownloadButtonStyle = `download-button px-5 py-[11px] mb-4 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20`;

// bloglist 목록 스타일 (포트폴리오 카드 디자인)
const bloglistFirstCardStyle = `lg:col-span-3 md:col-span-2 col-span-1 h-auto rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/80 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 flex md:flex-row flex-col flex-1 md:mb-[20px] cursor-pointer group`;
const bloglistFirstCardImgStyle = `w-full object-cover object-center md:h-auto h-[220px] md:w-[45%] lg:w-[50%] shrink-0 transition-transform duration-500 group-hover:scale-102`;
const bloglistFirstCardDescriptionStyle = `text-gray-400 text-sm md:text-base font-normal leading-relaxed md:max-h-36 md:line-clamp-[5] line-clamp-3 mb-4`;

const bloglistCardStyle = `bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer col-span-1 w-auto group`;
const bloglistCardImgStyle = `w-full h-[200px] object-cover object-center transition-transform duration-500 group-hover:scale-102`;

const bloglistCardBodyStyle = `p-6 flex flex-col justify-between h-fit`;
const bloglistCardTitleStyle = `font-bold text-xl text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2`;
const bloglistCardCategoryStyle = `inline-block bg-indigo-500/10 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/20 transition-all duration-200 hover:bg-indigo-500 hover:text-white`;
const bloglistCardDescriptionStyle = `text-gray-400 text-sm font-normal leading-relaxed h-12 line-clamp-2 mb-4`;
const bloglistCardAuthorDivStyle = `flex items-center`;
const bloglistCardAuthorImgStyle = `w-7 h-7 rounded-full object-cover object-center mr-2 border border-slate-800 overflow-hidden`;
const bloglistCardAuthorStyle = `text-xs font-medium text-gray-300 mr-2`;
const bloglistCardDateStyle = `text-xs text-slate-500 font-normal ml-auto`;

// 검색창 스타일
const searchInputStyle = `w-full md:w-[280px] h-11 bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 text-sm font-medium text-gray-200 placeholder-slate-500 focus:placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 shadow-inner`;

// category 스타일
const categoryContainerStyle = `flex flex-wrap gap-2 w-full mb-8`;
const categoryItemStyle = `text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-300 transition-all duration-300 cursor-pointer flex items-center gap-1.5`;
const categoryItemCountStyle = `text-[10px] bg-slate-800/80 text-gray-500 font-semibold px-1.5 py-0.5 rounded-md border border-slate-700/50`;

// paginationStyle
const paginationStyle = `mt-16 mb-24 flex justify-center items-center gap-2`;
const pageMoveButtonStyle = `relative flex inline-flex items-center rounded-xl p-3 text-gray-400 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-200 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-slate-800/80 disabled:cursor-not-allowed`;
const pageNumberListStyle = `flex items-center gap-1`;
const pageNumberStyle = `relative inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-semibold text-gray-400 hover:text-white border border-transparent hover:border-slate-800 transition-all duration-200 cursor-pointer`;
const pageNumberActiveStyle = `bg-indigo-600/20 border-indigo-500/40 text-indigo-300 font-bold hover:bg-indigo-600/30 hover:border-indigo-500/50`;
