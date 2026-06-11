import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

// --- Static Data ---
const PROFILE_DATA = {
  name: 'Abraham Yoo (유승영)',
  role: 'Backend Software Engineer',
  email: 'yoo@abraham.dev',
  github: 'github.com/AbrahamYoo',
  bio: [
    '실무와 데이터 흐름의 정합성을 최우선으로 생각하는 백엔드 개발자입니다.',
    '대용량 데이터 파이프라인 설계 및 고성능 REST API 개발에 특화되어 있습니다.',
    '모놀리식 아키텍처의 마이크로서비스 마이그레이션 및 인프라 최적화 경험을 보유하고 있습니다.'
  ]
};

const SKILLS_DATA = [
  { category: 'LANGUAGES', items: [
    { name: 'JavaScript / TypeScript', score: 90, bar: '██████████████░' },
    { name: 'Go', score: 50, bar: '████████░░░░░░░' },
    { name: 'SQL (MariaDB / PostgreSQL)', score: 80, bar: '████████████░░░' }
  ]},
  { category: 'BACKEND & STORAGE', items: [
    { name: 'Node.js (Express / Fastify)', score: 90, bar: '██████████████░' },
    { name: 'PostgreSQL / MySQL / MariaDB', score: 80, bar: '████████████░░░' },
    { name: 'MongoDB / Redis', score: 70, bar: '██████████░░░░░' }
  ]},
  { category: 'INFRA & DEVOPS', items: [
    { name: 'Docker / Docker Compose', score: 80, bar: '████████████░░░' },
    { name: 'Nginx (Reverse Proxy)', score: 70, bar: '██████████░░░░░' },
    { name: 'AWS (EC2 / S3 / RDS / VPC)', score: 70, bar: '██████████░░░░░' },
    { name: 'Linux Shell Scripting', score: 70, bar: '██████████░░░░░' }
  ]}
];

const PROJECTS_DATA = [
  {
    id: 1,
    title: 'K-water 백엽상 연동 및 PLC 데이터 수집 시스템',
    tag: 'IoT Ingest & Monitoring',
    problem: '야외 산업 현장에서 체감온도 상승으로 인한 노동자 온열질환 위험에 대응하기 위해 현장 PLC 센서 정보와 기상청의 정확한 체감온도 데이터를 결합한 신속한 전파 체계가 요구됨.',
    solution: '현장의 PLC 수집 모듈을 수립하고 기상청의 공공 API 스케줄러 수집 핸들러를 Node.js로 작성해 매칭시켰으며, 실시간 체감온도를 연산해 초과 시 알림 경보를 쏘는 가벼운 서버 데몬을 제작했습니다.',
    role: '데이터 수집 파이프라인 모델링 및 API 통합 핸들러 설계 단독 개발. Node.js, Express, 기상청 API Scheduler, SQL DB.'
  },
  {
    id: 2,
    title: 'Legacy Migration - 게임 공식 웹서비스 및 운영 관리자 API 개편',
    tag: 'API Server & Auth System',
    problem: 'PHP 기반으로 조잡하게 작성된 노후 게임 웹 서비스의 속도 지연 및 락(Lock) 이슈를 극복하고, 관리자들의 원활한 대시보드 통계 및 유저 데이터 롤백 기능을 위해 백엔드 이전이 필요함.',
    solution: 'PHP 코드를 비동기 Node.js/Express 아키텍처로 전면 마이그레이션했습니다. 매출 통계, 유저 로그 대용량 쿼리를 SQL 인덱싱 튜닝 및 커서 페이지네이션으로 처리해 모니터링 응답성을 대폭 개선했습니다.',
    role: '회원/아이템/매출 조회 미들웨어 개발, SQL 쿼리 최적화, 관리자 권한 미들웨어 단독 설계. Node.js, MariaDB, JWT Auth.'
  },
  {
    id: 3,
    title: 'E-commerce Backend - 주문 결제 거래 처리 및 백오피스 최적화',
    tag: 'Transaction & API Optimization',
    problem: '결제 요청이 집중되는 이벤트 기간 시 주문 및 상품 수량 데이터 정합성이 어긋나거나, 결제 실패 시 수동 복구에 많은 운영 공수가 소요됨.',
    solution: 'DB 트랜잭션 격리수준을 설정하고 Redis 캐싱을 통한 재고 검증을 우선 적용해 동시성 충돌을 차단했습니다. 외부 결제 대행사(PG) 웹훅(Webhook)의 장애 시 멱등성을 보장하는 재시도 큐를 작성했습니다.',
    role: '결제 모듈 데이터 흐름 통합 설계 및 DB 락 프로세스 튜닝. Node.js, MariaDB Transaction, Redis, PG webhook.'
  },
  {
    id: 4,
    title: 'Educational Operations - 국어 논술 운영 시스템 통계 및 관리 API 설계',
    tag: 'Statistics & Management API',
    problem: '학생의 논술 답안 통계 및 성적 리포트를 출력하는 데 있어, 학생과 학원 관리자가 많아짐에 따라 대량 데이터 집계 쿼리로 인해 대시보드가 멈추는 프리징 현상이 잦아짐.',
    solution: '스케줄러와 메모리 DB를 이용해 전날까지의 성적 통계 데이터를 미리 집계하는 머티리얼라이즈드 뷰(Materialized View) 개념의 캐시 테이블 구조를 구현하여 쿼리를 고속화했습니다.',
    role: '통계 알고리즘 집계 모듈 작성 및 외부 데이터 동기화 어댑터 구현. Node.js, Express, MariaDB, Pre-calculation Scheduler.'
  }
];

