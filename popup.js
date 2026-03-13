// X Focus Filter - Popup Script v1.1

// ── i18n ──
const I18N = {
  en: {
    subtitle: 'Only see what matters',
    stat_scanned: 'scanned',
    stat_shown: 'shown',
    stat_hidden: 'hidden',
    mode_strict: '🔒 Strict',
    mode_normal: '🎯 Normal',
    mode_relaxed: '🌊 Relaxed',
    section_topics: 'Topics',
    cat_tech: 'Tech',
    cat_tech_desc: 'Software, hardware, startups',
    cat_ai: 'AI / ML',
    cat_ai_desc: 'LLMs, deep learning, agents',
    cat_biz: 'Business',
    cat_biz_desc: 'Startups, funding, markets',
    cat_oss: 'Open Source',
    cat_oss_desc: 'GitHub, OSS, releases',
    cat_design: 'Design',
    cat_design_desc: 'UI/UX, Figma, typography',
    cat_crypto: 'Crypto',
    cat_crypto_desc: 'Blockchain, DeFi, Web3',
    cat_indie: 'Indie Dev',
    cat_indie_desc: 'Side projects, bootstrapping',
    cat_career: 'Career',
    cat_career_desc: 'Jobs, hiring, interviews',
    section_custom: 'Custom Keywords',
    label_whitelist: 'Always show tweets containing (comma separated):',
    label_blacklist: 'Always hide tweets containing (comma separated):',
    label_users: 'Always show these users (comma separated):',
    ph_whitelist: 'e.g. wasm, deno, rust',
    ph_blacklist: 'e.g. drama, gossip',
    ph_users: 'e.g. @elonmusk, @vercel',
    btn_save: 'Save & Apply',
    btn_save_done: '✓ Applied!',
    btn_peek: '👁 Peek',
    btn_peek_off: '👁 Hide',
    footer: 'Local keyword filtering · No API',
    kw_unit: 'keywords',
  },
  zh: {
    subtitle: '只看你关心的内容',
    stat_scanned: '已扫描',
    stat_shown: '已显示',
    stat_hidden: '已隐藏',
    mode_strict: '🔒 严格',
    mode_normal: '🎯 普通',
    mode_relaxed: '🌊 宽松',
    section_topics: '关注主题',
    cat_tech: '科技',
    cat_tech_desc: '软件、硬件、创业公司',
    cat_ai: 'AI / 机器学习',
    cat_ai_desc: '大模型、深度学习、智能体',
    cat_biz: '商业',
    cat_biz_desc: '创业、融资、市场',
    cat_oss: '开源',
    cat_oss_desc: 'GitHub、开源项目、发布',
    cat_design: '设计',
    cat_design_desc: 'UI/UX、Figma、字体',
    cat_crypto: '加密',
    cat_crypto_desc: '区块链、DeFi、Web3',
    cat_indie: '独立开发',
    cat_indie_desc: '副业、个人产品',
    cat_career: '职业',
    cat_career_desc: '招聘、求职、面试',
    section_custom: '自定义关键词',
    label_whitelist: '始终显示含这些词的推文（逗号分隔）：',
    label_blacklist: '始终隐藏含这些词的推文（逗号分隔）：',
    label_users: '始终显示这些用户（逗号分隔）：',
    ph_whitelist: '例如 wasm, deno, rust',
    ph_blacklist: '例如 八卦, 吃瓜',
    ph_users: '例如 @elonmusk, @vercel',
    btn_save: '保存并应用',
    btn_save_done: '✓ 已应用！',
    btn_peek: '👁 偷看',
    btn_peek_off: '👁 隐藏',
    footer: '本地关键词过滤 · 无需 API',
    kw_unit: '个关键词',
  },
};

let currentLang = 'zh'; // default to Chinese
let currentMode = 'normal';
let peeking = false;

