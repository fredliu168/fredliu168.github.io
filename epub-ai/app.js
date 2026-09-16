/* ============================================================
   The Epub AI Assistant — 宣传页交互
   原生 JS，无依赖。演示台全部是预设内容：
   这个页面永远不会发起任何模型请求。
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var forEach = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };

  /* ============================================================
     1. 文案
     ------------------------------------------------------------
     en 是完整词典；zh 只保留 JS 运行时写入的字符串。
     静态中文写在 HTML 里，init 时会被 captureOriginals() 抄下来
     当作兜底，所以 zh 不需要重复一遍。
     ============================================================ */

  var META = {
    zh: {
      title: 'The Epub AI Assistant — 把书库装进浏览器侧边栏',
      description: 'Chrome 侧边栏 AI 双语 EPUB 阅读器插件：本地导入书籍、段落流式双语翻译、整章摘要、划词翻译，模型配置只存在你的浏览器里。',
      desc: '本地书架、段落双语、整章摘要、划词翻译。自带 API Key，直连任意 OpenAI 兼容接口，书和密钥都不离开你的浏览器。'
    },
    en: {
      title: 'The Epub AI Assistant — your library, in the browser side panel',
      description: 'A Chrome side-panel AI bilingual EPUB reader: import books locally, translate paragraph by paragraph as it streams, summarize a chapter, look up a word — with the model config kept inside your browser.',
      desc: 'Local library, paragraph-level bilingual reading, chapter summaries and word lookups. Bring your own API key and talk to any OpenAI-compatible endpoint.'
    }
  };

  var I18N = {
    en: {
      'nav.demo': 'Live demo',
      'nav.features': 'Features',
      'nav.how': 'How it works',
      'nav.install': 'Install',
      'nav.faq': 'FAQ',
      'nav.github': 'GitHub',
      'nav.cta': '3-step setup',

      'nav.sub': 'Browser extension build · books and model config stay local.',
      'hero.pill': 'Browser extension · no login · local-first',
      'hero.title': 'Read EPUB, translate bilingually and summarize with AI —<br>all inside the <span class="mark">browser side panel</span>.',
      'hero.lede': 'Import local books or remote EPUB links and configure an OpenAI-compatible model service right inside the extension. Books, API keys and reading history stay in this browser.',
      'hero.cta1': 'Three steps to install',
      'hero.cta2': 'Watch it read a book',
      'hero.fact1': 'Local',
      'hero.fact1k': 'Storage',
      'hero.fact2': 'No login',
      'hero.fact2k': 'Account',
      'hero.fact3': 'Your own',
      'hero.fact3k': 'Model access',
      'hero.fact4': '5',
      'hero.fact4k': 'Interface languages',
      'hero.card.title': 'Model config',
      'hero.card.sub': 'Everything is stored in this browser only, for talking to an OpenAI-compatible endpoint.',
      'hero.card.prompt': 'Translation prompt',
      'hero.card.welcome': 'Show welcome page',
      'hero.card.done': 'Done',
      'hero.side.note': '↑ The model-config dialog from the extension itself, copied 1:1 — provider, Base URL, API key, model and prompts, all stored locally.',

      'demo.kicker': 'Live demo',
      'demo.h2': 'One page, two voices',
      'demo.sub': 'This is the real layout: the chapter on the left, the extension side panel on the right. Pick a scenario below to see what it does during a single reading session.',
      'demo.note': 'The demo is preset content — this page never makes a model request.',
      'demo.page.toc': 'Contents',
      'demo.page.dual': 'Bilingual: off',
      'demo.chapter.kicker': 'Chapter three',
      'demo.chapter.title': 'The Cost of Attention',
      'demo.chapter.meta': '1,842 words · 12 paragraphs · about 9 min',
      'demo.page.foot': 'Chapter HTML is sanitized with DOMPurify before it is rendered',
      'demo.word.def': 'n. the act of working with someone to produce something',
      'demo.word.src': 'from the phrase you selected',
      'demo.tab.library': 'Library',
      'demo.tab.reader': 'Reading',
      'demo.tab.settings': 'Model config',
      'demo.state.idle': 'Ready',
      'demo.lib.hint': 'Import an EPUB to start reading. Translation, summaries and word lookup use the model config you set up locally.',
      'demo.drop.title': 'Drop an .epub or click to choose',
      'demo.drop.sub': 'Or paste a link to an EPUB',
      'demo.lib.title': 'Local library',
      'demo.book1.sub': 'EPUB 3.0 · 1.8 MB · 42% read',
      'demo.book2.sub': 'EPUB 3.0 · 1.1 MB · not started',
      'demo.lib.note': 'Books are stored as blobs in IndexedDB — they survive closing the browser.',
      'demo.act.translate': 'Translate paragraphs',
      'demo.act.summary': 'Chapter summary',
      'demo.act.word': 'Word / phrase lookup',
      'demo.reader.hint': 'Select any word or phrase in the text and the translation floats next to the sentence.',
      'demo.word.add': 'Save to vocabulary',
      'demo.tok': 'tokens',
      'demo.lat': 'first token',
      'demo.set.provider': 'Provider',
      'demo.set.prompt': 'Translation prompt',
      'demo.set.promptText': 'Translate the following text into fluent Chinese, retaining formatting.',
      'demo.set.prompt2': 'Summary prompt',
      'demo.set.promptText2': 'Please summarize the following article in Chinese. Focus on the main points, key arguments, and conclusions.',
      'demo.set.keyEmpty': 'sk-…',
      'demo.set.note': 'All settings are stored in this browser only, for talking to an OpenAI-compatible endpoint.',
      'demo.input.placeholder': 'Ask this book anything…',
      'chip.import': '① Import a book',
      'chip.translate': '② Bilingual',
      'chip.summary': '③ Summary',
      'chip.word': '④ Word lookup',
      'chip.settings': '⑤ Model config',

      'feat.kicker': 'Features',
      'feat.h2': 'Everything a reader should be',
      'feat.sub': 'No membership wall, no credits, no “quota exceeded”. Install it and use it — the only limit is the model you plug in.',
      'feat.1.t': 'Two ways to import',
      'feat.1.d': 'Drag a local .epub in, or paste an EPUB URL and let the extension fetch it. Unpacking, parsing the table of contents and writing to the database all happen inside the extension.',
      'feat.2.t': 'Local library',
      'feat.2.d': 'Books are stored as blobs in IndexedDB together with reading progress. Open, delete or re-download them — no account involved.',
      'feat.3.t': 'Paragraph-level streaming',
      'feat.3.d': 'The chapter is split into paragraphs and the translation streams in below each one. Nothing waits for the whole chapter to finish.',
      'feat.4.t': 'Chapter summary',
      'feat.4.d': 'Compress the current chapter into a few lines you can carry away, then decide how deep to read.',
      'feat.5.t': 'Look up as you select',
      'feat.5.d': 'Select a word or a longer phrase to get IPA, meaning and an example sentence — then save it to your vocabulary.',
      'feat.6.t': 'Any compatible endpoint',
      'feat.6.d': 'OpenAI, DeepSeek, your own gateway, a local Ollama or vLLM. The prompts are editable and the target language is yours to pick.',
      'feat.7.t': 'Private by default',
      'feat.7.d': 'No account system and no backend. Chapter HTML is sanitized with DOMPurify before rendering, and the extension asks only for storage and sidePanel.',
      'feat.8.t': 'Five interface languages',
      'feat.8.d': '中文, English, 日本語, Deutsch, Français — switch at any time; the reading pane and the settings follow.',
      'feat.9.t': 'Lives in the side panel',
      'feat.9.d': 'Click the toolbar icon and the panel opens next to the page. No more tab juggling.',

      'how.kicker': 'How it works',
      'how.h2': 'Four steps, all inside the browser',
      'how.sub': 'From dropping a file in to seeing the translation, nothing passes through a server that belongs to someone else.',
      'how.1.t': 'Unpack',
      'how.1.d': 'JSZip opens the EPUB container and fast-xml-parser reads the OPF and NCX to pull out the metadata and the full table of contents.',
      'how.2.t': 'Store',
      'how.2.d': 'Dexie writes the book and its chapters into IndexedDB, together with reading progress and vocabulary.',
      'how.3.t': 'Render',
      'how.3.d': 'Chapter HTML is sanitized with DOMPurify and laid out in an isolated container. Contents jumps, font size and the bilingual toggle apply instantly.',
      'how.4.t': 'Translate',
      'how.4.d': 'Paragraphs are split, sent with your prompt and streamed back from your endpoint; failures retry without interrupting the reading.',
      'how.arch.t': 'Clear layers, platform code kept at the door',
      'how.arch.d': 'Parsing, model calls, storage and UI stay independent, and everything browser-extension specific sits in the adapter layer. Change the shell tomorrow and the core stays.',
      'how.layer.1': 'Platform adapters: extension bridge / web fallback',
      'how.layer.2': 'EPUB parsing · LLM client · IndexedDB',
      'how.layer.3': 'Zustand stores: library, reader, settings',
      'how.layer.4': 'Five locale dictionaries behind one key space',
      'how.stack.t': 'Tech stack',

      'models.kicker': 'Model access',
      'models.h2': 'Your key, your endpoint, your bill',
      'models.sub': 'The extension is not tied to any vendor. Give it a Base URL and an API key and it behaves as a plain OpenAI-compatible client.',
      'models.openai': 'The official endpoint; the gpt models in your list work as they are.',
      'models.deepseek': 'Good value for English↔Chinese work and stable on long paragraphs.',
      'models.custom': 'A local Ollama, vLLM or a self-hosted gateway — anything compatible, just point at it.',
      'models.prompt.translate': 'Translation prompt (editable)',
      'models.prompt.summary': 'Summary prompt (editable)',
      'models.note': 'The default templates work out of the box; rewrite them to taste — add a glossary, require the original, translate without commentary.',

      'install.kicker': 'Install',
      'install.h2': 'Three steps into Chrome',
      'install.sub': 'The extension is installed unpacked, so the source stays in your hands.',
      'install.1.t': 'Clone and install dependencies',
      'install.2.t': 'Build the extension',
      'install.2.d': 'TypeScript compile plus a Vite bundle; the manifest is emitted into dist/ as well.',
      'install.3.t': 'Load the extension',
      'install.3.d': 'Open <span class="mono">chrome://extensions</span>, turn on Developer mode, click “Load unpacked” and pick the <span class="mono">dist/</span> folder the build produced.',
      'install.4.t': 'Read your first book',
      'install.4.d': 'Click the toolbar icon to open the side panel, enter your Base URL, API key and model in settings, then drop an EPUB onto the shelf.',
      'install.perm.t': 'What it asks the browser for',
      'install.perm.1': 'Store books, reading progress and model config',
      'install.perm.2': 'Open the reader in the side panel',
      'install.perm.3': 'Reach the model endpoint you configured and remote EPUB links',
      'install.perm.note': 'No remote code, no analytics, no account API.',
      'install.local': '<b>Data flows one way</b>: only when you trigger a translation or a summary does the matching paragraph text go to the endpoint you filled in.',

      'faq.kicker': 'FAQ',
      'faq.h2': 'The questions that are left',
      'faq.1.q': 'Do I need an account or a subscription?',
      'faq.1.a': 'Neither. There is no account system, no membership, no credits and no invites. The only cost is what your own model provider charges for usage.',
      'faq.2.q': 'Are my books and API key uploaded?',
      'faq.2.a': 'No. EPUB files live in IndexedDB and the API key in chrome.storage.local. Only when you actively trigger a translation, summary or lookup does the relevant paragraph text go to the endpoint you configured.',
      'faq.3.q': 'Which models are supported?',
      'faq.3.a': 'Every OpenAI-compatible endpoint: OpenAI itself, DeepSeek, any self-hosted or third-party gateway, and local Ollama, vLLM or LM Studio runtimes as long as they expose a compatible API.',
      'faq.4.q': 'Which EPUB files work?',
      'faq.4.a': 'Standard EPUB 2 and EPUB 3. Drag in a local file or paste a reachable EPUB link. Encrypted or DRM-protected files cannot be parsed.',
      'faq.5.q': 'Does it work offline?',
      'faq.5.a': 'The library, table of contents, reading and progress all work offline; only translation and summaries need to reach your endpoint. With a local model the whole loop can stay inside your network.',
      'faq.6.q': 'Can I change the interface language?',
      'faq.6.a': 'Yes — 中文, English, 日本語, Deutsch and Français, switchable at any time, with the reading pane and settings following along.',
      'faq.7.q': 'Will it touch my browser settings or other pages?',
      'faq.7.a': 'No. The extension requests storage and sidePanel only, injects no content scripts and does not read the pages you are browsing.',

      'final.h2': 'Your library, in the side panel',
      'final.p': 'A reader that does not get in the way: books on your machine, the translation in front of you, the key only in your browser.',
      'final.cta1': 'Start with the build',
      'final.cta2': 'Read the source',
      'foot.terms': 'Terms of use',
      'foot.privacy': 'Privacy',
      'foot.blog': 'Back to the blog',
      'foot.note': 'This is a static landing page: it collects no data and makes no model requests. Notes and other projects live on the <a href="https://fredliu168.github.io/">blog</a>.',
      'common.copy': 'Copy',

      /* runtime strings written by the demo engine */
      'demo.page.dualOn': 'Bilingual: on',
      'demo.state.busy.import': 'Parsing…',
      'demo.state.busy.translate': 'Translating…',
      'demo.state.busy.summary': 'Summarizing…',
      'demo.state.busy.word': 'Looking up…',
      'demo.state.busy.settings': 'Testing…',
      'demo.state.done.import': 'Stored · 12 chapters',
      'demo.state.done.translate': '3 paragraphs translated',
      'demo.state.done.summary': 'Summary ready',
      'demo.state.done.word': 'Definition ready',
      'demo.state.done.settings': 'Saved · connected 320 ms',
      'demo.drop.parsing': 'Parsing the EPUB…',
      'demo.drop.done': 'Parsed · 12 chapters · 412 KB',
      'demo.book.new.sub': 'EPUB 3.0 · 2.4 MB · just imported',
      'demo.summary.title': 'Chapter summary',
      'demo.summary.meta': 'The Art of Reading · chapter 3 · 12 paragraphs · 1,842 words',
      'demo.summary.b1': 'Rhythm matters more than speed — the meaning is made in the pause.',
      'demo.summary.b2': 'Reading bilingually keeps the voice and its echo at the same time.',
      'demo.summary.b3': 'A summary turns a chapter into three threads that decide how deep to read.',
      'demo.word.defFull': 'n. the act of working with someone to produce something',
      'demo.word.exTr': '翻译是最古老的一种协作。',
      'demo.badge.streaming': 'streaming',
      'demo.badge.done': 'done'
    },

    zh: {
      'demo.page.dualOn': '双语 开',
      'demo.state.busy.import': '解析中…',
      'demo.state.busy.translate': '翻译中…',
      'demo.state.busy.summary': '总结中…',
      'demo.state.busy.word': '查词中…',
      'demo.state.busy.settings': '测试连接…',
      'demo.state.done.import': '已入库 · 12 章',
      'demo.state.done.translate': '3 段已译',
      'demo.state.done.summary': '摘要完成',
      'demo.state.done.word': '已返回释义',
      'demo.state.done.settings': '已保存 · 连通 320 ms',
      'demo.drop.parsing': 'EPUB 解析中…',
      'demo.drop.done': '已解析 · 12 章 · 412 KB',
      'demo.book.new.sub': 'EPUB 3.0 · 2.4 MB · 刚导入',
      'demo.summary.title': '整章摘要',
      'demo.summary.meta': 'The Art of Reading · 第 3 章 · 12 段 · 1,842 词',
      'demo.summary.b1': '阅读的节奏比速度更重要，意义诞生在那次停顿里。',
      'demo.summary.b2': '双语并置让你同时握住原声与回声，而不是二选一。',
      'demo.summary.b3': '摘要把一章压成三条线索，用来决定这一段该读多深。',
      'demo.word.defFull': 'n. 合作，协作；共同完成某项工作',
      'demo.word.exTr': '翻译是最古老的一种协作。',
      'demo.badge.streaming': 'streaming',
      'demo.badge.done': 'done',
      'demo.set.keyEmpty': 'sk-…',
      'demo.set.promptText': 'Translate the following text into fluent Chinese, retaining formatting.',
      'demo.set.promptText2': 'Please summarize the following article in Chinese. Focus on the main points, key arguments, and conclusions.'
    }
  };

  /* 演示用的译文固定为中文：这一台演示讲的是「英文原书 → 中文」，
     界面语言只切换 UI 文案，不切换演示内容。 */
  var DEMO_TRANS = [
    '每一本书都是一台让思考慢下来的机器。页面并不在意你翻得多快，它只要求你停留得足够久，久到某个想法真的落地。',
    '翻译是最古老的一种协作。一个头脑把自己的词借给另一个头脑，读者于是同时握住两者——原声，以及它的回声。',
    '用两种语言阅读不是天赋，而是一种节奏：读、停顿、比对、继续。意义恰恰诞生在那一次停顿里。'
  ];

  /* ============================================================
     2. 语言状态
     ============================================================ */

  var LANG_KEY = 'epub-ai-lang';
  var lang = 'zh';
  var ORIG = { text: {}, html: {} };

  /* 抄下 HTML 里的原文（中文），任何词典缺词都退回它，绝不会露出 key */
  function captureOriginals() {
    forEach($$('[data-i18n]'), function (node) {
      var key = node.getAttribute('data-i18n');
      if (!(key in ORIG.text)) ORIG.text[key] = node.textContent;
    });
    forEach($$('[data-i18n-html]'), function (node) {
      var key = node.getAttribute('data-i18n-html');
      if (!(key in ORIG.html)) ORIG.html[key] = node.innerHTML;
    });
  }

  /* 必须在演示台初始化之前执行，否则第一帧会露出 key */
  captureOriginals();

  function t(key) {
    if (key == null) return '';
    var table = I18N[lang] || {};
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    if (ORIG.text[key] != null) return ORIG.text[key];
    if (I18N.zh[key] != null) return I18N.zh[key];
    return key;
  }

  function tHtml(key) {
    var table = I18N[lang] || {};
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    if (ORIG.html[key] != null) return ORIG.html[key];
    if (I18N.zh[key] != null) return I18N.zh[key];
    return key;
  }

  function detectLang() {
    var saved = null;
    try { saved = window.localStorage.getItem(LANG_KEY); } catch (e) { /* storage blocked */ }
    if (saved === 'zh' || saved === 'en') return saved;
    var nav = (navigator.language || navigator.userLanguage || 'zh').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function setMeta(attr, value, content) {
    var el = document.querySelector('meta[' + attr + '="' + value + '"]');
    if (el) el.setAttribute('content', content);
  }

  function applyLang(next, opts) {
    lang = next === 'en' ? 'en' : 'zh';
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    forEach($$('[data-i18n]'), function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    forEach($$('[data-i18n-html]'), function (node) {
      node.innerHTML = tHtml(node.getAttribute('data-i18n-html'));
    });
    forEach($$('.copy'), function (btn) {
      if (!btn.classList.contains('done')) btn.textContent = t('common.copy');
    });

    var meta = META[lang];
    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.desc);

    var label = $('#lang-label');
    if (label) label.textContent = lang === 'zh' ? 'EN' : '中文';

    syncThemeToggle();
    Demo.syncLang();

    if (opts && opts.persist) {
      try { window.localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage blocked */ }
    }
    if (opts && opts.animate) {
      var btn = $('#lang-toggle');
      if (btn) {
        btn.classList.remove('switching');
        void btn.offsetWidth;
        btn.classList.add('switching');
      }
    }
  }

  /* ============================================================
     3. 主题
     ============================================================ */

  var THEME_KEY = 'epub-ai-theme';
  var THEME_COLOR = { light: '#f7f3ee', dark: '#17130f' };
  var themeToggle = $('#theme-toggle');
  var themeAnimTimer = null;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncThemeToggle() {
    if (!themeToggle) return;
    var dark = currentTheme() === 'dark';
    var label = lang === 'zh'
      ? (dark ? '切换到浅色模式' : '切换到深色模式')
      : (dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.setAttribute('aria-checked', dark ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  function applyTheme(next, opts) {
    var theme = next === 'dark' ? 'dark' : 'light';
    if (opts && opts.animate) {
      var root = document.documentElement;
      root.classList.add('theme-anim');
      clearTimeout(themeAnimTimer);
      themeAnimTimer = setTimeout(function () { root.classList.remove('theme-anim'); }, 340);
    }
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
    syncThemeToggle();
    if (opts && opts.persist) {
      try { window.localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage blocked */ }
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', { persist: true, animate: true });
    });
  }

  /* ============================================================
     4. 演示台
     ============================================================ */

  var Demo = (function () {
    var stage = $('#demo');
    if (!stage) return { syncLang: function () {}, replay: function () {}, stop: function () {} };

    var $id = function (id) { return document.getElementById(id); };

    var el = {
      panelState: $id('panel-state'),
      panelInput: $id('panel-input-text'),
      dualPill: $id('dual-pill'),
      dualText: $('#dual-pill span[data-i18n]'),
      tok: $('#tok-chip b'),
      lat: $('#lat-chip b'),
      drop: $id('drop-zone'),
      dropBar: $id('drop-progress'),
      dropMsg: $id('drop-msg'),
      shelf: $id('shelf'),
      libCount: $id('lib-count'),
      streamCard: $id('stream-card'),
      streamTitle: $id('stream-title'),
      streamMeta: $id('stream-meta'),
      streamBody: $id('stream-body'),
      streamBadge: $id('stream-badge'),
      wordCard: $id('word-card'),
      wcWord: $id('wc-word'),
      wcIpa: $id('wc-ipa'),
      wcDef: $id('wc-def'),
      wcEx: $id('wc-ex'),
      wcExTr: $id('wc-ex-tr'),
      wordPop: $id('word-pop'),
      sel: $id('sel-phrase'),
      setProvider: $id('set-provider'),
      setSelect: $('.scene[data-scene="settings"] .f-select'),
      setBase: $id('set-base'),
      setKey: $id('set-key'),
      setModel: $id('set-model'),
      setPrompt: $id('set-prompt'),
      setPrompt2: $id('set-prompt2'),
      setFields: $$('.scene[data-scene="settings"] .f-input, .scene[data-scene="settings"] .f-area')
    };

    var SET0 = {
      provider: el.setProvider ? el.setProvider.textContent : '',
      base: el.setBase ? el.setBase.textContent : '',
      key: el.setKey ? el.setKey.textContent : '',
      model: el.setModel ? el.setModel.textContent : '',
      prompt: el.setPrompt ? el.setPrompt.textContent : ''
    };

    var gen = 0;             // 每次运行自增，用来作废旧回调
    var jobs = [];           // 活动中的定时器
    var tokens = 0;
    var stateKey = 'demo.state.idle';
    var stateKind = 'idle';
    var dualOn = false;
    var current = 'translate';
    var started = false;
    var touched = false;     // 用户点过 chip / tab 之后不再自动播放
    var autoTimer = null;
    var ORDER = ['import', 'translate', 'summary', 'word', 'settings'];
    var DURATION = { import: 5600, translate: 7000, summary: 7000, word: 6200, settings: 7000 };

    /* ---- 小工具 ---- */

    function after(ms, fn) {
      var id = setTimeout(fn, reduceMotion ? Math.min(ms, 60) : ms);
      jobs.push(id);
      return id;
    }

    function clearJobs() {
      forEach(jobs, function (id) { clearTimeout(id); });
      jobs = [];
    }

    function stop() {
      gen++;
      clearJobs();
      stopAuto();
    }

    function setState(kind, key) {
      stateKind = kind;
      stateKey = key;
      if (!el.panelState) return;
      el.panelState.classList.toggle('is-busy', kind === 'busy');
      el.panelState.classList.toggle('is-done', kind === 'done');
      var span = el.panelState.querySelector('span');
      if (span) span.textContent = t(key);
    }

    function setTab(name) {
      forEach($$('.ptab'), function (tab) {
        tab.setAttribute('aria-selected', tab.getAttribute('data-panel') === name ? 'true' : 'false');
      });
      forEach($$('.scene'), function (scene) {
        scene.hidden = scene.getAttribute('data-scene') !== name;
      });
      if (el.panelInput) {
        el.panelInput.textContent = name === 'settings'
          ? (lang === 'zh' ? '按你的模型写提示词…' : 'Write a prompt for your model…')
          : t('demo.input.placeholder');
      }
    }

    function setDual(on) {
      dualOn = !!on;
      if (el.dualPill) el.dualPill.classList.toggle('is-on', dualOn);
      if (el.dualText) el.dualText.textContent = t(dualOn ? 'demo.page.dualOn' : 'demo.page.dual');
    }

    function addTokens(n) {
      tokens += n;
      if (el.tok) el.tok.textContent = String(tokens);
    }

    function setLatency() {
      if (el.lat) el.lat.textContent = (0.28 + Math.random() * 0.35).toFixed(2) + 's';
    }

    /* 逐字写入；reduceMotion 时直接落字 */
    function stream(node, text, g, done) {
      if (!node) { if (done) done(); return; }
      node.hidden = false;
      node.classList.add('is-shown', 'is-typing');
      node.textContent = '';
      if (reduceMotion) {
        node.textContent = text;
        node.classList.remove('is-typing');
        addTokens(Math.round(text.length / 2));
        if (done) done();
        return;
      }
      var i = 0;
      (function step() {
        if (g !== gen) return;
        i += 1 + Math.floor(Math.random() * 2);
        node.textContent = text.slice(0, i);
        if (i < text.length) {
          after(14 + Math.random() * 26, step);
        } else {
          node.textContent = text;
          node.classList.remove('is-typing');
          addTokens(Math.round(text.length / 2));
          if (done) done();
        }
      })();
    }

    function sel(selector) { return [].slice.call($$(selector)); }

    /* ---- 复位 ---- */

    function reset() {
      setDual(false);
      forEach($$('.trans'), function (node) {
        node.hidden = true;
        node.classList.remove('is-shown', 'is-typing');
        node.textContent = '';
      });
      if (el.sel) el.sel.classList.remove('is-active');
      if (el.wordPop) {
        el.wordPop.classList.remove('is-shown');
        el.wordPop.hidden = true;
      }
      if (el.wordCard) el.wordCard.hidden = true;
      if (el.streamCard) el.streamCard.hidden = true;
      if (el.streamBody) el.streamBody.innerHTML = '';
      if (el.streamBadge) {
        el.streamBadge.classList.remove('is-done');
        el.streamBadge.textContent = t('demo.badge.streaming');
      }
      if (el.drop) el.drop.classList.remove('is-busy', 'is-done');
      if (el.dropBar) el.dropBar.style.width = '0%';
      if (el.dropMsg) { el.dropMsg.hidden = true; el.dropMsg.textContent = ''; }
      sel('.book.is-new').forEach(function (b) { b.parentNode.removeChild(b); });
      if (el.libCount) el.libCount.textContent = String(sel('.shelf .book').length);
      tokens = 0;
      if (el.tok) el.tok.textContent = '0';
      if (el.lat) el.lat.textContent = '—';

      if (el.setProvider) el.setProvider.textContent = SET0.provider;
      if (el.setBase) el.setBase.textContent = SET0.base;
      if (el.setKey) el.setKey.textContent = t('demo.set.keyEmpty');
      if (el.setModel) el.setModel.textContent = SET0.model;
      if (el.setPrompt) el.setPrompt.textContent = t('demo.set.promptText');
      if (el.setPrompt2) el.setPrompt2.textContent = t('demo.set.promptText2');
      forEach(el.setFields, function (f) { f.classList.remove('is-fill'); });
    }

    /* ---- 场景 ---- */

    var scenarios = {

      /* 导入：落一个文件 → 进度 → 上架 */
      import: function (g) {
        setTab('library');
        setState('busy', 'demo.state.busy.import');
        if (el.drop) el.drop.classList.add('is-busy');
        if (el.dropMsg) {
          el.dropMsg.hidden = false;
          el.dropMsg.textContent = t('demo.drop.parsing');
        }
        var p = 0;
        (function tick() {
          if (g !== gen) return;
          p = Math.min(100, p + 6 + Math.random() * 10);
          if (el.dropBar) el.dropBar.style.width = p + '%';
          if (p < 100) { after(85, tick); return; }

          if (el.drop) {
            el.drop.classList.remove('is-busy');
            el.drop.classList.add('is-done');
          }
          if (el.dropMsg) el.dropMsg.textContent = t('demo.drop.done');

          var li = document.createElement('li');
          li.className = 'book is-new';
          li.innerHTML = '<span class="cover c1" aria-hidden="true">AR</span>' +
            '<span class="book-meta"><b>The Art of Reading</b>' +
            '<span class="book-sub"></span></span>';
          li.querySelector('.book-sub').textContent = t('demo.book.new.sub');
          if (el.shelf) el.shelf.appendChild(li);
          if (el.libCount) el.libCount.textContent = String(sel('.shelf .book').length);

          addTokens(96);
          after(320, function () { setState('done', 'demo.state.done.import'); });
        })();
      },

      /* 双语：三段译文依次流入 */
      translate: function (g) {
        setTab('reader');
        setDual(true);
        setState('busy', 'demo.state.busy.translate');
        setLatency();
        var nodes = sel('.trans');
        var i = 0;
        (function one() {
          if (g !== gen) return;
          if (i >= nodes.length) {
            setState('done', 'demo.state.done.translate');
            return;
          }
          var node = nodes[i];
          stream(node, DEMO_TRANS[i], g, function () {
            i++;
            after(260, one);
          });
        })();
      },

      /* 摘要：三条要点流入侧边栏 */
      summary: function (g) {
        setTab('reader');
        setState('busy', 'demo.state.busy.summary');
        setLatency();
        if (el.streamCard) el.streamCard.hidden = false;
        if (el.streamBody) el.streamBody.innerHTML = '';
        if (el.streamTitle) el.streamTitle.textContent = t('demo.summary.title');
        if (el.streamMeta) el.streamMeta.textContent = t('demo.summary.meta');
        if (el.streamBadge) {
          el.streamBadge.classList.remove('is-done');
          el.streamBadge.textContent = t('demo.badge.streaming');
        }

        var lines = [t('demo.summary.b1'), t('demo.summary.b2'), t('demo.summary.b3')];
        var i = 0;
        (function one() {
          if (g !== gen) return;
          if (i >= lines.length) {
            if (el.streamBadge) {
              el.streamBadge.textContent = t('demo.badge.done');
              el.streamBadge.classList.add('is-done');
            }
            setState('done', 'demo.state.done.summary');
            return;
          }
          var row = document.createElement('div');
          row.className = 's-line is-streaming';
          var bullet = document.createElement('i');
          bullet.className = 'bullet';
          var text = document.createElement('span');
          row.appendChild(bullet);
          row.appendChild(text);
          if (el.streamBody) el.streamBody.appendChild(row);
          after(50, function () { row.classList.add('is-shown'); });
          stream(text, lines[i], g, function () {
            i++;
            row.classList.remove('is-streaming');
            after(300, one);
          });
        })();
      },

      /* 划词：正文高亮 + 浮动卡片 + 侧边栏词卡 */
      word: function (g) {
        setTab('reader');
        setState('busy', 'demo.state.busy.word');
        setLatency();
        if (el.sel) el.sel.classList.add('is-active');
        if (el.wordCard) el.wordCard.hidden = false;
        if (el.wcWord) el.wcWord.textContent = 'collaboration';
        if (el.wcIpa) el.wcIpa.textContent = '/kəˌlæbəˈreɪʃn/';
        if (el.wcDef) el.wcDef.textContent = t('demo.word.defFull');
        if (el.wcEx) el.wcEx.textContent = 'Translation is the oldest form of collaboration.';
        if (el.wcExTr) el.wcExTr.textContent = t('demo.word.exTr');
        addTokens(58);
        after(420, function () {
          if (g !== gen || !el.wordPop) return;
          el.wordPop.hidden = false;
          requestAnimationFrame(function () {
            if (g === gen) el.wordPop.classList.add('is-shown');
          });
        });
        after(1100, function () { setState('done', 'demo.state.done.word'); });
      },

      /* 模型配置：从本地模型切到线上模型并测试连通 */
      settings: function (g) {
        setTab('settings');
        setState('idle', 'demo.state.idle');
        var fields = [el.setSelect, el.setBase, el.setKey, el.setModel, el.setPrompt];
        var i = 0;
        (function one() {
          if (g !== gen) return;
          if (i >= fields.length) {
            setState('busy', 'demo.state.busy.settings');
            after(820, function () { setState('done', 'demo.state.done.settings'); });
            return;
          }
          var field = fields[i];
          if (field) field.classList.add('is-fill');
          if (i === 0 && el.setProvider) el.setProvider.textContent = 'DeepSeek';
          if (i === 1 && el.setBase) el.setBase.textContent = 'https://api.deepseek.com/v1';
          if (i === 2 && el.setKey) el.setKey.textContent = 'sk-••••••••••••4f2a';
          if (i === 3 && el.setModel) el.setModel.textContent = 'deepseek-chat';
          i++;
          after(460, one);
        })();
      }
    };

    /* ---- 运行 / 自动播放 ---- */

    function syncChips(id) {
      forEach($$('.chip'), function (chip) {
        chip.setAttribute('aria-selected', chip.getAttribute('data-scenario') === id ? 'true' : 'false');
      });
    }

    function run(id) {
      if (!scenarios[id]) return;
      stop();
      var g = gen;              // stop() 已经自增，本轮用它作标记
      current = id;
      syncChips(id);
      reset();
      scenarios[id](g);
    }

    function stopAuto() {
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    }

    function scheduleAuto() {
      if (touched || !started) return;
      stopAuto();
      autoTimer = setTimeout(function () {
        autoTimer = null;
        if (touched) return;
        var next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
        run(next);
        scheduleAuto();
      }, DURATION[current] || 6600);
    }

    /* chip / tab / 按钮 */
    forEach($$('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        touched = true;
        stopAuto();
        run(chip.getAttribute('data-scenario'));
      });
    });

    forEach($$('.ptab'), function (tab) {
      tab.addEventListener('click', function () {
        touched = true;
        stop();
        setTab(tab.getAttribute('data-panel'));
        syncChips('');
        setState('idle', 'demo.state.idle');
      });
    });

    var actions = [
      ['act-translate', 'translate'],
      ['act-summary', 'summary'],
      ['act-word', 'word']
    ];
    forEach(actions, function (pair) {
      var btn = document.getElementById(pair[0]);
      if (btn) {
        btn.addEventListener('click', function () {
          touched = true;
          stopAuto();
          run(pair[1]);
        });
      }
    });

    /* 进入视口后自动演示一轮 */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        forEach(entries, function (entry) {
          if (entry.isIntersecting) {
            if (!started) {
              started = true;
              run(ORDER[0]);
            }
            scheduleAuto();
          } else {
            stopAuto();
          }
        });
      }, { threshold: 0.25 });
      io.observe($('.stage') || stage);
    } else {
      started = true;
      run(ORDER[0]);
    }

    /* 初始静态状态 */
    setTab('reader');
    setDual(false);
    setState('idle', 'demo.state.idle');

    return {
      /* 语言切换后，把动态写入的字符串重新刷一遍 */
      syncLang: function () {
        setState(stateKind, stateKey);
        setDual(dualOn);
        if (el.panelInput) {
          var active = $('.ptab[aria-selected="true"]');
          setTab(active ? active.getAttribute('data-panel') : 'reader');
        }
        if (started) run(current);
      },
      replay: function () { if (started) run(current); },
      stop: stop
    };
  })();

  /* ============================================================
     5. 语言切换按钮
     ============================================================ */

  var langBtn = $('#lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(lang === 'zh' ? 'en' : 'zh', { persist: true, animate: true });
    });
  }

  /* ============================================================
     6. 吸顶导航、滚动显现、复制按钮
     ============================================================ */

  var nav = $('#nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var revealTargets = '.section-head, .hero-card, .hero-side-note, .hero-facts li, .card, .pipeline li, .split-main, .split-side, .provider, .prompt-card, .prompt-note, .install-steps li, .perm-card, .local-card, .faq details, .final h2, .final p, .final .cta-row';

  if ('IntersectionObserver' in window && !reduceMotion) {
    var targets = $$(revealTargets);
    forEach(targets, function (node, i) {
      node.classList.add('reveal');
      node.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
    });

    var ro = new IntersectionObserver(function (entries) {
      forEach(entries, function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          ro.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    forEach(targets, function (node) { ro.observe(node); });

    /* 兜底：锚点跳转、打印或观察器不触发时，内容不能被藏在透明里 */
    var revealAll = function () {
      forEach(targets, function (node) { node.classList.add('is-in'); });
    };
    setTimeout(revealAll, 2600);
    window.addEventListener('beforeprint', revealAll);
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    done(ok);
  }

  forEach($$('.copy'), function (btn) {
    btn.addEventListener('click', function () {
      var src = document.getElementById(btn.getAttribute('data-copy'));
      if (!src) return;
      var text = src.textContent.trim();
      var finish = function (ok) {
        if (!ok) return;
        btn.classList.add('done');
        btn.textContent = lang === 'zh' ? '已复制' : 'Copied';
        setTimeout(function () {
          btn.classList.remove('done');
          btn.textContent = t('common.copy');
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { finish(true); }, function () {
          fallbackCopy(text, finish);
        });
      } else {
        fallbackCopy(text, finish);
      }
    });
  });

  /* ============================================================
     7. 启动
     ============================================================ */

  captureOriginals();
  applyTheme(currentTheme(), { persist: false });
  applyLang(detectLang(), { persist: false });
})();
