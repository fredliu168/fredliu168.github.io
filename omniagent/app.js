/* ============================================================
   omniagent landing page — interactions + i18n
   Vanilla JS, no dependencies. All demo content is preset:
   no model request is ever made from this page.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ============================================================
     1. translations
     ============================================================ */

  var META = {
    zh: {
      title: 'omniagent — 住在浏览器里的智能体',
      description: 'omniagent 是一个 Chrome 侧边栏浏览器智能体：读懂当前页面，自己调用工具点击、输入、翻译、整理，把一句自然语言变成一件完成的事。',
      ogTitle: 'omniagent — 住在浏览器里的智能体',
      ogDescription: '读懂页面、拆解步骤、调用工具、回填结果。一句自然语言，换来一件完成的事。'
    },
    en: {
      title: 'omniagent — the browser agent that finishes the job',
      description: 'omniagent is a Chrome side-panel browser agent: it reads the page in front of you, plans its own steps and calls tools to click, type, translate and organize — turning one sentence into a finished task.',
      ogTitle: 'omniagent — the browser agent that finishes the job',
      ogDescription: 'Reads the page, plans the steps, calls the tools, writes the result back. One sentence in, one finished task out.'
    }
  };

  var I18N = {
    zh: {
      'nav.demo': '在线演示',
      'nav.how': '工作原理',
      'nav.features': '能力',
      'nav.install': '安装',
      'nav.faq': '常见问题',
      'nav.cta': '立即安装',

      'hero.pill': 'Chrome Side Panel · 开源浏览器智能体',
      'hero.title': '让浏览器<br><span class="grad">替你把事情做完</span>',
      'hero.lede': 'omniagent 住在你的 Chrome 侧边栏里。它读懂当前页面，自己拆步骤、调用工具，完成点击、输入、翻译、整理与提交——<strong>一句自然语言，换来一件完成的事</strong>。',
      'hero.cta1': '三步安装扩展',
      'hero.cta2': '看它在页面上怎么干活',
      'hero.fact1': '个页面 / 后台工具',
      'hero.fact2': '家预设模型供应商',
      'hero.fact3': '条数据离开你配置的接口',

      'demo.title': '深度工作：把注意力还给真正重要的事',
      'demo.meta': '2026 · 12 分钟阅读 · 长文',
      'demo.p1': '注意力是稀缺资源。真正拉开差距的，不是工作更长时间，而是能否长时间不被打断地处理一件难事。',
      'demo.p2': '把重复的查找、复制、整理交给工具，人才有余力留在难题里。这也是自动化真正值得投入的地方——不是为了快，而是为了不被打断。',
      'demo.p3': '衡量的方式同样重要：一天结束时有几个 90 分钟不被打断的区块，比处理了多少条消息更能说明问题。',
      'demo.quote': '「专注不是一种天赋，而是一套可以被搭建的环境。」',
      'demo.side': '相关阅读',
      'demo.placeholder': '接下来，还想做些什么？',
      'demo.note': '选择场景 · 演示为预设内容，不发起模型请求',
      'demo.chip.research': '阅读与研究',
      'demo.chip.translate': '整页翻译',
      'demo.chip.skill': '当作技能复用',
      'demo.replay': '↻ 重播',

      'how.kicker': 'HOW IT WORKS',
      'how.title': '不是聊天框，是一个会动手的循环',
      'how.desc': '每次任务都走同一条链路：看清页面 → 拆出步骤 → 调用工具 → 把结果落到页面上。过程实时可见，你随时可以喊停。',
      'how.s1t': '读取页面',
      'how.s1p': '通过内容脚本读取 DOM、正文、表单与结构，必要时截图理解画面。',
      'how.s2t': '拆解步骤',
      'how.s2p': '模型用 OpenAI 兼容的 function calling 规划工具序列，而非盲目试错。',
      'how.s3t': '调用工具',
      'how.s3p': '点击、输入、选择、滚动、等待元素、跳转——45 个工具按需加载。',
      'how.s4t': '回填结果',
      'how.s4p': '答案写回页面或侧边栏，成功的流程可存成技能，下次一键复用。',
      'how.loopBadge': 'Agent Loop',
      'how.loopText': '用户消息 → 模型 → 工具 → 结果回灌 → 继续，直到任务完成或达到迭代上限。',

      'feat.kicker': 'CAPABILITIES',
      'feat.title': '六件它真的替你做的事',
      'feat.desc': '不是功能清单堆砌，而是每天都会用到的几件事。',
      'feat.c1t': '在页面上自主操作',
      'feat.c1p': '点击按钮、填写表单、切换下拉、等待异步元素、跨页面跳转。执行过程逐步展示，出错可回看每一步的入参与返回。',
      'feat.done': '✓ 完成',
      'feat.c2t': '整页与划词翻译',
      'feat.c2p': '按段落串行翻译，可双语对照写回页面；双击单词看释义，划选一段即时出译文。',
      'feat.c3t': '跨会话记忆',
      'feat.c3p': '偏好、站点特征、操作经验自动沉淀，新会话开局就带着上下文。超过 50 条可一键压缩。',
      'feat.c4t': '技能库',
      'feat.c4p': '把跑通的多步流程存成技能，支持 Markdown 导入导出，团队之间可以直接共享。',
      'feat.c5t': '脚本技能',
      'feat.c5p': '用 JavaScript 给它加新工具，在受控沙盒里运行，可调用外部接口、处理复杂数据。',
      'feat.c6t': '定时任务',
      'feat.c6p': '单次、间隔、每日、每周四种调度，让巡检、汇总、提醒之类的事自己发生。',
      'feat.c7t': '接口流量分析',
      'feat.c7p': '基于浏览器性能数据列出页面 API 请求，按域名、路径、状态码聚合，找出最慢和最大的接口；点击之后有没有真的触发请求，一等就知道。',

      'models.kicker': 'BRING YOUR OWN MODEL',
      'models.title': '模型你自己选，接口你来配',
      'models.desc': '内置预设供应商自动带出 Base URL，也可手动添加任何 OpenAI 兼容接口。主模型与翻译模型可以分开配置，思考强度四档可调。',
      'models.p4': '火山引擎',
      'models.p5': '硅基流动',
      'models.compat': 'OpenAI 兼容接口 ↗',
      'models.foot': 'API Key 保存在浏览器本地存储中，请求直接发往你填写的地址，不经过任何中间服务。',

      'install.kicker': 'GET STARTED',
      'install.title': '三步，跑起来',
      'install.desc': '需要 Node.js 与支持 Side Panel API 的新版 Chrome。',
      'install.s1t': '克隆并构建',
      'install.s1p': '仓库目前仍沿用 NeonAgent 名称。',
      'install.s2t': '加载扩展',
      'install.s2p': '打开 <code class="inline">chrome://extensions</code>，开启「开发者模式」，点击「加载已解压的扩展程序」，选择构建产物目录。',
      'install.hint2': '首次加载后，点击工具栏图标即可打开侧边栏。',
      'install.s3t': '接入模型',
      'install.s3p': '在设置页新增供应商，填入 Base URL、API Key 与模型名称，然后在输入框里发出第一个指令。',
      'install.tryLabel': '试试这样说',
      'install.tryText': '“读一下这个页面，把要点整理成三条，存成笔记。”',
      'install.cta1': '阅读完整文档 ↗',
      'install.cta2': '查看源代码',

      'faq.kicker': 'FAQ',
      'faq.title': '你可能想知道',
      'faq.q1': '需要什么浏览器？',
      'faq.a1': '项目基于 Chrome Side Panel API，需要支持侧边栏的新版 Chrome（或同内核浏览器）。安装方式为「加载已解压的扩展程序」，尚未上架应用商店。',
      'faq.q2': '可以用自己的模型吗？',
      'faq.a2': '可以。设置页支持新增任意 OpenAI 兼容接口，内置 Kimi、MiniMax、DeepSeek、火山引擎、硅基流动预设。主模型、翻译模型、Temperature、Max Tokens 与思考强度都可分别调整。',
      'faq.q3': '网页内容会被发到哪里？',
      'faq.a3': '只有模型处理所需的页面内容会发送到你自己配置的接口地址。配置、会话、记忆与技能保存在浏览器本地存储中，不经过第三方服务器。请同时了解你所选模型供应商的数据政策。',
      'faq.q4': '它会在我没盯着的时候乱点吗？',
      'faq.a4': '每个工具调用都会在侧边栏逐步展示，你可以随时点停止中断。定时任务与自动解题属于需要显式开启的开关，默认关闭。',
      'faq.q5': '和普通的网页 AI 侧边栏有什么区别？',
      'faq.a5': '普通的侧边栏只能「说」。omniagent 拥有作用于当前页面的一组工具，能读写 DOM、模拟交互、操作表单，因此可以真的把事情做完，而不是只给出建议。',

      'final.title': '把重复的部分交出去',
      'final.desc': '留下需要判断力的那部分给自己。',
      'final.cta1': '开始安装',
      'final.cta2': 'GitHub ↗',

      'foot.back': '返回博客',
      'foot.copy': 'omniagent · 个人开源项目，与模型供应商无隶属关系',
      'foot.privacy': '使用条款与隐私说明',

      'common.copy': '复制',
      'common.copied': '已复制 ✓',

      'theme.toLight': '切换到浅色模式',
      'theme.toDark': '切换到深色模式'
    },

    en: {
      'nav.demo': 'Live demo',
      'nav.how': 'How it works',
      'nav.features': 'Capabilities',
      'nav.install': 'Install',
      'nav.faq': 'FAQ',
      'nav.cta': 'Install now',

      'hero.pill': 'Chrome Side Panel · open-source browser agent',
      'hero.title': 'Let your browser<br><span class="grad">finish the job</span>',
      'hero.lede': 'omniagent lives in your Chrome side panel. It reads the page in front of you, plans its own steps and calls tools to click, type, translate, organize and submit — <strong>one sentence in, one finished task out</strong>.',
      'hero.cta1': 'Install in three steps',
      'hero.cta2': 'Watch it work on a page',
      'hero.fact1': 'page & background tools',
      'hero.fact2': 'preset model providers',
      'hero.fact3': 'requests routed outside your endpoint',

      'demo.title': 'Deep Work: giving attention back to what matters',
      'demo.meta': '2026 · 12 min read · Long-form',
      'demo.p1': 'Attention is the scarce resource. What separates people is not working longer hours — it is being able to hold one hard problem without interruption.',
      'demo.p2': 'Hand the searching, copying and tidying to a tool, and you keep the capacity to stay inside the hard part. That is what automation is really worth: not speed, but not being interrupted.',
      'demo.p3': 'How you measure it matters too. A day is better described by how many uninterrupted 90-minute blocks you had than by how many messages you cleared.',
      'demo.quote': '“Focus is not a talent. It is an environment you can build.”',
      'demo.side': 'Related',
      'demo.placeholder': 'What else would you like to do?',
      'demo.note': 'Pick a scenario · preset demo, no model request is made',
      'demo.chip.research': 'Read & research',
      'demo.chip.translate': 'Full-page translation',
      'demo.chip.skill': 'Save as a skill',
      'demo.replay': '↻ Replay',

      'how.kicker': 'HOW IT WORKS',
      'how.title': 'Not a chat box — a loop that takes action',
      'how.desc': 'Every task follows the same path: read the page → plan the steps → call the tools → write the result back. The whole run is visible, and you can stop it at any point.',
      'how.s1t': 'Read the page',
      'how.s1p': 'A content script reads the DOM, the article text, forms and page structure — plus screenshots when the visuals matter.',
      'how.s2t': 'Plan the steps',
      'how.s2p': 'The model plans a tool sequence through OpenAI-compatible function calling, instead of guessing blindly.',
      'how.s3t': 'Call the tools',
      'how.s3p': 'Click, type, select, scroll, wait for elements, navigate — 45 tools, loaded on demand.',
      'how.s4t': 'Write it back',
      'how.s4p': 'The answer lands in the page or the side panel, and a working flow can be saved as a skill for next time.',
      'how.loopBadge': 'Agent Loop',
      'how.loopText': 'User message → model → tools → results fed back → repeat, until the task is done or the iteration cap is reached.',

      'feat.kicker': 'CAPABILITIES',
      'feat.title': 'Six things it actually does for you',
      'feat.desc': 'Not a feature-list dump — just the handful of things you will use every day.',
      'feat.c1t': 'Operates the page on its own',
      'feat.c1p': 'Clicks buttons, fills forms, switches dropdowns, waits for async elements, navigates across pages. Every run is shown step by step, and each call\u2019s arguments and result stay inspectable.',
      'feat.done': '✓ Done',
      'feat.c2t': 'Full-page and selection translation',
      'feat.c2p': 'Translates paragraph by paragraph and can write bilingual blocks back into the page; double-click a word for its meaning, or select a passage for an instant translation.',
      'feat.c3t': 'Cross-session memory',
      'feat.c3p': 'Preferences, site quirks and lessons learned accumulate on their own, so a new session already has context. Past 50 entries, compress them in one click.',
      'feat.c4t': 'Skill library',
      'feat.c4p': 'Save a multi-step flow that worked as a skill, import and export it as Markdown, and share it directly with your team.',
      'feat.c5t': 'Script skills',
      'feat.c5p': 'Add new tools to it in JavaScript, running inside a controlled sandbox, able to call external APIs and process complex data.',
      'feat.c6t': 'Scheduled tasks',
      'feat.c6p': 'One-off, interval, daily or weekly — let checkups, digests and reminders happen by themselves.',
      'feat.c7t': 'API traffic analysis',
      'feat.c7p': 'Lists the page\u2019s API requests from browser performance data and aggregates them by domain, path and status code to surface the slowest and heaviest calls — so you can tell at a glance whether a click really fired a request.',

      'models.kicker': 'BRING YOUR OWN MODEL',
      'models.title': 'Your model, your endpoint',
      'models.desc': 'Preset providers fill in the base URL for you, and you can add any OpenAI-compatible endpoint by hand. The main model and the translation model are configured separately, with four levels of thinking depth.',
      'models.p4': 'Volcano Engine',
      'models.p5': 'SiliconFlow',
      'models.compat': 'OpenAI-compatible ↗',
      'models.foot': 'API keys stay in browser local storage, and requests go straight to the address you configured — no intermediary service.',

      'install.kicker': 'GET STARTED',
      'install.title': 'Three steps to a running agent',
      'install.desc': 'You need Node.js and a recent Chrome that supports the Side Panel API.',
      'install.s1t': 'Clone and build',
      'install.s1p': 'The repository still goes by the NeonAgent name.',
      'install.s2t': 'Load the extension',
      'install.s2p': 'Open <code class="inline">chrome://extensions</code>, turn on Developer mode, click “Load unpacked”, and select the build output directory.',
      'install.hint2': 'Once it is loaded, click the toolbar icon to open the side panel.',
      'install.s3t': 'Connect a model',
      'install.s3p': 'Add a provider in Settings, fill in the Base URL, API key and model name, then give it your first instruction in the input box.',
      'install.tryLabel': 'TRY SAYING',
      'install.tryText': '“Read this page, boil it down to three points, and save them as a note.”',
      'install.cta1': 'Read the full documentation ↗',
      'install.cta2': 'View the source',

      'faq.kicker': 'FAQ',
      'faq.title': 'What you might want to know',
      'faq.q1': 'Which browser do I need?',
      'faq.a1': 'The project is built on the Chrome Side Panel API, so it needs a recent Chrome (or a Chromium-based browser) that supports the side panel. It installs as an unpacked extension and is not on the Web Store yet.',
      'faq.q2': 'Can I use my own model?',
      'faq.a2': 'Yes. Settings let you add any OpenAI-compatible endpoint, with presets for Kimi, MiniMax, DeepSeek, Volcano Engine and SiliconFlow. The main model, translation model, temperature, max tokens and thinking level are each configurable.',
      'faq.q3': 'Where does page content get sent?',
      'faq.a3': 'Only the page content needed for model processing is sent to the endpoint you configured. Configuration, conversations, memory and skills stay in browser local storage and never pass through a third-party server. Do check the data policy of whichever provider you choose.',
      'faq.q4': 'Will it click around when I am not watching?',
      'faq.a4': 'Every tool call is shown step by step in the side panel, and you can hit stop at any moment. Scheduled tasks and auto-solving are explicit switches, off by default.',
      'faq.q5': 'How is this different from an ordinary AI sidebar?',
      'faq.a5': 'An ordinary sidebar can only talk. omniagent has a set of tools that act on the current page — reading and writing the DOM, simulating interaction, driving forms — so it can actually finish the job instead of only suggesting.',

      'final.title': 'Hand off the repetitive part',
      'final.desc': 'Keep the part that needs judgement for yourself.',
      'final.cta1': 'Install now',
      'final.cta2': 'GitHub ↗',

      'foot.back': 'Back to blog',
      'foot.copy': 'omniagent · a personal open-source project, not affiliated with any model provider',
      'foot.privacy': 'Terms & Privacy',

      'common.copy': 'Copy',
      'common.copied': 'Copied ✓',

      'theme.toLight': 'Switch to light mode',
      'theme.toDark': 'Switch to dark mode'
    }
  };

  /* ============================================================
     2. demo scenarios (per language)
     ============================================================ */

  var SCENARIOS = {
    zh: {
      research: {
        url: 'article.example.com/deep-work',
        instruction: '读一下这篇长文，提炼 3 条核心观点，整理成笔记存起来。',
        steps: [
          { call: 'get_page_info', detail: '标题、URL 与页面结构已读取', target: '#page-title', delay: 620 },
          { call: 'read_page_content', detail: '提取正文 4,812 字', target: '[data-block="body"]', delay: 900 },
          { call: 'save_memory', detail: '写入记忆：研究笔记 / 深度工作', target: '[data-block="quote"]', delay: 700 }
        ],
        result: {
          heading: 'RESULT · 笔记',
          items: [
            '注意力是稀缺资源，保护它比延长工时更有效',
            '把查找、复制、整理交出去，人留在难题里',
            '用「不被打断的 90 分钟区块」衡量一天'
          ],
          foot: '已保存为笔记，可继续追问或导出。'
        }
      },
      translate: {
        url: 'article.example.com/deep-work',
        instruction: '把整页翻译成中文，用双语对照写在每一段原文下方。',
        steps: [
          { call: 'translate_current_page', detail: '按段落串行翻译，共 12 段', target: '[data-block="intro"]', delay: 900 },
          { call: 'write_bilingual_translation_to_page', detail: '对照块已写回页面 · stacked 布局', target: '[data-block="body"]', delay: 900 },
          { call: 'update_bilingual_translation_on_page', detail: '原地校正 2 处术语', target: '[data-block="body2"]', delay: 720 }
        ],
        result: {
          heading: 'RESULT · 翻译',
          items: [
            '原文保留，译文作为对照块插入段落下方',
            '图片、视频、iframe、广告位自动跳过',
            '双击单词或划选一段，可单独出译文'
          ],
          foot: '共处理 12 段，跳过 3 个非正文容器。'
        }
      },
      skill: {
        url: 'article.example.com/deep-work',
        instruction: '这套流程以后每周一都要做一遍，存成技能，叫「周报素材整理」。',
        steps: [
          { call: 'create_skill', detail: '保存 4 个步骤与标签', target: '[data-block="side"]', delay: 780 },
          { call: 'run_skill', detail: '立即回放一次做验证', target: '[data-block="body2"]', delay: 900 },
          { call: 'create_scheduled_task', detail: '每周一 09:00 · weekly', target: '[data-block="quote"]', delay: 720 }
        ],
        result: {
          heading: 'RESULT · 技能',
          items: [
            '技能「周报素材整理」v1 · 已保存',
            '步骤可直接执行，也能继续用自然语言调整',
            '已挂上每周一 09:00 的定时任务'
          ],
          foot: '下次只需要一句「跑一下周报素材整理」。'
        }
      }
    },

    en: {
      research: {
        url: 'article.example.com/deep-work',
        instruction: 'Read this long article, pull out three key points, and save them as a note.',
        steps: [
          { call: 'get_page_info', detail: 'Title, URL and page structure read', target: '#page-title', delay: 620 },
          { call: 'read_page_content', detail: 'Extracted 4,812 characters of body text', target: '[data-block="body"]', delay: 900 },
          { call: 'save_memory', detail: 'Saved memory: research notes / deep work', target: '[data-block="quote"]', delay: 700 }
        ],
        result: {
          heading: 'RESULT · NOTE',
          items: [
            'Attention is scarce — protect it instead of working longer',
            'Hand off searching, copying and tidying; stay in the hard part',
            'Measure the day in uninterrupted 90-minute blocks'
          ],
          foot: 'Saved as a note — keep asking, or export it.'
        }
      },
      translate: {
        url: 'article.example.com/deep-work',
        instruction: 'Translate the whole page into Chinese, with bilingual blocks under each paragraph.',
        steps: [
          { call: 'translate_current_page', detail: 'Translating 12 paragraphs in sequence', target: '[data-block="intro"]', delay: 900 },
          { call: 'write_bilingual_translation_to_page', detail: 'Bilingual blocks written back · stacked layout', target: '[data-block="body"]', delay: 900 },
          { call: 'update_bilingual_translation_on_page', detail: 'Fixed two terminology mismatches in place', target: '[data-block="body2"]', delay: 720 }
        ],
        result: {
          heading: 'RESULT · TRANSLATION',
          items: [
            'Original text kept, translation inserted below each paragraph',
            'Images, video, iframes and ad slots skipped',
            'Double-click a word or select a passage for a one-off translation'
          ],
          foot: '12 paragraphs processed, three non-article containers skipped.'
        }
      },
      skill: {
        url: 'article.example.com/deep-work',
        instruction: 'I will need this every Monday — save it as a skill called “Weekly digest prep”.',
        steps: [
          { call: 'create_skill', detail: 'Saved four steps and tags', target: '[data-block="side"]', delay: 780 },
          { call: 'run_skill', detail: 'Replayed once to verify', target: '[data-block="body2"]', delay: 900 },
          { call: 'create_scheduled_task', detail: 'Every Monday 09:00 · weekly', target: '[data-block="quote"]', delay: 720 }
        ],
        result: {
          heading: 'RESULT · SKILL',
          items: [
            'Skill “Weekly digest prep” v1 · saved',
            'Steps run directly, or keep adjusting them in natural language',
            'Scheduled task attached for Mondays at 09:00'
          ],
          foot: 'Next time it is just: “run the weekly digest prep”.'
        }
      }
    }
  };

  /* ============================================================
     3. language state
     ============================================================ */

  var STORAGE_KEY = 'omniagent-lang';
  var lang = 'zh';

  function detectLang() {
    var saved = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
    if (saved === 'zh' || saved === 'en') return saved;
    var nav = (navigator.language || navigator.userLanguage || 'zh').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function t(key) {
    var table = I18N[lang] || I18N.zh;
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : (I18N.zh[key] || key);
  }

  /* apply the current language to the document */
  function applyLang(next, opts) {
    lang = next;
    var html = document.documentElement;

    html.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    // text nodes
    var textNodes = document.querySelectorAll('[data-i18n]');
    Array.prototype.forEach.call(textNodes, function (node) {
      var key = node.getAttribute('data-i18n');
      var val = t(key);
      if (val) node.textContent = val;
    });

    // nodes that need inline markup
    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    Array.prototype.forEach.call(htmlNodes, function (node) {
      var key = node.getAttribute('data-i18n-html');
      var val = t(key);
      if (val) node.innerHTML = val;
    });

    // copy buttons carry their own label
    Array.prototype.forEach.call(document.querySelectorAll('.copy'), function (btn) {
      if (!btn.classList.contains('done')) btn.textContent = t('common.copy');
    });

    // the theme switch's label is prose, so it follows the language too
    syncThemeToggle();

    // document metadata
    var meta = META[lang] || META.zh;
    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('property', 'og:title', meta.ogTitle);
    setMeta('property', 'og:description', meta.ogDescription);

    // toggle button shows the language you would switch TO
    var label = document.getElementById('lang-label');
    if (label) label.textContent = lang === 'zh' ? 'EN' : '中文';

    if (opts && opts.persist) {
      try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
    }

    if (opts && opts.animate) {
      var btn = document.getElementById('lang-toggle');
      if (btn) {
        btn.classList.remove('switching');
        void btn.offsetWidth;
        btn.classList.add('switching');
      }
    }
  }

  function setMeta(attr, value, content) {
    var el = document.querySelector('meta[' + attr + '="' + value + '"]');
    if (el) el.setAttribute('content', content);
  }

  /* ============================================================
     4. demo
     ============================================================ */

  var stage = document.getElementById('demo');
  if (stage) initDemo();

  function initDemo() {
    var el = {
      url: document.getElementById('omni-url'),
      bubble: document.getElementById('user-bubble'),
      block: document.getElementById('agent-block'),
      steps: document.getElementById('agent-steps'),
      result: document.getElementById('agent-result'),
      placeholder: document.getElementById('panel-placeholder'),
      cursor: document.getElementById('ghost-cursor'),
      page: document.querySelector('.page'),
      chips: Array.prototype.slice.call(document.querySelectorAll('.chip[data-scenario]')),
      replay: document.getElementById('replay')
    };

    var runToken = 0;    // increments on every run; stale chains bail out
    var timers = [];     // { id, resolve, kind }
    var current = 'research';
    var started = false;

    /* ---- cancellable timing ------------------------------------- */

    function wait(ms, me) {
      return new Promise(function (resolve) {
        var entry = { resolve: resolve, kind: 'timeout' };
        entry.id = setTimeout(function () {
          var at = timers.indexOf(entry);
          if (at > -1) timers.splice(at, 1);
          resolve();
        }, ms);
        timers.push(entry);
        if (me !== runToken) cancelTimers();
      });
    }

    function cancelTimers() {
      var pending = timers.slice();
      timers.length = 0;
      pending.forEach(function (entry) {
        if (entry.kind === 'timeout') clearTimeout(entry.id);
        else clearInterval(entry.id);
        entry.resolve();
      });
    }

    /* ---- typewriter --------------------------------------------- */

    function typeInto(node, text, speed, me) {
      return new Promise(function (resolve) {
        if (reduceMotion || speed <= 0) {
          node.textContent = text;
          resolve();
          return;
        }
        var caret = document.createElement('span');
        caret.className = 'caret';
        caret.textContent = '\u00a0';
        node.textContent = '';
        node.appendChild(caret);

        var i = 0;
        var entry = { kind: 'interval', resolve: resolve };
        entry.id = setInterval(function () {
          if (me !== runToken) { finish(); return; }
          i += 1;
          node.textContent = text.slice(0, i);
          node.appendChild(caret);
          if (i >= text.length) finish();
        }, speed);
        timers.push(entry);

        function finish() {
          clearInterval(entry.id);
          var at = timers.indexOf(entry);
          if (at > -1) timers.splice(at, 1);
          if (caret.parentNode) caret.remove();
          if (me === runToken) node.textContent = text;
          resolve();
        }
      });
    }

    /* ---- page cursor + highlight -------------------------------- */

    function clearHighlight() {
      Array.prototype.forEach.call(el.page.querySelectorAll('[data-hit]'), function (n) {
        n.removeAttribute('data-hit');
      });
    }

    function moveCursor(selector) {
      var target = selector ? el.page.querySelector(selector) : null;
      if (!target) return;
      if (el.cursor) {
        var pr = el.page.getBoundingClientRect();
        var tr = target.getBoundingClientRect();
        var x = tr.left - pr.left + Math.min(tr.width * 0.42, 130);
        var y = tr.top - pr.top + Math.max(16, Math.min(tr.height * 0.5, tr.height - 12));
        el.cursor.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
        el.cursor.classList.add('is-on');
      }
      clearHighlight();
      target.setAttribute('data-hit', '');
    }

    function hideCursor() {
      if (el.cursor) el.cursor.classList.remove('is-on');
      clearHighlight();
    }

    /* ---- step rows ---------------------------------------------- */

    function addStep(step) {
      var row = document.createElement('div');
      row.className = 'step running';
      var mark = document.createElement('span');
      mark.className = 'mark';
      mark.textContent = '◌';
      var txt = document.createElement('span');
      txt.className = 'txt';
      var code = document.createElement('code');
      code.textContent = step.call;
      var small = document.createElement('small');
      small.textContent = step.detail;
      txt.appendChild(code);
      txt.appendChild(small);
      row.appendChild(mark);
      row.appendChild(txt);
      el.steps.appendChild(row);
      return row;
    }

    function completeStep(row) {
      if (!row) return;
      row.classList.remove('running');
      row.classList.add('done');
      row.querySelector('.mark').textContent = '✓';
    }

    /* ---- reset + run -------------------------------------------- */

    function reset() {
      el.bubble.textContent = '';
      el.bubble.setAttribute('data-empty', 'true');
      el.steps.innerHTML = '';
      el.result.innerHTML = '';
      el.result.hidden = true;
      el.block.hidden = true;
      el.placeholder.textContent = t('demo.placeholder');
      hideCursor();
    }

    function run(id) {
      var scenario = (SCENARIOS[lang] || SCENARIOS.zh)[id];
      if (!scenario) return;

      runToken += 1;
      var me = runToken;
      cancelTimers();
      reset();

      el.url.textContent = scenario.url;
      el.bubble.removeAttribute('data-empty');

      var alive = function () { return me === runToken; };

      typeInto(el.bubble, scenario.instruction, reduceMotion ? 0 : 26, me)
        .then(function () {
          if (!alive()) return null;
          return wait(reduceMotion ? 140 : 420, me);
        })
        .then(function () {
          if (!alive()) return;
          el.block.hidden = false;

          var chain = Promise.resolve(null);
          scenario.steps.forEach(function (step) {
            chain = chain.then(function (prev) {
              completeStep(prev);
              if (!alive()) return null;
              moveCursor(step.target);
              var row = addStep(step);
              return wait(reduceMotion ? 170 : step.delay, me).then(function () {
                return alive() ? row : null;
              });
            });
          });

          return chain.then(function (last) {
            if (alive()) completeStep(last);
          });
        })
        .then(function () {
          if (!alive()) return;
          var r = scenario.result;
          var html = '<h4>' + r.heading + '</h4><ul>';
          r.items.forEach(function (item) { html += '<li>' + item + '</li>'; });
          html += '</ul><div class="foot">' + r.foot + '</div>';
          el.result.innerHTML = html;
          el.result.hidden = false;
        });
    }

    /* ---- scenario switching ------------------------------------- */

    el.chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        el.chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        current = chip.getAttribute('data-scenario');
        run(current);
      });
    });

    if (el.replay) {
      el.replay.addEventListener('click', function () { run(current); });
    }

    /* ---- run once, when the stage scrolls into view -------------- */

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            run(current);
            io.disconnect();
          }
        });
      }, { threshold: 0.25 });
      io.observe(stage);
    } else {
      started = true;
      run(current);
    }

    // expose so a language switch can replay the demo in the new language
    window.__omniDemo = {
      replay: function () { run(current); },
      hasStarted: function () { return started; },
      restart: function () { started = true; run(current); }
    };
  }

  /* ============================================================
     5. theme (dark / light)
     ============================================================ */

  var THEME_KEY = 'omniagent-theme';
  var THEME_COLOR = { dark: '#08080b', light: '#fbfbfd' };
  var themeToggle = document.getElementById('theme-toggle');
  var themeAnimTimer = null;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  /* Keep the switch's state and its spoken label in sync with the document. */
  function syncThemeToggle() {
    if (!themeToggle) return;
    var dark = currentTheme() === 'dark';
    var label = t(dark ? 'theme.toLight' : 'theme.toDark');
    themeToggle.setAttribute('aria-checked', dark ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  function applyTheme(next, opts) {
    var theme = next === 'light' ? 'light' : 'dark';

    if (opts && opts.animate) {
      // crossfade only while flipping, so the transition never costs anything at rest
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

  // the head script already picked the theme; just sync meta + switch state
  applyTheme(currentTheme(), { persist: false });

  /* ============================================================
     6. language toggle
     ============================================================ */

  var langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(lang === 'zh' ? 'en' : 'zh', { persist: true, animate: true });
      // replay the preset demo so the side panel matches the new language
      if (window.__omniDemo && window.__omniDemo.hasStarted()) {
        window.__omniDemo.replay();
      }
    });
  }

  // initial language: stored preference, else browser language
  applyLang(detectLang(), { persist: false });

  /* ============================================================
     7. sticky nav
     ============================================================ */

  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ============================================================
     8. reveal on scroll
     ============================================================ */

  if ('IntersectionObserver' in window && !reduceMotion) {
    var targets = document.querySelectorAll(
      '.section-head, .pipeline li, .loop-note, .cards .card, .models h2, .models-copy, .model-row, .models-foot, .install-step, .install-cta, .faq details, .final h2, .final p, .final .cta-row'
    );
    Array.prototype.forEach.call(targets, function (node, i) {
      node.classList.add('reveal');
      node.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
    });

    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          ro.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(targets, function (node) { ro.observe(node); });

    // Safety net: content must never stay hidden if the observer never fires
    // (anchor jumps, print, embedded previews).
    var revealAll = function () {
      Array.prototype.forEach.call(targets, function (node) { node.classList.add('is-in'); });
    };
    setTimeout(revealAll, 2600);
    window.addEventListener('beforeprint', revealAll);
  }

  /* ============================================================
     9. copy buttons
     ============================================================ */

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  Array.prototype.forEach.call(document.querySelectorAll('.copy'), function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        btn.textContent = t('common.copied');
        btn.classList.add('done');
        setTimeout(function () {
          btn.textContent = t('common.copy');
          btn.classList.remove('done');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  /* ============================================================
     10. GitHub star count
     The markup ships with a baked-in count, so it renders without
     JS and never shifts. This refreshes it from the public API at
     most once an hour per browser (60 req/h unauthenticated).
     ============================================================ */

  var REPO = 'fredliu168/NeonAgent';
  var STAR_KEY = 'omniagent-stars';
  var STAR_TTL = 60 * 60 * 1000;

  function formatStars(n) {
    if (n < 1000) return String(n);
    var k = Math.round(n / 100) / 10;
    return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'k';
  }

  (function refreshStars() {
    var el = document.getElementById('gh-stars');
    if (!el || typeof window.fetch !== 'function') return;

    var cached = null;
    try {
      var raw = window.localStorage.getItem(STAR_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch (e) { cached = null; }

    if (cached && typeof cached.n === 'number') {
      el.textContent = '★ ' + formatStars(cached.n);
      if (Date.now() - cached.t < STAR_TTL) return;   // still fresh
    }

    window.fetch('https://api.github.com/repos/' + REPO, {
      headers: { Accept: 'application/vnd.github+json' }
    }).then(function (res) {
      return res && res.ok ? res.json() : null;
    }).then(function (data) {
      if (!data || typeof data.stargazers_count !== 'number') return;
      var n = data.stargazers_count;
      el.textContent = '★ ' + formatStars(n);
      el.setAttribute('title', 'GitHub Stars · ' + n);
      try {
        window.localStorage.setItem(STAR_KEY, JSON.stringify({ n: n, t: Date.now() }));
      } catch (e) { /* storage blocked */ }
    })['catch'](function () {
      /* offline or rate-limited: the baked-in count stays */
    });
  })();

  /* ============================================================
     11. misc
     ============================================================ */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
