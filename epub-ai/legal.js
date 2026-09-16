/* ============================================================
   使用条款 / 隐私说明页的轻量脚本
   —— 只做两件事：主题切换、中英切换，沿用宣传页的 localStorage 键，
      所以从首页切到英文再点进法律页，语言是接着的。
   ============================================================ */
(function () {
  'use strict';

  var LANG_KEY = 'epub-ai-lang';
  var THEME_KEY = 'epub-ai-theme';
  var THEME_COLOR = { light: '#f7f3ee', dark: '#17130f' };
  var root = document.documentElement;
  var forEach = function (list, fn) { Array.prototype.forEach.call(list, fn); };
  var all = function (sel) { return document.querySelectorAll(sel); };

  var themeToggle = document.getElementById('theme-toggle');
  var lang = 'zh';

  /* ---------------- 主题 ---------------- */

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
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

  function applyTheme(next, persist) {
    var theme = next === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
    if (persist) {
      try { window.localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage blocked */ }
    }
    syncThemeToggle();
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ---------------- 语言 ---------------- */

  function detectLang() {
    var saved = null;
    try { saved = window.localStorage.getItem(LANG_KEY); } catch (e) { /* storage blocked */ }
    if (saved === 'zh' || saved === 'en') return saved;
    var nav = (navigator.language || 'zh').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function applyLang(next, persist) {
    lang = next === 'en' ? 'en' : 'zh';
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    forEach(all('[data-lang]'), function (block) {
      var on = block.getAttribute('data-lang') === lang;
      block.classList.toggle('is-on', on);
      if (on && block.hasAttribute('data-title')) document.title = block.getAttribute('data-title');
    });

    /* 导航、页脚这类零散文字：data-zh / data-en 成对出现 */
    forEach(all('[data-zh]'), function (node) {
      var text = node.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en');
      if (text) node.textContent = text;
    });

    var label = document.getElementById('lang-label');
    if (label) label.textContent = lang === 'zh' ? 'EN' : '中文';

    syncThemeToggle();

    if (persist) {
      try { window.localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage blocked */ }
    }
  }

  var langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(lang === 'zh' ? 'en' : 'zh', true);
    });
  }

  applyTheme(currentTheme(), false);
  applyLang(detectLang(), false);
})();