function applyI18n(lang) {
  currentLang = lang;
  const dict = I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (dict[key]) el.placeholder = dict[key];
  });
  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('masterToggle');
  const categoryToggles = document.querySelectorAll('[data-category]');
  const customWhitelist = document.getElementById('customWhitelist');
  const customBlacklist = document.getElementById('customBlacklist');
  const whitelistedUsers = document.getElementById('whitelistedUsers');
  const saveBtn = document.getElementById('saveBtn');
  const peekBtn = document.getElementById('peekBtn');
  const modeBtns = document.querySelectorAll('.mode-btn');

  // Load config
  const result = await chrome.storage.local.get('xfilter_config');
  const config = result.xfilter_config || {};

  // Apply loaded config to UI
  masterToggle.checked = config.enabled !== false;
  currentMode = config.filterMode || 'normal';
  currentLang = config.lang || 'zh';

  if (config.categories) {
    categoryToggles.forEach(toggle => {
      const cat = toggle.dataset.category;
      if (config.categories[cat] !== undefined) toggle.checked = config.categories[cat];
    });
  }
  // Sync chip active state with checkbox
  categoryToggles.forEach(toggle => {
    const chip = toggle.closest('.category-chip');
    if (chip) chip.classList.toggle('active', toggle.checked);
  });
  if (config.customWhitelist) customWhitelist.value = config.customWhitelist.join(', ');
  if (config.customBlacklist) customBlacklist.value = config.customBlacklist.join(', ');
  if (config.whitelistedUsers) whitelistedUsers.value = config.whitelistedUsers.join(', ');

  // Apply mode
  modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === currentMode));

  // Apply i18n
  applyI18n(currentLang);

  // Fetch stats
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && (tab.url?.includes('x.com') || tab.url?.includes('twitter.com'))) {
      chrome.tabs.sendMessage(tab.id, { type: 'get_stats' }, (response) => {
        if (response?.stats) {
          document.getElementById('statTotal').textContent = response.stats.total;
          document.getElementById('statShown').textContent = response.stats.shown;
          document.getElementById('statHidden').textContent = response.stats.hidden;
        }
      });
    }
  } catch (e) {}

  // ── Category chip toggle ──
  categoryToggles.forEach(toggle => {
    const chip = toggle.closest('.category-chip');
    if (chip) {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        toggle.checked = !toggle.checked;
        chip.classList.toggle('active', toggle.checked);
      });
    }
  });

  // ── Language switch ──
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyI18n(btn.dataset.lang);
      doSave(); // persist lang choice
    });
  });

  // ── Mode switch ──
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      doSave();
    });
  });

  // ── Peek ──
  peekBtn.addEventListener('click', async () => {
    peeking = !peeking;
    peekBtn.classList.toggle('active', peeking);
    peekBtn.textContent = peeking ? I18N[currentLang].btn_peek_off : I18N[currentLang].btn_peek;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) chrome.tabs.sendMessage(tab.id, { type: 'peek', peeking });
    } catch (e) {}
  });

  // ── Save ──
  saveBtn.addEventListener('click', () => doSave());
  masterToggle.addEventListener('change', () => doSave());

  async function doSave() {
    const newConfig = {
      enabled: masterToggle.checked,
      mode: 'whitelist',
      filterMode: currentMode,
      lang: currentLang,
      showStats: true,
      opacity: 0.0,
      categories: {},
      customWhitelist: parseLines(customWhitelist.value),
      customBlacklist: parseLines(customBlacklist.value),
      whitelistedUsers: parseLines(whitelistedUsers.value),
    };
    categoryToggles.forEach(toggle => {
      newConfig.categories[toggle.dataset.category] = toggle.checked;
    });
    await chrome.storage.local.set({ xfilter_config: newConfig });
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) chrome.tabs.sendMessage(tab.id, { type: 'config_updated', config: newConfig });
    } catch (e) {}

    const dict = I18N[currentLang];
    saveBtn.textContent = dict.btn_save_done;
    saveBtn.classList.add('saved');
    setTimeout(() => {
      saveBtn.textContent = dict.btn_save;
      saveBtn.classList.remove('saved');
    }, 1500);
  }
});

function parseLines(text) {
  return text.split(/[,;，；\n]/).map(l => l.trim()).filter(l => l.length > 0);
}
