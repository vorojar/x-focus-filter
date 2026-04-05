// X Focus Filter - Content Script v1.3
// Filters timeline to show only Tech/AI/Business/Open Source content

(function () {
  'use strict';

  // =========================================================================
  // CONFIG
  // =========================================================================

  const DEFAULT_CONFIG = {
    enabled: true,
    mode: 'whitelist',
    filterMode: 'normal', // strict | normal | relaxed
    showStats: true,
    showBadge: true,
    filterAds: true,
    opacity: 0.0,
    categories: { tech: true, ai: true, business: true, opensource: true, design: false, crypto: false, indie: false, career: false },
    customCategories: [],
    customWhitelist: [],
    customBlacklist: [],
    whitelistedUsers: [],
  };

  let config = { ...DEFAULT_CONFIG };
  let stats = { total: 0, shown: 0, hidden: 0 };
  let peeking = false;

  // =========================================================================
  // KEYWORD DICTIONARIES
  // =========================================================================

  const KEYWORDS = {
    tech: [
      'software', 'hardware', 'programming', 'developer', 'engineering',
      'code', 'coding', 'debug', 'deploy', 'devops', 'sre',
      'frontend', 'backend', 'fullstack', 'full-stack', 'full stack',
      'api', 'sdk', 'cli', 'saas', 'paas', 'iaas',
      'cloud', 'aws', 'azure', 'gcp', 'vercel', 'cloudflare',
      'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
      'microservice', 'serverless', 'lambda',
      'database', 'sql', 'nosql', 'postgres', 'mysql', 'redis', 'mongodb',
      'linux', 'unix', 'ubuntu', 'debian', 'macos',
      'javascript', 'typescript', 'python', 'rust', 'golang', 'java', 'swift', 'kotlin',
      'react', 'vue', 'svelte', 'nextjs', 'next.js', 'nuxt', 'angular',
      'node.js', 'nodejs', 'deno', 'bun',
      'cybersecurity', 'infosec', 'zero-day', 'vulnerability', 'cve',
      'startup', 'silicon valley',
      'apple', 'google', 'microsoft', 'meta', 'amazon', 'nvidia', 'tsmc',
      'semiconductor', 'chip', 'cpu', 'gpu', 'tpu',
      'algorithm', 'data structure',
      'mobile app', 'ios', 'android', 'flutter', 'react native',
      'wasm', 'webassembly', 'webgpu', 'webgl',
      'vscode', 'neovim', 'jetbrains', 'cursor',
      '技术', '编程', '开发者', '程序员', '代码', '架构', '部署',
      '前端', '后端', '全栈', '运维', '服务器', '数据库',
      '云计算', '微服务', '容器', '虚拟化',
      '半导体', '芯片', '处理器',
      '科技', '互联网', '软件', '硬件',
      '阿里', '腾讯', '字节', '百度', '华为', '小米', '美团',
    ],
    ai: [
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'transformer', 'attention mechanism',
      'llm', 'large language model', 'foundation model',
      'gpt', 'chatgpt', 'gpt-4', 'gpt-5', 'o1', 'o3',
      'claude', 'anthropic', 'sonnet', 'opus', 'haiku',
      'gemini', 'bard',
      'llama', 'mistral', 'mixtral', 'qwen', 'deepseek',
      'openai', 'hugging face', 'huggingface',
      'stable diffusion', 'midjourney', 'dall-e', 'dalle', 'flux', 'sora',
      'diffusion model', 'image generation', 'text-to-image',
      'nlp', 'natural language', 'computer vision',
      'reinforcement learning', 'rlhf',
      'fine-tuning', 'fine tuning', 'finetuning', 'lora', 'qlora',
      'rag', 'retrieval augmented', 'vector database', 'embedding',
      'prompt engineering', 'chain of thought',
      'agent', 'ai agent', 'agentic', 'tool use', 'function calling',
      'inference', 'training', 'pre-training', 'pretraining',
      'benchmark', 'evaluation',
      'tokenizer', 'context window',
      'multimodal', 'vision language', 'vlm',
      'robotics', 'autonomous', 'self-driving',
      'text-to-speech', 'speech-to-text', 'tts', 'whisper', 'elevenlabs',
      'copilot', 'claude code', 'devin', 'windsurf', 'bolt',
      'mcp', 'model context protocol',
      'comfyui', 'comfy ui', 'controlnet', 'img2img',
      '人工智能', '机器学习', '深度学习', '大模型', '大语言模型',
      '神经网络', '训练', '推理', '微调', '量化',
      '智能体', 'AIGC', '生成式',
      '通义', '文心', '混元', '星火', '豆包', '智谱', 'kimi',
      '扩散模型', '多模态',
    ],
    business: [
      'startup', 'ipo', 'acquisition', 'merger', 'funding',
      'series a', 'series b', 'series c', 'seed round', 'pre-seed',
      'venture capital', 'angel investor', 'yc', 'y combinator',
      'revenue', 'profit', 'earnings', 'valuation', 'market cap',
      'ceo', 'cto', 'cfo', 'founder', 'co-founder',
      'product market fit', 'growth', 'scale',
      'b2b', 'b2c', 'enterprise',
      'strategy', 'business model', 'monetization',
      'layoff', 'hiring', 'talent', 'remote work',
      'antitrust', 'regulation', 'sec', 'ftc',
      'nasdaq', 'nyse', 's&p',
      'fintech', 'neobank', 'payment', 'stripe',
      '融资', '创业', '上市', '收购', '估值', '营收', '利润',
      '投资', '风投', '天使轮',
      '商业模式', '增长', '盈利', '市值',
      '裁员', '招聘', '管理', '创始人', '企业家',
    ],
    opensource: [
      'open source', 'open-source', 'opensource', 'oss',
      'github', 'gitlab', 'gitea', 'forgejo',
      'mit license', 'apache license', 'gpl', 'bsd license',
      'pull request', 'merge', 'commit', 'fork',
      'repository', 'repo', 'contributor',
      'release', 'changelog', 'semver',
      'npm', 'pypi', 'crates.io', 'cargo', 'pip install',
      'linux', 'kernel', 'gnu',
      'firefox', 'chromium', 'electron',
      'homebrew', 'apt', 'pacman',
      '开源', '开源项目', '开源社区', '贡献者',
      'gitee', '仓库', '源码', '源代码',
    ],
    design: [
      'ui', 'ux', 'ui/ux', 'user interface', 'user experience',
      'figma', 'sketch', 'framer', 'principle', 'adobe xd',
      'design system', 'design token', 'component library',
      'typography', 'typeface', 'font', 'color palette',
      'responsive', 'adaptive', 'layout', 'grid',
      'prototype', 'wireframe', 'mockup', 'pixel',
      'tailwindcss', 'tailwind', 'shadcn', 'radix',
      'motion design', 'animation', 'lottie', 'rive',
      'accessibility', 'a11y', 'wcag',
      'dribbble', 'behance',
      '设计', '交互', '界面', '视觉', '排版', '字体',
      '配色', '原型', '设计系统', '无障碍',
    ],
    crypto: [
      'web3', 'blockchain', 'ethereum', 'bitcoin', 'solana',
      'crypto', 'cryptocurrency', 'token', 'defi', 'dex', 'cex',
      'nft', 'smart contract', 'solidity', 'wallet',
      'mining', 'staking', 'yield', 'liquidity',
      'dao', 'governance', 'on-chain', 'onchain',
      'layer 2', 'l2', 'rollup', 'zk', 'zero knowledge',
      'binance', 'coinbase', 'uniswap', 'opensea',
      'btc', 'eth', 'sol', 'matic', 'polygon',
      '加密', '区块链', '代币', '虚拟货币', '数字货币',
      '挖矿', '质押', '钱包', '去中心化', '链上',
    ],
    indie: [
      'indie hacker', 'indiehacker', 'indie maker',
      'side project', 'sideproject', 'solo founder',
      'bootstrapped', 'bootstrap', 'ramen profitable',
      'mrr', 'arr', 'monthly recurring', 'annual recurring',
      'product hunt', 'producthunt', 'launch day',
      'saas', 'micro saas', 'no-code', 'nocode', 'low-code',
      'landing page', 'waitlist', 'beta launch',
      'stripe', 'lemon squeezy', 'gumroad', 'paddle',
      'build in public', 'buildinpublic', '#buildinpublic',
      '独立开发', '独立开发者', '副业', '个人项目',
      '独立产品', '小而美', '出海',
    ],
    career: [
      'hiring', 'job', 'career', 'resume', 'interview',
      'offer', 'salary', 'compensation', 'equity', 'stock option',
      'remote work', 'remote job', 'work from home', 'wfh',
      'freelance', 'contractor', 'consulting',
      'tech lead', 'staff engineer', 'principal engineer',
      'promotion', 'performance review', 'mentorship',
      'leetcode', 'system design', 'coding interview',
      'linkedin', 'job board',
      '招聘', '求职', '面试', '简历', '薪资', '跳槽',
      '远程', '远程办公', '自由职业', '外包',
      '晋升', '职业发展', '转行', '内推',
    ],
  };

  // Relaxed mode: looser related terms
  const RELAXED_EXTRA = {
    tech: ['tech', 'digital', 'internet', 'online', 'platform', 'app', 'update', 'launch',
           'product', 'feature', 'tool', 'build', '产品', '功能', '工具', '平台', '发布', '更新'],
    ai:   ['smart', 'intelligent', 'model', 'data', 'automation', 'bot', 'chat',
           '智能', '模型', '数据', '自动化'],
    business: ['company', 'industry', 'market', 'deal', 'partner', 'competitive',
               '公司', '行业', '市场', '合作'],
    opensource: ['free', 'community', 'project', 'build', '社区', '项目', '免费'],
    design: ['creative', 'visual', 'style', 'theme', 'icon', '创意', '风格', '主题', '图标'],
    crypto: ['coin', 'exchange', 'trade', 'market', '交易', '币', '行情'],
    indie: ['maker', 'ship', 'launch', 'revenue', '上线', '收入', '变现'],
    career: ['work', 'team', 'role', 'opportunity', '工作', '团队', '机会'],
  };

  const BLACKLIST = [
    'onlyfans', 'nsfw', 'xxx', 'porn', 'hentai', 'nude', 'nudes',
    'naked', 'sexy', 'sex video', 'sex tape', 'adult content',
    'escort', 'cam girl', 'camgirl', 'sugar daddy', 'sugar baby',
    'hookup', 'hook up', 'fwb', 'lingerie', 'bikini', 'thong',
    'hot girl', 'hot babe', 'slutty', 'horny',
    'fanvue', 'fansly', 'manyvids',
    'giveaway', 'airdrop', 'whitelist spot', 'free mint',
    'follow and retweet', 'follow + rt', 'like and retweet',
    'make money', 'passive income', 'forex signal', 'binary option',
    '约炮', '色情', '裸体', '裸照', '成人', '情色', '小姐',
    '援交', '外围', '楼凤', '上门服务',
    '福利姬', '车牌', '番号', '磁力',
    '刷粉', '涨粉', '引流', '私聊', '加微信', '免费领',
  ];

  // =========================================================================
  // MATCHING ENGINE
  // =========================================================================

  function normalizeText(text) {
    return text.toLowerCase().replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function matchesKeywords(text, keywords) {
    const normalized = normalizeText(text);
    return keywords.some(kw => {
      const lower = kw.toLowerCase();
      if (lower.length <= 3) {
        const regex = new RegExp(`\\b${escapeRegex(lower)}\\b`, 'i');
        return regex.test(normalized);
      }
      return normalized.includes(lower);
    });
  }

  // Returns { show: boolean, reason: string }
  function shouldShowTweet(tweetText, userName) {
    if (!config.enabled) return { show: true, reason: '' };

    // Always show whitelisted users
    if (config.whitelistedUsers.length > 0) {
      const nu = userName?.toLowerCase() || '';
      if (config.whitelistedUsers.some(u => nu.includes(u.toLowerCase()))) {
        return { show: true, reason: '' };
      }
    }

    // Blacklist always applies
    const allBlacklist = [...BLACKLIST, ...config.customBlacklist];
    const blacklistHit = findMatchingKeyword(tweetText, allBlacklist);
    if (blacklistHit) return { show: false, reason: `blacklist: ${blacklistHit}` };

    // Build active whitelist
    let activeKeywords = [...config.customWhitelist];
    for (const [cat, enabled] of Object.entries(config.categories)) {
      if (enabled && KEYWORDS[cat]) {
        activeKeywords.push(...KEYWORDS[cat]);
        if (config.filterMode === 'relaxed' && RELAXED_EXTRA[cat]) {
          activeKeywords.push(...RELAXED_EXTRA[cat]);
        }
      }
    }

    // Include custom categories keywords
    if (config.customCategories?.length > 0) {
      for (const cc of config.customCategories) {
        if (cc.keywords?.length > 0) {
          activeKeywords.push(...cc.keywords);
        }
      }
    }

    // Strict mode: require at least 2 keyword matches
    if (config.filterMode === 'strict') {
      const normalized = normalizeText(tweetText);
      let matchCount = 0;
      for (const kw of activeKeywords) {
        const lower = kw.toLowerCase();
        if (lower.length <= 3) {
          const regex = new RegExp(`\\b${escapeRegex(lower)}\\b`, 'i');
          if (regex.test(normalized)) matchCount++;
        } else {
          if (normalized.includes(lower)) matchCount++;
        }
        if (matchCount >= 2) return { show: true, reason: '' };
      }
      return { show: false, reason: 'no match (strict)' };
    }

    const matched = matchesKeywords(tweetText, activeKeywords);
    return { show: matched, reason: matched ? '' : 'no match' };
  }

  // Returns the first matching keyword or null
  function findMatchingKeyword(text, keywords) {
    const normalized = normalizeText(text);
    for (const kw of keywords) {
      const lower = kw.toLowerCase();
      if (lower.length <= 3) {
        const regex = new RegExp(`\\b${escapeRegex(lower)}\\b`, 'i');
        if (regex.test(normalized)) return kw;
      } else {
        if (normalized.includes(lower)) return kw;
      }
    }
    return null;
  }

  // Detect promoted/ad tweets
  function isAdTweet(article) {
    // X marks promoted tweets with specific elements
    const promoted = article.querySelector('[data-testid="placementTracking"]');
    if (promoted) return true;
    // Check for "Ad" / "Promoted" / "推广" label in social context
    const socialCtx = article.querySelector('[data-testid="socialContext"]');
    if (socialCtx) {
      const txt = socialCtx.textContent.toLowerCase();
      if (txt === 'ad' || txt === 'promoted' || txt === '推广') return true;
    }
    return false;
  }

  // =========================================================================
  // DOM MANIPULATION
  // =========================================================================

  const TWEET_SELECTOR = 'article[data-testid="tweet"]';
  const PROCESSED_ATTR = 'data-xfilter-processed';
  const HIDDEN_CLASS = 'xfilter-hidden';
  const VISIBLE_CLASS = 'xfilter-visible';

  function getTweetText(article) {
    const parts = [];
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const nameEl = article.querySelector('[data-testid="User-Name"]');
    const cardEl = article.querySelector('[data-testid="card.wrapper"]');
    if (textEl) parts.push(textEl.textContent);
    if (nameEl) parts.push(nameEl.textContent);
    if (cardEl) parts.push(cardEl.textContent);
    return parts.join(' ');
  }

  function getUserName(article) {
    const nameEl = article.querySelector('[data-testid="User-Name"]');
    return nameEl ? nameEl.textContent : '';
  }

  function setHidden(target, hide) {
    if (hide && !peeking) {
      target.classList.add(HIDDEN_CLASS);
      target.classList.remove(VISIBLE_CLASS);
    } else if (hide && peeking) {
      target.classList.remove(HIDDEN_CLASS);
      target.classList.add('xfilter-peek');
    } else {
      target.classList.remove(HIDDEN_CLASS, 'xfilter-peek');
      target.classList.add(VISIBLE_CLASS);
    }
  }

  function processTweet(article) {
    if (article.getAttribute(PROCESSED_ATTR) === config.filterMode + config.enabled + config.filterAds) return;
    article.setAttribute(PROCESSED_ATTR, config.filterMode + config.enabled + config.filterAds);

    const cellInner = article.closest('[data-testid="cellInnerDiv"]');
    const target = cellInner || article;

    stats.total++;

    // Filter ads first
    if (config.filterAds && isAdTweet(article)) {
      stats.hidden++;
      target.setAttribute('data-xfilter-reason', 'ad');
      setHidden(target, true);
      return;
    }

    const text = getTweetText(article);
    const user = getUserName(article);
    const result = shouldShowTweet(text, user);

    if (result.show) {
      stats.shown++;
      target.removeAttribute('data-xfilter-reason');
      setHidden(target, false);
    } else {
      stats.hidden++;
      target.setAttribute('data-xfilter-reason', result.reason);
      setHidden(target, true);
    }
  }

  function processAllTweets() {
    document.querySelectorAll(TWEET_SELECTOR).forEach(processTweet);
    updateBadge();
  }

  function reprocessAll() {
    stats = { total: 0, shown: 0, hidden: 0 };
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => {
      el.removeAttribute(PROCESSED_ATTR);
      const cellInner = el.closest('[data-testid="cellInnerDiv"]');
      const target = cellInner || el;
      target.classList.remove(HIDDEN_CLASS, VISIBLE_CLASS, 'xfilter-peek');
    });
    processAllTweets();
  }

  // =========================================================================
  // FLOATING BADGE
  // =========================================================================

  let badge = null;

  function createBadge() {
    badge = document.createElement('div');
    badge.id = 'xfilter-badge';
    badge.innerHTML = `
      <div class="xfilter-badge-inner">
        <span class="xfilter-badge-icon">⚡</span>
        <span class="xfilter-badge-text"></span>
        <button class="xfilter-badge-toggle" title="Toggle">●</button>
      </div>
    `;
    document.body.appendChild(badge);
    badge.querySelector('.xfilter-badge-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      config.enabled = !config.enabled;
      saveConfig();
      reprocessAll();
    });
    makeBadgeDraggable();
  }

  function makeBadgeDraggable() {
    let dragging = false;
    let hasMoved = false;
    let startX, startY, origX, origY;

    // Restore saved position
    chrome.storage.local.get('xfilter_badge_pos', (result) => {
      if (result.xfilter_badge_pos) {
        const { right, bottom } = result.xfilter_badge_pos;
        badge.style.right = right + 'px';
        badge.style.bottom = bottom + 'px';
      }
    });

    badge.addEventListener('mousedown', (e) => {
      if (e.target.closest('.xfilter-badge-toggle')) return;
      dragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = badge.getBoundingClientRect();
      origX = window.innerWidth - rect.right;
      origY = window.innerHeight - rect.bottom;
      badge.style.transition = 'none';
      badge.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
      if (!hasMoved) return;
      const newRight = Math.max(0, origX - dx);
      const newBottom = Math.max(0, origY - dy);
      badge.style.right = newRight + 'px';
      badge.style.bottom = newBottom + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      badge.style.transition = '';
      badge.style.userSelect = '';
      if (hasMoved) {
        const pos = { right: parseInt(badge.style.right), bottom: parseInt(badge.style.bottom) };
        chrome.storage.local.set({ xfilter_badge_pos: pos });
      }
    });
  }

  function updateBadge() {
    if (!badge) return;
    if (!config.showBadge) {
      badge.style.display = 'none';
      return;
    }
    const text = badge.querySelector('.xfilter-badge-text');
    const toggle = badge.querySelector('.xfilter-badge-toggle');
    text.textContent = `${stats.shown} ✓ · ${stats.hidden} ✗`;
    toggle.style.color = config.enabled ? '#8cc63f' : '#e05a3a';
    badge.style.display = 'flex';
  }

  // =========================================================================
  // STORAGE & MESSAGING
  // =========================================================================

  function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get('xfilter_config', (result) => {
        if (result.xfilter_config) {
          config = { ...DEFAULT_CONFIG, ...result.xfilter_config };
          config.categories = { ...DEFAULT_CONFIG.categories, ...config.categories };
        }
        resolve();
      });
    });
  }

  function saveConfig() {
    chrome.storage.local.set({ xfilter_config: config });
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'config_updated') {
      config = { ...DEFAULT_CONFIG, ...msg.config };
      config.categories = { ...DEFAULT_CONFIG.categories, ...msg.config.categories };
      reprocessAll();
      sendResponse({ ok: true });
    }
    if (msg.type === 'get_stats') {
      sendResponse({ stats, config });
    }
    if (msg.type === 'peek') {
      peeking = msg.peeking;
      reprocessAll();
      sendResponse({ ok: true });
    }
  });

  // =========================================================================
  // MUTATION OBSERVER
  // =========================================================================

  function processNewTweets(nodes) {
    let count = 0;
    for (const node of nodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches?.(TWEET_SELECTOR)) {
        if (!node.getAttribute(PROCESSED_ATTR)) { processTweet(node); count++; }
      } else {
        const articles = node.querySelectorAll?.(TWEET_SELECTOR + `:not([${PROCESSED_ATTR}])`);
        if (articles) articles.forEach(a => { processTweet(a); count++; });
      }
    }
    if (count > 0) updateBadge();
    addDownloadButtons();
  }

  function startObserver() {
    let pending = [];
    let rafId = null;

    const flush = () => {
      rafId = null;
      const nodes = pending;
      pending = [];
      processNewTweets(nodes);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) pending.push(node);
        }
      }
      if (pending.length > 0 && !rafId) {
        rafId = requestAnimationFrame(flush);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // =========================================================================
  // MEDIA DOWNLOAD (VIDEO + IMAGE)
  // =========================================================================

  const videoUrlMap = new Map(); // tweetId -> mp4 url
  const DL_BTN_ATTR = 'data-xfilter-dl';
  const DL_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  // Listen for video URLs from the MAIN world interceptor (video-interceptor.js)
  window.addEventListener('message', (event) => {
    if (event.data?.type === '__xfilter_videos__') {
      for (const v of event.data.videos) {
        videoUrlMap.set(v.tweetId, v.url);
      }
      addDownloadButtons();
    }
  });

  function getTweetId(article) {
    const links = article.querySelectorAll('a[href*="/status/"]');
    for (const link of links) {
      const match = link.href.match(/\/status\/(\d+)/);
      if (match) return match[1];
    }
    return null;
  }

  function createDlBtn(title, onClick) {
    const btn = document.createElement('button');
    btn.className = 'xfilter-dl-btn';
    btn.title = title;
    btn.innerHTML = DL_SVG;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(btn);
    });
    return btn;
  }

  function addDownloadButtons() {
    // --- Video buttons ---
    const players = document.querySelectorAll('[data-testid="videoPlayer"]');
    for (const player of players) {
      if (player.querySelector(`[${DL_BTN_ATTR}]`)) continue;

      const article = player.closest('article[data-testid="tweet"]');
      if (!article) continue;

      const tweetId = getTweetId(article);
      if (!tweetId || !videoUrlMap.has(tweetId)) continue;

      const container = player.closest('[data-testid="videoComponent"]') || player;
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }

      const btn = createDlBtn('下载视频', (b) => downloadMedia(videoUrlMap.get(tweetId), `x_video_${tweetId}.mp4`, b));
      btn.setAttribute(DL_BTN_ATTR, 'video');
      container.appendChild(btn);
    }

    // --- Image buttons ---
    const photos = document.querySelectorAll('[data-testid="tweetPhoto"]');
    for (const photo of photos) {
      if (photo.querySelector(`[${DL_BTN_ATTR}]`)) continue;

      const img = photo.querySelector('img[src*="pbs.twimg.com/media"]');
      if (!img) continue;

      const article = photo.closest('article[data-testid="tweet"]');
      const tweetId = article ? getTweetId(article) : 'unknown';

      // Get original quality URL
      const origUrl = getOrigImageUrl(img.src);

      // Ensure container is positioned
      if (getComputedStyle(photo).position === 'static') {
        photo.style.position = 'relative';
      }

      const ext = origUrl.includes('format=png') ? 'png' : 'jpg';
      const idx = Array.from(photo.closest('article')?.querySelectorAll('[data-testid="tweetPhoto"]') || []).indexOf(photo);
      const filename = `x_img_${tweetId}${idx > 0 ? '_' + (idx + 1) : ''}.${ext}`;

      const btn = createDlBtn('下载图片', (b) => downloadMedia(origUrl, filename, b));
      btn.setAttribute(DL_BTN_ATTR, 'image');
      photo.appendChild(btn);
    }
  }

  function getOrigImageUrl(src) {
    try {
      const url = new URL(src);
      url.searchParams.set('name', 'orig');
      if (!url.searchParams.has('format')) {
        url.searchParams.set('format', 'jpg');
      }
      return url.toString();
    } catch {
      return src.replace(/&name=\w+/, '&name=orig');
    }
  }

  async function downloadMedia(url, filename, btn) {
    if (!url) return;

    if (btn) {
      btn.classList.add('xfilter-dl-loading');
      btn.title = '下载中...';
    }

    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      if (btn) {
        btn.classList.remove('xfilter-dl-loading');
        btn.classList.add('xfilter-dl-done');
        btn.title = '下载完成';
        setTimeout(() => btn.classList.remove('xfilter-dl-done'), 2000);
      }
    } catch (err) {
      console.error('[X Focus Filter] Download failed:', err);
      if (btn) {
        btn.classList.remove('xfilter-dl-loading');
        btn.title = '下载失败，点击重试';
      }
      window.open(url, '_blank');
    }
  }

  // =========================================================================
  // INIT
  // =========================================================================

  async function init() {
    await loadConfig();
    createBadge();
    processAllTweets();
    addDownloadButtons();
    startObserver();
    console.log('[X Focus Filter] v1.3 Initialized ✓');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
