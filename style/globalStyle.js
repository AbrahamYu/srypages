// menu style (Neo-minimalism, sleek zinc colors)
const menuListStyle = `text-sm font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-md transition-colors duration-200 capitalize`;

// mobile menu style
const mobileMenuStyle = `block py-3 px-5 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200`;

// blog style과 notebook style (Vercel-like Premium Read Mode)
const posth1Style = `text-3xl md:text-5xl font-black text-white mb-6 mt-12 tracking-tighter`;
const posth2Style = `text-xl md:text-2xl font-bold text-white mb-4 mt-10 tracking-tight border-b border-zinc-900 pb-2`;
const posth3Style = `text-lg md:text-xl font-semibold text-zinc-100 mb-3 mt-8 tracking-tight`;
const posth4Style = `text-base md:text-lg font-semibold text-zinc-200 mb-2 mt-6`;
const posth5Style = `text-sm md:text-base font-medium text-zinc-300 mb-2 mt-4`;
const posth6Style = `text-xs md:text-sm font-medium text-zinc-400 mb-2 mt-4`;

const postpStyle = `text-base md:text-lg my-6 font-normal leading-relaxed text-zinc-300 tracking-normal text-justify`;
const postimgStyle = `border border-zinc-900 rounded-lg my-8 mx-auto block max-w-full h-auto shadow-2xl`;
const postaStyle = `text-white hover:text-zinc-300 underline underline-offset-4 transition-colors duration-200`;

const postulStyle = `list-disc list-inside text-base md:text-lg font-normal leading-relaxed text-zinc-300 tracking-normal text-justify mb-5 pl-1 space-y-2`;
const postolStyle = `list-decimal list-inside text-base md:text-lg font-normal leading-relaxed text-zinc-300 tracking-normal text-justify mb-5 pl-1 space-y-2`;
const postliStyle = `pl-1 text-zinc-300`;

const postblockquoteStyle = `border-l-2 border-white bg-zinc-950 pl-5 pr-4 py-3 text-zinc-400 italic my-6 text-sm`;
const postpreStyle = `relative bg-zinc-950 p-5 rounded-lg border border-zinc-900 mb-6 text-sm font-mono overflow-auto whitespace-pre text-left max-w-full h-auto align-middle text-zinc-200`;
const postcodeStyle = `font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300`;

const posttableStyle = `table-auto w-full border-collapse mb-8 h-auto align-middle text-left border border-zinc-900 text-sm`;
const posttheadStyle = `text-left bg-zinc-900/50`;
const postthStyle = `border-b border-zinc-900 px-4 py-3 font-semibold tracking-tight text-zinc-300`;
const posttbodyStyle = `text-left divide-y divide-zinc-900`;
const posttdStyle = `px-4 py-3 text-zinc-400 break-keep`;

const posthrStyle = `my-10 border-zinc-900`;
const postemStyle = `text-base md:text-lg font-medium italic pr-0.5 text-zinc-200`;
const poststrongStyle = `text-base md:text-lg font-bold text-white`;

// blog에 최상단 제목과 이미지 날짜 카테고리를 표시하는 부분
const postcategoryStyle = `bg-zinc-900 text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded border border-zinc-800 transition-colors hover:bg-zinc-800`;
const posttitleStyle = `text-3xl md:text-6xl leading-none font-black text-white my-4 tracking-tighter`;

const postauthordateDivStyle = `flex items-center gap-4 border-b border-zinc-900 pb-5 mb-8 text-xs text-zinc-500`;
const postauthorDivStyle = `flex items-center`;
const postauthorImgStyle = `w-8 h-8 rounded-full object-cover object-center mr-2 border border-zinc-800 overflow-hidden`;
const postauthorStyle = `font-semibold text-zinc-300`;
const postdateStyle = `text-zinc-500 font-normal`;
const postimgtitleStyle = `w-full max-h-[400px] object-cover object-center my-6 rounded-lg mx-auto block max-w-full align-middle border border-zinc-900`;
const postsectionStyle = `w-full mb-10 max-w-full h-auto align-middle`;

// notebook에 code cell을 표시하는 부분
const notebookpreStyle = `relative bg-zinc-950 p-6 rounded-lg border border-zinc-900 mb-6 text-sm font-mono overflow-auto whitespace-pre text-left max-w-full h-auto align-middle text-zinc-200`;
const notebookcodeStyle = `font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300`;
const notebookcopyButtonStyle = `copy-button bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded absolute top-4 right-4 p-1.5 transition-colors border border-zinc-800`;
const notebookdownloadButtonStyle = `download-button px-4 py-2 mb-4 text-xs font-semibold text-white bg-white hover:bg-zinc-200 rounded transition-colors text-black`;

// bloglist 목록 스타일 (Vercel-style Clean Grid List)
const bloglistFirstCardStyle = `lg:col-span-3 md:col-span-2 col-span-1 border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-950 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700 flex md:flex-row flex-col flex-1 mb-5 cursor-pointer group`;
const bloglistFirstCardImgStyle = `w-full object-cover object-center md:h-auto h-[200px] md:w-[40%] shrink-0 transition-opacity duration-300 group-hover:opacity-90`;
const bloglistFirstCardDescriptionStyle = `text-zinc-400 text-sm font-normal leading-relaxed line-clamp-3 mb-4`;

const bloglistCardStyle = `border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-950 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700 cursor-pointer col-span-1 w-auto group`;
const bloglistCardImgStyle = `w-full h-[180px] object-cover object-center transition-opacity duration-300 group-hover:opacity-90`;

const bloglistCardBodyStyle = `p-6 flex flex-col justify-between h-full`;
const bloglistCardTitleStyle = `font-bold text-lg text-white mb-2 group-hover:text-zinc-300 transition-colors tracking-tight line-clamp-2`;
const bloglistCardCategoryStyle = `inline-block bg-zinc-900 text-zinc-400 text-[10px] font-bold tracking-wider uppercase mb-3 px-2 py-0.5 rounded border border-zinc-800`;
const bloglistCardDescriptionStyle = `text-zinc-400 text-xs font-normal leading-relaxed h-10 line-clamp-2 mb-4`;
const bloglistCardAuthorDivStyle = `flex items-center`;
const bloglistCardAuthorImgStyle = `w-6 h-6 rounded-full object-cover object-center mr-2 border border-zinc-900 overflow-hidden`;
const bloglistCardAuthorStyle = `text-[11px] font-semibold text-zinc-300 mr-2`;
const bloglistCardDateStyle = `text-[11px] text-zinc-500 font-normal ml-auto`;

// 검색창 스타일
const searchInputStyle = `w-full md:w-[240px] h-9 bg-zinc-950 border border-zinc-900 rounded px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors`;

// category 스타일
const categoryContainerStyle = `flex flex-wrap gap-1.5 w-full mb-8`;
const categoryItemStyle = `text-xs font-medium px-2.5 py-1 rounded bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1`;
const categoryItemCountStyle = `text-[10px] bg-zinc-900 text-zinc-500 font-semibold px-1 py-0.2 rounded border border-zinc-800`;

// paginationStyle
const paginationStyle = `mt-12 mb-20 flex justify-center items-center gap-1.5`;
const pageMoveButtonStyle = `relative flex inline-flex items-center rounded p-2 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`;
const pageNumberListStyle = `flex items-center gap-1`;
const pageNumberStyle = `relative inline-flex items-center justify-center w-8 h-8 rounded text-xs font-medium text-zinc-400 hover:text-white border border-transparent hover:border-zinc-900 transition-colors cursor-pointer`;
const pageNumberActiveStyle = `bg-zinc-900 border-zinc-800 text-white font-bold`;
