// X Focus Filter - Content Script v1.1
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
    opacity: 0.0,
    categories: { tech: true, ai: true, business: true, opensource: true, design: false, crypto: false, indie: false, career: false },
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

  function shouldShowTweet(tweetText, userName) {
    if (!config.enabled) return true;

    // Always show whitelisted users
    if (config.whitelistedUsers.length > 0) {
      const nu = userName?.toLowerCase() || '';
      if (config.whitelistedUsers.some(u => nu.includes(u.toLowerCase()))) return true;
    }

    // Blacklist always applies
    const allBlacklist = [...BLACKLIST, ...config.customBlacklist];
    if (matchesKeywords(tweetText, allBlacklist)) return false;

    // Build active whitelist
    let activeKeywords = [...config.customWhitelist];
    for (const [cat, enabled] of Object.entries(config.categories)) {
      if (enabled && KEYWORDS[cat]) {
        activeKeywords.push(...KEYWORDS[cat]);
        // Relaxed mode: add extra terms
        if (config.filterMode === 'relaxed' && RELAXED_EXTRA[cat]) {
          activeKeywords.push(...RELAXED_EXTRA[cat]);
        }
      }
    }

    const matched = matchesKeywords(tweetText, activeKeywords);

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
        if (matchCount >= 2) return true;
      }
      return false;
    }

    return matched;
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
    if (article.getAttribute(PROCESSED_ATTR) === config.filterMode + config.enabled) return;
    article.setAttribute(PROCESSED_ATTR, config.filterMode + config.enabled);

    const text = getTweetText(article);
    const user = getUserName(article);
    const cellInner = article.closest('[data-testid="cellInnerDiv"]');
    const target = cellInner || article;

    stats.total++;

    if (shouldShowTweet(text, user)) {
      stats.shown++;
      setHidden(target, false);
    } else {
      stats.hidden++;
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
  }

  function updateBadge() {
    if (!badge || !config.showStats) return;
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

  function startObserver() {
    const observer = new MutationObserver((mutations) => {
      let hasNew = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            if (node.matches?.(TWEET_SELECTOR) || node.querySelector?.(TWEET_SELECTOR)) {
              hasNew = true; break;
            }
          }
        }
        if (hasNew) break;
      }
      if (hasNew) {
        clearTimeout(startObserver._timer);
        startObserver._timer = setTimeout(processAllTweets, 150);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // =========================================================================
  // INIT
  // =========================================================================

  async function init() {
    await loadConfig();
    createBadge();
    processAllTweets();
    startObserver();
    console.log('[X Focus Filter] v1.1 Initialized ✓');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
