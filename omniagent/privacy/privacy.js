/* ============================================================
   NeonAgent — terms & privacy page
   Deliberately standalone (a few KB) rather than pulling in app.js,
   which carries the whole landing-page demo. It shares the same
   localStorage keys so preferences carry across both pages:
     omniagent-theme : 'dark' | 'light'
     omniagent-lang  : 'zh'   | 'en'
   ============================================================ */
(function () {
  'use strict';

  var THEME_KEY = 'omniagent-theme';
  var LANG_KEY = 'omniagent-lang';
  var THEME_COLOR = { dark: '#08080b', light: '#f5f6f9' };

  /* the handful of chrome strings that live outside the document halves */
  var UI = {
    zh: {
      back: '← 返回主页',
      backShort: '← 返回主页',
      backShortHtml: '主页',
      copy: 'NeonAgent · 个人开源项目，与模型供应商无隶属关系',
      title: 'NeonAgent — 使用条款与隐私说明',
      themeToLight: '切换到浅色模式',
      themeToDark: '切换到深色模式'
    },
    en: {
      back: '← Back to home',
      backShort: '← Back to home',
      backShortHtml: 'Home',
      copy: 'NeonAgent · a personal open-source project, not affiliated with any model provider',
      title: 'NeonAgent — Terms of Use & Privacy',
      themeToLight: 'Switch to light mode',
      themeToDark: 'Switch to dark mode'
    }
  };

  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var langBtn = document.getElementById('lang-toggle');
  var langLabel = document.getElementById('lang-label');

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }

  /* ---------------- language ---------------- */

  function currentLang() {
    return root.getAttribute('lang') === 'en' ? 'en' : 'zh';
  }

  function applyLang(next, opts) {
    var lang = next === 'en' ? 'en' : 'zh';
    root.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

    var dict = UI[lang];
    Array.prototype.forEach.call(document.querySelectorAll('[data-ui]'), function (node) {
      var val = dict[node.getAttribute('data-ui')];
      if (val) node.textContent = val;
    });

    if (langLabel) langLabel.textContent = lang === 'zh' ? 'EN' : '中文';
    document.title = dict.title;

    if (opts && opts.persist) store(LANG_KEY, lang);
    syncThemeToggle();
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(currentLang() === 'zh' ? 'en' : 'zh', { persist: true });
    });
  }

  /* ---------------- theme ---------------- */

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncThemeToggle() {
    if (!themeToggle) return;
    var dark = currentTheme() === 'dark';
    var label = UI[currentLang()][dark ? 'themeToLight' : 'themeToDark'];
    themeToggle.setAttribute('aria-checked', dark ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  function applyTheme(next, opts) {
    var theme = next === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[theme]);

    syncThemeToggle();
    if (opts && opts.persist) store(THEME_KEY, theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', { persist: true });
    });
  }

  /* ---------------- init ---------------- */
  /* the head script already set data-theme and lang before first paint */
  applyTheme(currentTheme(), { persist: false });
  applyLang(currentLang(), { persist: false });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