// --- Theme Mapping ---
const THEME_STYLES = {
  green: {
    textColor: 'text-green-500',
    borderColor: 'border-green-800',
    bgBadge: 'bg-green-950/40',
    glowClass: 'glow-green',
    shadowClass: 'shadow-terminal-green',
    hex: '#22c55e',
    inputTextColor: 'text-green-400',
    caretColor: 'bg-green-500'
  },
  amber: {
    textColor: 'text-amber-500',
    borderColor: 'border-amber-800',
    bgBadge: 'bg-amber-950/40',
    glowClass: 'glow-amber',
    shadowClass: 'shadow-terminal-amber',
    hex: '#f59e0b',
    inputTextColor: 'text-amber-400',
    caretColor: 'bg-amber-500'
  },
  cyan: {
    textColor: 'text-cyan-500',
    borderColor: 'border-cyan-800',
    bgBadge: 'bg-cyan-950/40',
    glowClass: 'glow-cyan',
    shadowClass: 'shadow-terminal-cyan',
    hex: '#06b6d4',
    inputTextColor: 'text-cyan-400',
    caretColor: 'bg-cyan-500'
  }
};

// --- Matrix Rain Canvas ---
function MatrixRain({ themeHex, active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&';
    const alphabet = katakana.split('');

    const fontSize = 14;
    let columns = canvas.width / fontSize;

    let rainDrops = Array.from({ length: Math.ceil(columns) }).map(() => 1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = themeHex;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;

        // Brightest highlight at the head of the drop
        if (Math.random() > 0.95) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = themeHex;
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [themeHex, active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 opacity-[0.08] pointer-events-none z-0" />;
}

// --- Main App Component ---
export default function App() {
  const [theme, setTheme] = useState('green'); // green, amber, cyan
  const [matrixActive, setMatrixActive] = useState(true);
  const [isBooted, setIsBooted] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  
  // CLI States
  const [history, setHistory] = useState([
    { text: '==================================================', type: 'system' },
    { text: '   ABRAHAM BACKEND OS (Version 3.2.1-RELEASE)      ', type: 'system' },
    { text: '   Type "help" to view the available commands.     ', type: 'system' },
    { text: '==================================================', type: 'system' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdIndex, setCmdIndex] = useState(-1);
  
  // Blog data fetch
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postMarkdown, setPostMarkdown] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);
  
  // Mode controls: 'terminal' | 'snake' | 'reader'
  const [mode, setMode] = useState('terminal');

  // Input ref to keep focus
  const terminalInputRef = useRef(null);
  const outputEndRef = useRef(null);

  const style = THEME_STYLES[theme];

  // Boot Sequence animation simulator
  useEffect(() => {
    const bootSequence = [
      'AMIBIOS (C) 2026 American Megatrends, Inc.',
      'ABRAHAM BIOS Version 1.0.42.06',
      'CPU: Intel(R) Core(TM) i9 CPU @ 3.40GHz',
      'Memory Test: 655360KB OK',
      'Detecting storage devices... Done.',
      'Mounting virtual filesystem /dev/sda1... OK',
      'Fetching blog data cache (/data/local_blogList.json)...',
      'Parsing local posts database metadata... SUCCESS',
      'Loading core system protocols... OK',
      'Establishing TLS tunnel to yoo@abraham.dev... OK',
      'Terminal Shell Initialization Sequence Complete.',
      'READY.'
    ];

    let currentLineIndex = 0;
    const timer = setInterval(() => {
      if (currentLineIndex < bootSequence.length) {
        setBootLines((prev) => [...prev, bootSequence[currentLineIndex]]);
        currentLineIndex++;
      } else {
        clearInterval(timer);
        setIsBooted(true);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // Fetch blog posts on launch
  useEffect(() => {
    fetch('/data/local_blogList.json')
      .then((res) => {
        if (!res.ok) throw new Error('Blog database link offline.');
        return res.json();
      })
      .then((data) => {
        const processed = data.map((item, index) => ({
          ...item,
          id: index + 1,
          date: item.name.substring(1, 9) || '20260101'
        }));
        setBlogPosts(processed);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Auto Scroll to bottom when history updates
  useEffect(() => {
    if (outputEndRef.current && mode === 'terminal') {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, mode]);

  // Keep focus on hidden input
  const focusInput = () => {
    if (terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (isBooted && mode === 'terminal') {
      focusInput();
    }
  }, [isBooted, mode]);

  // Tab Completion Helper
  const handleKeyDown = (e) => {
    const commands = ['help', 'about', 'tech', 'projects', 'blog', 'calc', 'game', 'theme', 'matrix', 'clear'];
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const match = commands.find(cmd => cmd.startsWith(inputValue.trim().toLowerCase()));
      if (match) {
        setInputValue(match);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = cmdIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdIndex - 1);
      setCmdIndex(nextIndex);
      setInputValue(cmdHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIndex === -1) return;
      if (cmdIndex === cmdHistory.length - 1) {
        setCmdIndex(-1);
        setInputValue('');
      } else {
        const nextIndex = cmdIndex + 1;
        setCmdIndex(nextIndex);
        setInputValue(cmdHistory[nextIndex]);
      }
    }
  };

  // Run a single command
  const executeCommand = (cmdText) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // Record into history
    setCmdHistory((prev) => [...prev, trimmed]);
    setCmdIndex(-1);

    const parts = trimmed.split(/\s+/);
    const primary = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output = [];

    switch (primary) {
      case 'help':
      case '?':
        output = [
          { text: `> ${trimmed}`, type: 'input' },
          { text: 'Available commands:', type: 'system' },
          { text: '  about        Show profile biography', type: 'output' },
          { text: '  tech         Display backend skill matrix', type: 'output' },
          { text: '  projects     List core server projects. Use "projects <id>" to view details', type: 'output' },
          { text: '  blog         Show tech article list. Use "blog <id>" to read', type: 'output' },
          { text: '  calc         Calculator toolkit. Usage:', type: 'output' },
          { text: '               calc percent <val> <pct>  - Percent calculation', type: 'output' },
          { text: '               calc unit <val> <from> <to> - Byte data converter', type: 'output' },
          { text: '               calc sql <rows> [index]    - Query CPU cost estimator', type: 'output' },
          { text: '  game         Launch integrated text-mode arcade Snake game', type: 'output' },
          { text: '  theme <c>    Switch style theme: green | amber | cyan', type: 'output' },
          { text: '  matrix       Toggle Matrix digital rain background state', type: 'output' },
          { text: '  clear / cls  Wipe the console screen buffer', type: 'output' },
        ];
        break;

      case 'about':
      case 'whoami':
        output = [
          { text: `> ${trimmed}`, type: 'input' },
          { text: '--------------------------------------------------', type: 'system' },
          { text: `[NAME]  ${PROFILE_DATA.name}`, type: 'output' },
          { text: `[ROLE]  ${PROFILE_DATA.role}`, type: 'output' },
          { text: `[EMAIL] ${PROFILE_DATA.email}`, type: 'output' },
          { text: `[GIT]   ${PROFILE_DATA.github}`, type: 'output' },
          { text: '--------------------------------------------------', type: 'system' },
          ...PROFILE_DATA.bio.map(line => ({ text: line, type: 'output' }))
        ];
        break;

      case 'tech':
      case 'skills':
        output = [
          { text: `> ${trimmed}`, type: 'input' },
          { text: '<<< CORE BACKEND SKILL TELEMETRY >>>', type: 'system' }
        ];
        SKILLS_DATA.forEach(group => {
          output.push({ text: `\n[${group.category}]`, type: 'system' });
          group.items.forEach(skill => {
            const spaces = ' '.repeat(Math.max(1, 28 - skill.name.length));
            output.push({ text: `  ${skill.name}${spaces}${skill.bar} (${skill.score}%)`, type: 'output' });
          });
        });
        break;

      case 'projects':
      case 'work':
        if (args.length > 0) {
          const id = parseInt(args[0]);
          const project = PROJECTS_DATA.find(p => p.id === id);
          if (project) {
            output = [
              { text: `> ${trimmed}`, type: 'input' },
              { text: `\nPROJECT #${project.id}: ${project.title}`, type: 'success' },
              { text: `[Classification] ${project.tag}`, type: 'system' },
              { text: `\n[PROBLEM]`, type: 'system' },
              { text: `  ${project.problem}`, type: 'output' },
              { text: `\n[SOLUTION]`, type: 'system' },
              { text: `  ${project.solution}`, type: 'output' },
              { text: `\n[ROLE & TECH]`, type: 'system' },
              { text: `  ${project.role}`, type: 'output' },
            ];
          } else {
            output = [
              { text: `> ${trimmed}`, type: 'input' },
              { text: `Error: Project ID "${args[0]}" not found. Available IDs: 1 to 4.`, type: 'error' }
            ];
          }
        } else {
          output = [
            { text: `> ${trimmed}`, type: 'input' },
            { text: '--------------------------------------------------', type: 'system' },
            { text: 'ID   Classification               Project Title', type: 'system' },
            { text: '--------------------------------------------------', type: 'system' },
            ...PROJECTS_DATA.map(p => ({
              text: `${p.id}    [${p.tag.padEnd(26).substring(0, 26)}] ${p.title}`,
              type: 'output'
            })),
            { text: '\nType "projects <id>" to view full technical case study logs.', type: 'system' }
          ];
        }
        break;

      case 'blog':
        if (args.length > 0) {
          const target = args[0];
          const id = parseInt(target);
          const post = blogPosts.find(p => p.id === id || p.name.includes(target));
          if (post) {
            // Load Post via Reader Mode
            output = [{ text: `> ${trimmed}`, type: 'input' }, { text: `Loading post content: "${post.title}"...`, type: 'system' }];
            loadBlogPost(post);
          } else {
            output = [
              { text: `> ${trimmed}`, type: 'input' },
              { text: `Error: Post "${target}" could not be matched.`, type: 'error' }
            ];
          }
        } else {
          output = [
            { text: `> ${trimmed}`, type: 'input' },
            { text: '----------------------------------------------------------------------', type: 'system' },
            { text: 'ID   Date         Category          Post Title', type: 'system' },
            { text: '----------------------------------------------------------------------', type: 'system' },
            ...blogPosts.map(p => ({
              text: `${p.id.toString().padEnd(4)}${p.date.substring(0,4)}.${p.date.substring(4,6)}.${p.date.substring(6,8)}   [${(p.category[0] || 'Misc').padEnd(14).substring(0,14)}] ${p.title}`,
              type: 'output'
            })),
            { text: '\nType "blog <id>" to read the specific post.', type: 'system' }
          ];
        }
        break;

      case 'calc':
        output = handleCalculatorCommand(trimmed, args);
        break;

      case 'game':
        output = [
          { text: `> ${trimmed}`, type: 'input' },
          { text: 'Initializing Snake System...', type: 'system' }
        ];
        // Switch to snake game mode
        setMode('snake');
        break;

      case 'theme':
        if (args.length > 0 && THEME_STYLES[args[0].toLowerCase()]) {
          const nextTheme = args[0].toLowerCase();
          setTheme(nextTheme);
          output = [
            { text: `> ${trimmed}`, type: 'input' },
            { text: `Theme successfully changed to: [${nextTheme.toUpperCase()}]`, type: 'success' }
          ];
        } else {
          output = [
            { text: `> ${trimmed}`, type: 'input' },
            { text: 'Error: Available themes are: green | amber | cyan', type: 'error' }
          ];
        }
        break;

      case 'matrix':
        setMatrixActive(!matrixActive);
        output = [
          { text: `> ${trimmed}`, type: 'input' },
          { text: `Matrix digital rain backdrop is now: [${!matrixActive ? 'ENABLED' : 'DISABLED'}]`, type: 'system' }
        ];
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        setInputValue('');
        return;

      default:
        output = [
          { text: `> ${trimmed}`, type: 'input' },
          { text: `Command not found: "${primary}". Type "help" for a list of system operations.`, type: 'error' }
        ];
        break;
    }

    setHistory((prev) => [...prev, ...output]);
    setInputValue('');
  };

  // Calculator logic parser
  const handleCalculatorCommand = (rawText, args) => {
    if (args.length < 1) {
      return [
        { text: `> ${rawText}`, type: 'input' },
        { text: 'Calculator Toolkit Usage:', type: 'system' },
        { text: '  calc percent <val> <pct>  - Calculate percent of a value', type: 'output' },
        { text: '  calc unit <val> <from> <to> - Data byte metric unit converter (B, KB, MB, GB, TB)', type: 'output' },
        { text: '  calc sql <rows> [index]   - Predict cost for basic SELECT queries', type: 'output' }
      ];
    }

    const sub = args[0].toLowerCase();

    if (sub === 'percent') {
      const val = parseFloat(args[1]);
      const pct = parseFloat(args[2]);
      if (isNaN(val) || isNaN(pct)) {
        return [
          { text: `> ${rawText}`, type: 'input' },
          { text: 'Error: Usage is "calc percent <value> <percentage>" (e.g., calc percent 200 15)', type: 'error' }
        ];
      }
      const result = (val * (pct / 100)).toFixed(4);
      return [
        { text: `> ${rawText}`, type: 'input' },
        { text: '┌──────────────────────────────────────────────┐', type: 'system' },
        { text: '│            PERCENTAGE CONVERSION TOOL        │', type: 'system' },
        { text: `│  Expression: ${pct}% of ${val}`, type: 'output' },
        { text: `│  Calculation: ${val} * (${pct} / 100)`, type: 'output' },
        { text: '│──────────────────────────────────────────────│', type: 'system' },
        { text: `│  Result: ${result}`, type: 'success' },
        { text: '└──────────────────────────────────────────────┘', type: 'system' }
      ];
    }

    if (sub === 'unit') {
      const val = parseFloat(args[1]);
      const from = (args[2] || '').toUpperCase();
      const to = (args[3] || '').toUpperCase();

      const multiplier = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024, TB: 1024 * 1024 * 1024 * 1024 };

      if (isNaN(val) || !multiplier[from] || !multiplier[to]) {
        return [
          { text: `> ${rawText}`, type: 'input' },
          { text: 'Error: Usage is "calc unit <val> <from_unit> <to_unit>" (e.g., calc unit 4.2 GB MB)', type: 'error' },
          { text: 'Supported Units: B, KB, MB, GB, TB', type: 'system' }
        ];
      }

      const bytes = val * multiplier[from];
      const converted = bytes / multiplier[to];
      const formattedResult = converted.toLocaleString(undefined, { maximumFractionDigits: 6 });

      return [
        { text: `> ${rawText}`, type: 'input' },
        { text: '┌──────────────────────────────────────────────┐', type: 'system' },
        { text: '│            DATA METRIC UNIT CONVERTER        │', type: 'system' },
        { text: `│  Source: ${val} ${from}`, type: 'output' },
        { text: `│  Equation: (${val} * ${multiplier[from].toLocaleString()} B) / ${multiplier[to].toLocaleString()} B`, type: 'output' },
        { text: '│──────────────────────────────────────────────│', type: 'system' },
        { text: `│  Output: ${formattedResult} ${to}`, type: 'success' },
        { text: '└──────────────────────────────────────────────┘', type: 'system' }
      ];
    }

    if (sub === 'sql') {
      const rows = parseInt(args[1]);
      const modeOpt = (args[2] || '').toLowerCase();
      const hasIndex = modeOpt !== 'noindex';

      if (isNaN(rows) || rows <= 0) {
        return [
          { text: `> ${rawText}`, type: 'input' },
          { text: 'Error: Usage is "calc sql <rows> [index|noindex]" (e.g., calc sql 120000 noindex)', type: 'error' }
        ];
      }

      const cost = hasIndex ? (Math.log2(rows) * 0.05).toFixed(4) : (rows * 0.02).toFixed(4);
      const scanned = hasIndex ? Math.ceil(Math.log2(rows)) : rows;
      const complexity = hasIndex ? 'O(log N) - B-Tree Index Scan' : 'O(N) - Full Table Scan';

      return [
        { text: `> ${rawText}`, type: 'input' },
        { text: '┌──────────────────────────────────────────────┐', type: 'system' },
        { text: '│            SQL QUERY COST ESTIMATOR          │', type: 'system' },
        { text: `│  Database Rows:  ${rows.toLocaleString()}`, type: 'output' },
        { text: `│  Access Type:    ${hasIndex ? 'INDEX SCAN' : 'FULL TABLE SCAN'}`, type: 'output' },
        { text: `│  Complexity:     ${complexity}`, type: 'output' },
        { text: `│  Disk Read IOs:  ~${scanned.toLocaleString()} blocks`, type: 'output' },
        { text: '│──────────────────────────────────────────────│', type: 'system' },
        { text: `│  Estimated Cost: ${cost} execution cost units`, type: 'success' },
        { text: '└──────────────────────────────────────────────┘', type: 'system' }
      ];
    }

    return [
      { text: `> ${rawText}`, type: 'input' },
      { text: `Error: Sub-calculator "${sub}" not supported. Try percent, unit, or sql.`, type: 'error' }
    ];
  };

  // Fetch blog markdown file
  const loadBlogPost = (post) => {
    setLoadingPost(true);
    setSelectedPost(post);
    setMode('reader');

    fetch(post.download_url)
      .then((res) => {
        if (!res.ok) throw new Error('Document link broken.');
        return res.text();
      })
      .then((text) => {
        setPostMarkdown(marked.parse(text));
        setLoadingPost(false);
      })
      .catch((err) => {
        console.error(err);
        setPostMarkdown('<h1>LOAD ERROR</h1><p>Failed to retrieve the text content from public storage.</p>');
        setLoadingPost(false);
      });
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    executeCommand(inputValue);
  };

  const closeReaderMode = () => {
    setMode('terminal');
    setSelectedPost(null);
    setPostMarkdown('');
    // delay focus to ensure terminal DOM handles focus correctly
    setTimeout(focusInput, 50);
  };

  return (
    <div className={`min-h-screen bg-black ${style.textColor} font-sans relative overflow-hidden select-none p-1 md:p-4`}>
      {/* Background Matrix Rain */}
      <MatrixRain themeHex={style.hex} active={matrixActive && isBooted} />

      {/* CRT Monitor Shader Overlays */}
      <div className="crt-scanlines pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />

      {/* Main Terminal Frame */}
      <div className={`w-full max-w-5xl mx-auto h-[92vh] mt-2 bg-black/95 border ${style.borderColor} rounded-md ${style.shadowClass} flex flex-col relative z-10 animate-crt-flicker`}>
        
        {/* Terminal Header */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${style.borderColor} bg-black/60`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${theme === 'green' ? 'bg-green-500' : theme === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
            <span className="text-xs font-mono tracking-wider font-bold">ABRAHAM_SHELL v3.2.1</span>
          </div>
          
          {/* Quick theme togglers */}
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <button onClick={() => setTheme('green')} className={`px-2 py-0.5 border ${theme === 'green' ? style.borderColor + ' bg-green-950/50' : 'border-transparent text-zinc-600'}`}>GREEN</button>
            <button onClick={() => setTheme('amber')} className={`px-2 py-0.5 border ${theme === 'amber' ? style.borderColor + ' bg-amber-950/50' : 'border-transparent text-zinc-600'}`}>AMBER</button>
            <button onClick={() => setTheme('cyan')} className={`px-2 py-0.5 border ${theme === 'cyan' ? style.borderColor + ' bg-cyan-950/50' : 'border-transparent text-zinc-600'}`}>CYAN</button>
          </div>
        </div>

        {/* Boot Sequence screen */}
        {!isBooted ? (
          <div className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-1 relative">
            <button 
              onClick={() => setIsBooted(true)} 
              className={`absolute top-4 right-4 px-3 py-1.5 border ${style.borderColor} ${style.bgBadge} text-xs hover:bg-black transition-colors`}
            >
              [ Skip Boot Sequence ]
            </button>
            {bootLines.map((line, idx) => (
              <p key={idx} className="leading-relaxed whitespace-pre-wrap">{line}</p>
            ))}
            <div className="w-2 h-4 bg-current inline-block animate-pulse-fast mt-1" />
          </div>
        ) : (
          <>
            {/* Terminal Main Stream */}
            {mode === 'terminal' && (
              <div 
                className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-sm leading-relaxed cursor-text"
                onClick={focusInput}
              >
                {history.map((line, idx) => {
                  let textClass = 'text-inherit';
                  if (line.type === 'input') textClass = style.inputTextColor + ' font-bold';
                  if (line.type === 'error') textClass = 'text-red-500 font-bold';
                  if (line.type === 'success') textClass = 'text-emerald-400 font-bold';
                  if (line.type === 'system') textClass = 'text-zinc-500';

                  return (
                    <div key={idx} className={`${textClass} whitespace-pre-wrap`}>
                      {line.text}
                    </div>
                  );
                })}
                
                {/* Active input row */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center">
                  <span className={`${style.inputTextColor} font-bold mr-2 shrink-0`}>guest@abraham:~$</span>
                  <div className="relative flex-1">
                    {/* Ghost visual input */}
                    <span className={`block w-full min-h-[1.2rem] outline-none break-all ${style.inputTextColor}`}>
                      {inputValue}
                      <span className={`inline-block w-2.5 h-4 ml-0.5 ${style.caretColor} animate-pulse-fast align-middle`} />
                    </span>
                    
                    {/* Actual Hidden input */}
                    <input
                      ref={terminalInputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="absolute inset-0 opacity-0 bg-transparent text-transparent border-none outline-none cursor-default w-full"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                </form>
                <div ref={outputEndRef} />
              </div>
            )}

            {/* Snake Game mode */}
            {mode === 'snake' && (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <SnakeGame themeStyle={style} onExit={() => setMode('terminal')} />
              </div>
            )}

            {/* Markdown Document Reader mode */}
            {mode === 'reader' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className={`flex items-center justify-between px-6 py-2 border-b ${style.borderColor} bg-black`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold uppercase">Viewer - {selectedPost?.title}</span>
                  </div>
                  <button 
                    onClick={closeReaderMode}
                    className={`px-3 py-1 border ${style.borderColor} ${style.bgBadge} text-xs font-mono hover:bg-black transition-colors`}
                  >
                    [ ESC / CLOSE ]
                  </button>
                </div>
                
                <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-black">
                  {loadingPost ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <div className={`w-6 h-6 border-2 border-transparent border-t-current rounded-full animate-spin ${style.textColor}`} />
                      <span className="text-xs font-mono">Syncing remote cache...</span>
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto">
                      <article 
                        className="markdown-reader prose prose-invert font-mono text-sm text-zinc-300 space-y-4 leading-relaxed pb-20"
                        dangerouslySetInnerHTML={{ __html: postMarkdown }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Touch Panel for Mobile & Speed Access */}
        {isBooted && (
          <div className={`px-4 py-2 border-t ${style.borderColor} bg-black/90 flex flex-wrap gap-2 items-center justify-between`}>
            <span className="text-[10px] font-mono text-zinc-600 uppercase shrink-0">Command Pad:</span>
            <div className="flex gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
              <button onClick={() => executeCommand('about')} className={`px-2 py-1 bg-black border ${style.borderColor} text-xs font-mono hover:bg-zinc-950`}>about</button>
              <button onClick={() => executeCommand('tech')} className={`px-2 py-1 bg-black border ${style.borderColor} text-xs font-mono hover:bg-zinc-950`}>tech</button>
              <button onClick={() => executeCommand('projects')} className={`px-2 py-1 bg-black border ${style.borderColor} text-xs font-mono hover:bg-zinc-950`}>projects</button>
              <button onClick={() => executeCommand('blog')} className={`px-2 py-1 bg-black border ${style.borderColor} text-xs font-mono hover:bg-zinc-950`}>blog</button>
              <button onClick={() => executeCommand('calc')} className={`px-2 py-1 bg-black border ${style.borderColor} text-xs font-mono hover:bg-zinc-950`}>calc</button>
              <button onClick={() => executeCommand('game')} className={`px-2 py-1 bg-black border ${style.borderColor} text-xs font-mono hover:bg-zinc-950`}>game</button>
              <button onClick={() => executeCommand('clear')} className={`px-2 py-1 bg-black border border-zinc-900 text-zinc-600 text-xs font-mono hover:bg-zinc-950`}>clear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Text-mode Snake Game Component ---
const BOARD_WIDTH = 22;
const BOARD_HEIGHT = 15;

function SnakeGame({ themeStyle, onExit }) {
  const [snake, setSnake] = useState([
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 8, y: 7 }
  ]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('snake_highscore') || '0');
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameTickSpeed, setGameTickSpeed] = useState(130);

  // Direction handler
  useEffect(() => {
    const handleKeys = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.key)) {
        e.preventDefault(); // prevent window scrolling
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir !== 'DOWN') setDir('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir !== 'UP') setDir('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir !== 'RIGHT') setDir('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir !== 'LEFT') setDir('RIGHT');
          break;
        case 'r':
        case 'R':
          if (gameOver) restartGame();
          break;
        case 'q':
        case 'Q':
        case 'Escape':
          onExit();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [dir, gameOver]);

  // Main game loop ticker
  useEffect(() => {
    if (gameOver) return;

    const tick = () => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        switch (dir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
          default: break;
        }

        // Boundary Collision check
        if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
          setGameOver(true);
          return prevSnake;
        }

        // Body Collision check
        for (let i = 0; i < prevSnake.length; i++) {
          if (prevSnake[i].x === head.x && prevSnake[i].y === head.y) {
            setGameOver(true);
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];

        // Food ingest check
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              try {
                localStorage.setItem('snake_highscore', nextScore.toString());
              } catch {}
            }
            return nextScore;
          });
          spawnFood(newSnake);
          // Dynamically speed up game ticks
          setGameTickSpeed((s) => Math.max(70, s - 3));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(tick, gameTickSpeed);
    return () => clearInterval(intervalId);
  }, [dir, food, gameOver, gameTickSpeed, highScore]);

  const spawnFood = (currentSnake) => {
    let newFood;
    let collision = true;
    while (collision) {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT)
      };
      collision = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
    }
    setFood(newFood);
  };

  const restartGame = () => {
    setSnake([
      { x: 10, y: 7 },
      { x: 9, y: 7 },
      { x: 8, y: 7 }
    ]);
    setFood({ x: 5, y: 5 });
    setDir('RIGHT');
    setScore(0);
    setGameOver(false);
    setGameTickSpeed(130);
  };

  // Compile ASCII board to display
  const renderBoard = () => {
    const board = Array.from({ length: BOARD_HEIGHT }).map(() => 
      Array.from({ length: BOARD_WIDTH }).map(() => ' ')
    );

    // Draw snake body & head
    snake.forEach((segment, idx) => {
      if (idx === 0) {
        board[segment.y][segment.x] = 'O'; // Head
      } else {
        board[segment.y][segment.x] = 'o'; // Body
      }
    });

    // Draw food
    board[food.y][food.x] = '*';

    // Compile into console grid output
    const asciiRows = [];
    asciiRows.push('┌' + '─'.repeat(BOARD_WIDTH) + '┐');
    board.forEach((row) => {
      asciiRows.push('│' + row.join('') + '│');
    });
    asciiRows.push('└' + '─'.repeat(BOARD_WIDTH) + '┘');

    return asciiRows.join('\n');
  };

  return (
    <div className="font-mono text-sm text-center select-none space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold tracking-widest text-emerald-400">--- MINI ARCADE: SNAKE v1.0 ---</h3>
        <p className="text-xs text-zinc-500">Use Arrows or WASD. Try not to crash into walls or yourself.</p>
      </div>

      <div className={`inline-block bg-black border ${themeStyle.borderColor} p-2 leading-none whitespace-pre`}>
        {renderBoard()}
      </div>

      <div className="flex justify-between items-center w-full max-w-[280px] mx-auto text-xs text-zinc-400">
        <div>SCORE: <span className="text-white font-bold">{score}</span></div>
        <div>HIGHSCORE: <span className="text-white font-bold">{highScore}</span></div>
      </div>

      {gameOver && (
        <div className="text-red-500 font-bold animate-pulse text-xs">
          *** GAME OVER ***<br />
          Press [R] to restart, or [Q] to return to CLI.
        </div>
      )}

      <div className="flex gap-4 justify-center pt-2">
        <button 
          onClick={onExit}
          className={`px-3 py-1 border ${themeStyle.borderColor} ${themeStyle.bgBadge} text-xs hover:bg-black transition-colors`}
        >
          [ Q: EXIT ]
        </button>
        {gameOver && (
          <button 
            onClick={restartGame}
            className={`px-3 py-1 border border-emerald-800 bg-emerald-950/20 text-xs text-emerald-400 hover:bg-black transition-colors`}
          >
            [ R: RESTART ]
          </button>
        )}
      </div>

      {/* On-screen control pad for mobile user game interactions */}
      <div className="grid grid-cols-3 gap-2 w-32 mx-auto pt-2 md:hidden">
        <div />
        <button onClick={() => dir !== 'DOWN' && setDir('UP')} className={`p-2 border ${themeStyle.borderColor} text-xs`}>▲</button>
        <div />
        <button onClick={() => dir !== 'RIGHT' && setDir('LEFT')} className={`p-2 border ${themeStyle.borderColor} text-xs`}>◀</button>
        <div className="bg-zinc-900 border border-zinc-800" />
        <button onClick={() => dir !== 'LEFT' && setDir('RIGHT')} className={`p-2 border ${themeStyle.borderColor} text-xs`}>▶</button>
        <div />
        <button onClick={() => dir !== 'UP' && setDir('DOWN')} className={`p-2 border ${themeStyle.borderColor} text-xs`}>▼</button>
        <div />
      </div>
    </div>
  );
}
