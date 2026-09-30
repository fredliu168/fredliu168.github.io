import { startWechatLogin, stopWechatLogin } from './wechat-login.js?v=20260930-pages';
import { renderLive, cancelLive } from './live.js?v=20260930-pages';
import { api, number as n, money, products, seed, quota } from './api.js?v=20260930-pages';
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const storageKey = 'neonagent-console-demo-v1';
let state = null;
try { const saved = JSON.parse(sessionStorage.getItem(storageKey)); if (saved?.version === 1 && ['free', 'premium'].includes(saved.plan) && Array.isArray(saved.grants) && Array.isArray(saved.usage) && Array.isArray(saved.orders)) state = saved; } catch {}
let adminPreview = false;
let realUser = null;
let restoring = api.configured && api.hasSession();
let authNotice = '';
let challenge = null;
let retryAt = 0;
let sendingCode = false;
let verifyingCode = false;
let returnTo = !state && ['membership', 'recharge', 'usage', 'orders', 'settings'].includes(location.hash.replace(/^#\/?/, '')) ? location.hash.replace(/^#\/?/, '') : 'overview';
let filters = { feature: '', days: '30', status: '', search: '' };
let toastTimer;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const date = value => value ? new Date(value).toLocaleDateString('zh-CN') : '—';
const time = value => new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
const tag = (label, color = 'green') => `<span class="tag ${color}">${esc(label)}</span>`;
const statusLabels = { paid: '已支付', pending: '待支付', closed: '已关闭', settled: '已结算', failed: '失败 · 未扣费' };
const statusTag = status => tag(statusLabels[status] || status, status === 'paid' || status === 'settled' ? 'green' : status === 'pending' ? 'orange' : '');
const href = (path, text, cls = 'btn') => `<a href="#/${path}" class="${cls}">${text}</a>`;
const button = (action, text, cls = 'btn', extra = '') => `<button type="button" class="${cls}" data-action="${action}" ${extra}>${text}</button>`;
const stat = (label, value, caption, icon = '↗') => `<div class="stat"><div class="stat-label">${label}<span>${icon}</span></div><div class="stat-value">${value}</div><small>${caption}</small></div>`;
const empty = (title, description) => `<div class="empty"><strong>${title}</strong>${description}</div>`;
const head = (eyebrow, title, description, action = '') => `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1 tabindex="-1">${title}</h1><p>${description}</p></div>${action}</div>`;
const themeButton = () => button('theme', document.documentElement.dataset.theme === 'light' ? '☾' : '☀', 'theme-btn', 'aria-label="切换深浅主题"');
function persist() { try { sessionStorage.setItem(storageKey, JSON.stringify({ ...state, version: 1 })); } catch {} }
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4000); }
function showModal(content) { modal.innerHTML = `${button('close', '×', 'close', 'aria-label="关闭弹窗"')}${content}`; if (!modal.open) modal.showModal(); modal.querySelector('button')?.focus(); }
function currentRoute() { return location.hash.replace(/^#\/?/, '').split('?')[0] || 'overview'; }
const navItems = [['overview', '◫', '账户概览'], ['membership', '✧', '会员与权益'], ['recharge', '◈', 'Token 充值'], ['usage', '▥', '用量明细'], ['orders', '▤', '支付订单'], ['settings', '⚙', '账户设置']];
const adminItems = [['admin', '◫', '数据总览'], ['admin/users', '◎', '用户管理'], ['admin/usage', '▥', '用量统计'], ['admin/orders', '▤', '支付管理']];
function shell(content, route) {
  const isAdmin = route.startsWith('admin');
  const items = isAdmin ? adminItems : navItems;
  const title = items.find(i => i[0] === route)?.[2] || '用户中心';
  return `<aside class="sidebar" id="sidebar"><a class="brand-console" href="../"><img src="../icon-64.png" alt="">NeonAgent</a>${button('close-menu', '关闭导航 ×', 'btn small sidebar-close')}<div class="workspace-label">${isAdmin ? 'ADMIN WORKSPACE' : 'PERSONAL WORKSPACE'}</div><nav class="side-nav" aria-label="${isAdmin ? '管理' : '用户'}导航">${items.map(([path, icon, text]) => `<a href="#/${path}" class="${route === path ? 'active' : ''}" ${route === path ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span>${text}</a>`).join('')}</nav><div class="sidebar-bottom"><nav class="side-nav" aria-label="其他入口">${isAdmin ? href('overview', '<span class="nav-icon">↙</span>返回用户中心', '') : button('admin-preview', '管理后台演示', 'btn full') }<a href="../"><span class="nav-icon">↗</span>返回产品主页</a></nav><div class="account-chip"><div class="avatar">${isAdmin ? 'A' : 'N'}</div><div><strong>${isAdmin ? '管理员演示' : esc(state.email)}</strong><span>${isAdmin ? '仅展示虚构数据' : state.plan === 'premium' ? '高级会员 · 演示账号' : '免费会员 · 演示账号'}</span></div></div></div></aside><div class="console"><header class="topbar"><div class="actions">${button('menu', '☰', 'btn small mobile-menu', 'aria-label="展开侧边导航" aria-expanded="false" aria-controls="sidebar"')}<span class="breadcrumb">${isAdmin ? '管理后台' : '用户中心'} <b>/ &nbsp; ${title}</b></span></div><div class="actions">${tag('界面预览', 'purple')}${themeButton()}${button('logout', '退出演示', 'btn small')}</div></header><main id="main" class="page${route === 'admin/users' ? ' page-wide' : ''}"><div class="preview-note"><span>◉ &nbsp;演示环境 · 所有账号、用量与订单均为示例，不会发送邮件或产生真实付款。</span>${button('reset', '重置演示', 'link')}</div>${content}<p class="footnote">NeonAgent · 让浏览器替你把事情做完 &nbsp; / &nbsp; <a href="../privacy/">隐私政策</a></p></main></div>`;
}
function login() {
  stopWechatLogin();
  document.title = '登录 · NeonAgent';
  app.innerHTML = `<header class="login-header"><a class="brand-console" href="../"><img src="../icon-64.png" alt="">NeonAgent</a><div class="actions">${themeButton()}<a class="btn small" href="../">返回主页 ↗</a></div></header><main class="login-layout" id="main"><section class="login-copy"><div class="eyebrow">YOUR BROWSER. SUPERCHARGED.</div><h1>一个账号，<br>开启更多可能。</h1><p>管理你的会员、模型额度和每一次使用。<br>让琐碎的工作，留给你的浏览器搭档。</p><div class="login-orbit"><img src="../icon-192.png" alt="NeonAgent 图标"></div><ul class="benefits"><li>微信扫码或邮箱验证码登录</li><li>高级会员 ¥10 / 年，含 100 万 Token</li><li>也可以使用自己配置的大模型接口</li></ul></section><section class="login-card"><div class="eyebrow">WELCOME TO NEONAGENT</div><h2>登录或创建账号</h2><p>使用微信扫码或邮箱验证码登录，首次登录将创建账号。</p><div class="wechat-login"><button type="button" class="btn primary full" data-action="wechat-login">微信扫码登录</button><p id="wechat-login-status" role="status" aria-live="polite">在新窗口中扫码，完成后此页面会自动登录。</p><button type="button" class="link" data-action="wechat-cancel" hidden>取消微信登录</button></div><div class="login-divider">或使用邮箱验证码</div><form id="login-form"><div class="field"><label for="email">电子邮箱</label><input id="email" name="email" type="email" required autocomplete="email" placeholder="you@example.com" maxlength="254"></div><div class="field"><label for="code">邮箱验证码</label><div class="code-row"><input id="code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="one-time-code" placeholder="6 位验证码"><button class="btn" type="button" data-action="send-code">获取验证码</button></div></div><p id="login-error" class="form-error" role="alert">${esc(authNotice)}</p><button class="btn primary full" type="submit">验证并登录 →</button></form><p class="legal">登录状态有效期为一年，你可以随时退出。<a href="../privacy/" class="link">查看隐私政策</a></p><div class="demo-entry"><span class="tag purple">${api.configured ? '独立演示环境' : '登录服务待配置'}</span><p>也可以体验演示界面。演示无需输入邮箱，与真实账号数据分开。</p><div class="actions">${button('demo-premium', '体验高级会员', 'btn primary')}${button('demo-free', '体验免费会员', 'btn')}</div>${button('admin-preview', '查看管理后台演示 ↗', 'link', 'style="margin-top:16px;font-size:12px"')}</div></section></main>`;
}
function quotaCard() {
  const q = quota(state);
  return `<section class="box"><div class="box-head"><h2>内置 Token 额度</h2>${tag('deepseek-flash')}</div><div class="quota-amount">${n(q.remaining)} <small>Token 剩余</small></div><div class="meter" role="progressbar" aria-label="当前有效额度已用比例" aria-valuenow="${q.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${q.percent}%"></span></div><div class="meter-caption"><span>已用 ${n(q.used)} / ${n(q.total)}</span><span>${q.percent}% 已使用</span></div><div class="balance-breakdown"><div><small>年度赠送余额</small><b>${n(q.gift)}</b><small>${q.giftExpiry ? date(q.giftExpiry) + ' 到期' : '暂无有效赠送余额'}</small></div><div><small>充值余额</small><b>${n(q.paid)}</b><small>长期有效 · 会员到期仍可用</small></div></div>${q.remaining === 0 ? '<div class="callout">暂无内置额度，可充值或在插件中配置自己的模型接口。</div>' : q.percent >= 80 ? '<div class="callout">额度即将用完，建议提前充值，或切换自定义模型。</div>' : ''}<div class="actions" style="margin-top:22px">${href('recharge', '充值 Token ↗', 'btn primary')}${href('usage', '查看用量', 'btn')}</div></section>`;
}
function usageTable(rows, admin = false) {
  return rows.length ? `<div class="table-scroll"><table><thead><tr>${admin ? '<th>用户</th>' : ''}<th>时间 / 请求</th><th>功能</th><th>输入 Token</th><th>输出 Token</th><th>合计</th><th>状态</th></tr></thead><tbody>${rows.map(r => `<tr>${admin ? `<td>${esc(r.email || state.email)}</td>` : ''}<td>${time(r.date)}<small>${esc(r.id)}</small></td><td>${esc(r.feature)}</td><td>${n(r.input)}</td><td>${n(r.output)}</td><td><strong>${n(r.input + r.output)}</strong></td><td>${statusTag(r.status)}</td></tr>`).join('')}</tbody></table></div>` : empty('暂无使用记录', '尝试调整筛选条件。自定义接口的调用不会计入内置额度。');
}
function overview() {
  const q = quota(state); const used = state.usage.reduce((s, r) => s + r.input + r.output, 0);
  return `${head('YOUR WORKSPACE', '你好，欢迎回来。', '把账户打理好，让你的智能体继续专注工作。', href('membership', '查看会员权益 ↗'))}<div class="stats">${stat('当前会员', state.plan === 'premium' ? '高级会员' : '免费会员', state.expires ? date(state.expires) + ' 到期' : '随时升级，解锁更多功能', '✧')}${stat('可用 Token', n(q.remaining), '赠送 + 充值有效余额', '◈')}${stat('累计消耗', n(used), '输入与输出 Token 合计', '▥')}${stat('累计实付', money(state.orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.amount, 0)), '仅统计已支付演示订单', '▤')}</div><div class="two-col">${quotaCard()}<section class="box membership-box"><div class="box-head"><h2>让日常工作，更进一步</h2>${tag('PRO', 'purple')}</div><div class="big-price">¥10 <small>/ 年</small></div><p class="muted">每个付费年度赠送 100 万 Token</p><ul class="benefits"><li>浏览器 Agent 多步自主操作</li><li>整页自动翻译与双语阅读</li><li>技能复用、跨会话记忆、定时任务</li><li>内置模型与自定义接口自由选择</li></ul>${href('membership', state.plan === 'premium' ? '管理会员 →' : '了解高级会员 →', 'btn full')}</section></div><section class="box table-box"><div class="box-head"><h2>最近使用</h2>${href('usage', '查看全部 →', 'link')}</div>${usageTable(state.usage.slice(0, 4))}</section>`;
}
function membership() {
  const rows = [['基础问答、划词 / 双击翻译', '✓', '✓'], ['自定义大模型接口', '✓', '✓'], ['充值内置 Token', '¥5 / 100 万', '¥5 / 100 万'], ['整页自动翻译', '—', '✓'], ['浏览器 Agent 多步操作', '—', '✓'], ['技能复用、跨会话记忆、定时任务', '—', '✓'], ['年度赠送额度', '无', '100 万 Token'], ['使用记录与支付订单', '✓', '✓']];
  return `${head('MEMBERSHIP', '适合你的，才是好方案。', '从基础使用开始，或让智能体替你完成更多事情。')}<div class="pricing-grid"><section class="box"><div class="box-head"><h2>免费会员</h2>${state.plan === 'free' ? tag('当前方案') : tag('基础方案', '')}</div><div class="plan-price">¥0 <small>/ 长期免费</small></div><p class="muted">轻量使用，自由选择模型。</p><ul class="benefits"><li>基础问答与划词、双击翻译</li><li>支持自定义模型接口</li><li>可购买内置 Token 用于基础功能</li><li>使用明细与订单随时可查</li></ul>${href('recharge', '购买内置额度', 'btn full')}</section><section class="box recommended membership-box"><div class="box-head"><h2>高级会员</h2>${tag(state.plan === 'premium' ? '当前方案 · PRO' : '解锁完整能力')}</div><div class="plan-price">¥10 <small>/ 年</small></div><p class="muted">每个付费年度赠送 100 万 Token。</p><ul class="benefits"><li>包含全部免费会员功能</li><li>整页自动翻译、Agent 多步操作</li><li>技能复用、跨会话记忆、定时任务</li><li>自定义接口同样可使用高级功能</li></ul>${button('buy-annual', state.plan === 'premium' ? '续费一年 · ¥10' : '开通高级会员 · ¥10', 'btn primary full')}<small style="display:block;margin-top:10px;text-align:center">主动续费，不自动扣款</small></section></div><section class="box table-box"><div class="box-head"><h2>每一项权益，清清楚楚</h2></div><div class="table-scroll"><table class="comparison"><thead><tr><th>功能与权益</th><th>免费会员</th><th>高级会员</th></tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td class="${i && v === '✓' ? 'compare-yes' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section><div class="callout">赠送额度按所属会员年度到期，充值额度长期有效。会员到期后仍可充值并使用基础功能；自定义接口不消耗内置额度，也不改变会员功能权限。提前续费在演示中顺延有效期，下一年度赠送额度尚未生效。</div>`;
}
function recharge() {
  return `${head('TOKEN BALANCE', '给下一次灵感，留足额度。', '按需购买，没有自动扣费。免费会员也可以充值。')}<div class="two-col"><section class="box membership-box purchase-card"><div class="box-head"><h2>内置 Token 充值包</h2>${tag('长期有效')}</div><p class="muted">DeepSeek 官方模型 · deepseek-flash</p><div class="token-count">1,000,000</div><p class="muted">Token / 包</p><ul class="benefits"><li>按输入 + 输出的原始 Token 合计扣减</li><li>充值额度长期有效，不随会员到期清零</li><li>基础问答与翻译均可使用</li><li>高级功能仍需有效的高级会员资格</li></ul><div class="purchase-meta"><strong>¥5 <small style="font-size:13px;font-weight:400">/ 包</small></strong>${button('buy-tokens', '购买充值包 →', 'btn primary')}</div></section><section class="box"><h2>关于额度，你可能想知道</h2><div class="settings-row"><div><strong>100 万 Token 不是 100 万字</strong><p>Token 是模型计量单位，实际消耗包括输入内容、历史上下文和模型输出。</p></div></div><div class="settings-row"><div><strong>赠送和充值分别记录</strong><p>演示展示两类余额。实际扣减顺序与结算由后端账本统一执行。</p></div></div><div class="settings-row"><div><strong>已有自己的 API Key？</strong><p>在插件设置中配置服务商、接口地址和模型。费用由所选服务商收取。</p></div></div><div class="callout">支付服务尚未开放。预览只创建本地演示订单，不收款、不发放真实权益。</div></section></div>${quotaCard()}`;
}
function filterRows(rows) { const cutoff = Date.now() - Number(filters.days) * 86400000; return rows.filter(r => new Date(r.date) >= cutoff && (!filters.feature || r.feature === filters.feature)); }
function usage(admin = false) {
  const rows = filterRows(state.usage); const input = rows.reduce((s, r) => s + r.input, 0); const output = rows.reduce((s, r) => s + r.output, 0);
  return `${head(admin ? 'USAGE ANALYTICS' : 'USAGE HISTORY', admin ? '每一次调用，都有迹可循。' : '额度花在哪里，一目了然。', '仅统计内置模型实际用量；演示中使用固定示例记录。', button('export-usage', '导出 CSV ↓'))}<div class="stats">${stat('筛选范围内总消耗', n(input + output), '输入 + 输出原始 Token')}${stat('输入 Token', n(input), '包含上下文输入')}${stat('输出 Token', n(output), '包含已计入输出的思考 Token')}${stat('模型请求数', rows.length, '包含未扣费的失败请求')}</div><section class="box table-box"><div class="filters"><div class="field"><label for="days">时间范围</label><select id="days" data-filter="days">${[['7', '最近 7 天'], ['30', '最近 30 天'], ['90', '最近 90 天']].map(([v, t]) => `<option value="${v}" ${filters.days === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div><div class="field"><label for="feature">功能来源</label><select id="feature" data-filter="feature">${['', '基础问答', '划词翻译', '整页翻译', '浏览器 Agent'].map(v => `<option value="${v}" ${filters.feature === v ? 'selected' : ''}>${v || '全部功能'}</option>`).join('')}</select></div>${button('clear-filters', '重置筛选')}</div>${usageTable(rows, admin)}<div class="table-foot"><span>共 ${rows.length} 条记录 · deepseek-flash</span><span>示例数据</span></div></section><div class="callout">缓存命中与思考内容属于输入、输出的细分时，不重复计数。自定义接口的实际用量请在对应服务商查看。</div>`;
}
function orderTable(rows, admin = false) {
  return rows.length ? `<div class="table-scroll"><table><thead><tr><th>订单号 / 时间</th>${admin ? '<th>用户</th>' : ''}<th>商品</th><th>金额</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows.map(o => `<tr><td>${esc(o.id)}<small>${time(o.created)}</small></td>${admin ? `<td>${esc(state.email)}</td>` : ''}<td>${products[o.product].title}</td><td>${money(o.amount)}</td><td>${statusTag(o.status)}</td><td>${button('order-detail', '查看详情', 'link', `data-id="${esc(o.id)}"`)}</td></tr>`).join('')}</tbody></table></div>` : empty('暂无相关订单', '调整筛选，或前往会员与充值页面体验下单流程。');
}
function orders(admin = false) {
  const rows = state.orders.filter(o => (!filters.status || o.status === filters.status) && (!filters.search || o.id.toLowerCase().includes(filters.search.toLowerCase())));
  return `${head(admin ? 'PAYMENT MANAGEMENT' : 'YOUR ORDERS', admin ? '支付与到账，逐笔核对。' : '每一笔支付，都清晰可查。', '开通会员、续费和 Token 充值订单统一记录。')}<section class="box table-box"><div class="filters"><div class="field"><label for="search">订单号</label><input id="search" type="search" data-filter="search" placeholder="搜索订单号，按回车确认" value="${esc(filters.search)}"></div><div class="field"><label for="status">支付状态</label><select id="status" data-filter="status">${[['', '全部状态'], ['paid', '已支付'], ['pending', '待支付'], ['closed', '已关闭']].map(([v, t]) => `<option value="${v}" ${filters.status === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>${button('clear-filters', '重置筛选')}</div>${orderTable(rows, admin)}<div class="table-foot"><span>共 ${rows.length} 笔订单</span><span>金额单位：人民币</span></div></section><div class="callout">真实支付接入 YunGouOS，权益以服务端核验到账为准。退款与已消费额度处理规则尚待确定，当前不提供退款操作。</div>`;
}
function settings() {
  return `${head('ACCOUNT SETTINGS', '账户设置', '管理登录与账户信息。')}<section class="box"><div class="settings-row"><div><strong>电子邮箱</strong><p>${esc(state.email)} · 演示身份，未进行真实验证</p></div>${tag('演示账号', 'purple')}</div><div class="settings-row"><div><strong>登录会话</strong><p>正式服务的登录会话有效期为一年。演示状态仅保存在当前浏览器标签页会话中。</p></div>${button('logout', '退出演示')}</div><div class="settings-row"><div><strong>主题外观</strong><p>与产品主页共享深色 / 浅色偏好。</p></div>${themeButton()}</div><div class="settings-row"><div><strong>自定义模型接口</strong><p>请在 Chrome 插件的设置中配置。此页面不收集或保存你的 API Key。</p></div><a class="btn small" href="../#install">安装插件 ↗</a></div></section><section class="box"><h2>演示场景</h2><p class="muted">切换将重置当前演示订单与额度，便于检查不同会员的界面状态。</p><div class="actions">${button('demo-free', '切换免费会员')}${button('demo-premium', '切换高级会员')}</div></section>`;
}
function adminOverview() {
  const q = quota(state); const paid = state.orders.filter(o => o.status === 'paid'); const sum = state.usage.reduce((s, r) => s + r.input + r.output, 0);
  const bars = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); const total = state.usage.filter(r => date(r.date) === date(d)).reduce((s, r) => s + r.input + r.output, 0); return { label: `${d.getMonth() + 1}/${d.getDate()}`, total }; });
  const max = Math.max(1, ...bars.map(b => b.total));
  return `${head('ADMIN WORKSPACE', '运营全貌，尽在这里。', '当前展示一个虚构用户的可核对数据，所有统计来自同一份演示账本。', tag('管理员演示', 'purple'))}<div class="stats">${stat('用户总数', '1', state.plan === 'premium' ? '高级会员 1 人' : '免费会员 1 人')}${stat('累计支付收入', money(paid.reduce((s, o) => s + o.amount, 0)), `${paid.length} 笔已支付订单`)}${stat('累计 Token 消耗', n(sum), '内置模型 · 输入 + 输出')}${stat('请求失败率', `${state.usage.length ? Math.round(state.usage.filter(r => r.status === 'failed').length / state.usage.length * 100) : 0}%`, '按示例请求计算')}</div><div class="two-col"><section class="box"><div class="box-head"><h2>最近 7 天 Token 消耗</h2><span class="muted">Token</span></div><div class="chart" role="img" aria-label="${bars.map(b => `${b.label}：${b.total} Token`).join('；')}">${bars.map(b => `<div class="chart-column"><span>${b.total ? (b.total / 1000) + 'k' : '0'}</span><div class="chart-bar" style="height:${b.total / max * 100}px"></div><small>${b.label}</small></div>`).join('')}</div></section><section class="box"><h2>服务概况</h2><div class="settings-row"><div><strong>支付与模型服务</strong><p>尚未接入 · 当前仅为前端演示</p></div>${tag('未连接', '')}</div><div class="settings-row"><div><strong>模型成本估算</strong><p>待接入调用时价格与缓存细分数据</p></div><span class="muted">—</span></div><p class="admin-identity muted" style="margin-top:15px">生产环境管理权限必须由后端验证，演示入口不代表真实管理权限。</p></section></div><section class="box table-box"><div class="box-head"><h2>最近支付订单</h2>${href('admin/orders', '支付管理 →', 'link')}</div>${orderTable(state.orders.slice(0, 4), true)}</section>`;
}
function users() {
  const show = !filters.search || state.email.includes(filters.search.toLowerCase()); const q = quota(state);
  return `${head('USER MANAGEMENT', '了解用户的使用情况。', '按邮箱查找用户，查看会员、余额、用量和订单。')}<section class="box table-box"><div class="filters"><div class="field"><label for="search">邮箱搜索</label><input id="search" type="search" data-filter="search" value="${esc(filters.search)}" placeholder="输入邮箱，按回车确认"></div>${button('clear-filters', '重置')}</div>${show ? `<div class="table-scroll"><table><thead><tr><th>用户</th><th>会员</th><th>到期时间</th><th>可用 Token</th><th>累计支付</th><th>操作</th></tr></thead><tbody><tr><td>${esc(state.email)}<small>DEMO-USER-001</small></td><td>${tag(state.plan === 'premium' ? '高级会员' : '免费会员', state.plan === 'premium' ? 'green' : '')}</td><td>${date(state.expires)}</td><td>${n(q.remaining)}</td><td>${money(state.orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.amount, 0))}</td><td>${button('user-detail', '查看详情', 'link')}</td></tr></tbody></table></div>` : empty('没有匹配的用户', '请调整邮箱搜索条件。')}<div class="table-foot"><span>共 ${show ? 1 : 0} 位用户</span><span>只读演示</span></div></section>`;
}

function completeLogin(user) {
  stopWechatLogin();
  realUser = user; state = null; adminPreview = false; challenge = null; authNotice = '';
  try { sessionStorage.removeItem(storageKey); } catch {}
  location.hash = realUser.role === 'admin' ? '/admin' : '/overview';
  render();
}

function renderAccount() {
  renderLive({ user: realUser, route: currentRoute(), onUnauthorized: message => {
    realUser = null; state = null; authNotice = message; location.hash = '/login'; render();
  }});
}
function updateCodeButton() {
  const btn = document.querySelector('[data-action="send-code"]'); if (!btn) return;
  const seconds = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
  btn.disabled = sendingCode || seconds > 0;
  btn.textContent = sendingCode ? '发送中…' : seconds > 0 ? `${seconds} 秒后重发` : '获取验证码';
}
setInterval(updateCodeButton, 1000);
async function restoreAccount() {
  if (!restoring) return;
  try { realUser = await api.me(); state = null; if (realUser.role === 'admin' && ['login', 'overview'].includes(currentRoute())) location.hash = '/admin'; }
  catch (error) { authNotice = error.message; }
  finally { restoring = false; render(); }
}

function render() {
  const route = currentRoute();
  if (restoring) { app.innerHTML = '<main class="login-card" style="max-width:480px;margin:15vh auto"><h2>正在恢复登录</h2><p role="status">正在验证你的会话，请稍候…</p></main>'; return; }
  if (realUser) { renderAccount(); return; }
  cancelLive();
  if (route === 'login' || !state) { login(); return; }
  if (route.startsWith('admin') && !adminPreview) {
    app.innerHTML = shell(`${head('ADMIN PREVIEW', '管理后台演示', '该入口仅展示虚构数据，不授予任何真实权限。')}<section class="box"><p class="muted">进入后可查看用户、用量和支付情况。正式管理员必须通过后端身份校验。</p>${button('admin-preview', '进入只读管理演示', 'btn primary')}</section>`, route); return;
  }
  const pages = { overview, membership, recharge, usage, orders, settings, admin: adminOverview, 'admin/users': users, 'admin/usage': () => usage(true), 'admin/orders': () => orders(true) };
  const content = pages[route] ? pages[route]() : `${head('404', '页面没有找到', '这个地址可能已经变化。', href('overview', '返回账户概览'))}`;
  app.innerHTML = shell(content, route);
  document.title = `${[...navItems, ...adminItems].find(i => i[0] === route)?.[2] || '页面未找到'} · NeonAgent`;
}
function enterDemo(plan, admin = false) { stopWechatLogin(); realUser = null; challenge = null; state = seed(plan); persist(); adminPreview = admin; location.hash = admin ? '/admin' : '/' + returnTo; returnTo = 'overview'; render(); }
function orderDetail(id) {
  const order = state.orders.find(o => o.id === id); if (!order) return;
  showModal(`<h2 id="modal-title">订单详情</h2>${tag('演示订单', 'purple')}<div class="detail-row"><span class="muted">订单号</span><span>${esc(order.id)}</span></div><div class="detail-row"><span class="muted">商品</span><span>${products[order.product].title}</span></div><div class="detail-row"><span class="muted">创建时间</span><span>${time(order.created)}</span></div><div class="detail-row"><span class="muted">支付状态</span>${statusTag(order.status)}</div><div class="detail-row"><span class="muted">金额</span><strong>${money(order.amount)}</strong></div><div class="detail-row"><span class="muted">权益到账</span><span>${order.fulfilled ? '已发放演示权益' : '尚未发放'}</span></div><div class="callout">仅为本地演示记录，无真实支付流水。</div><div class="actions">${order.status === 'pending' && !currentRoute().startsWith('admin') ? button('pay-order', '继续演示支付', 'btn primary', `data-id="${esc(id)}"`) + button('cancel-order', '关闭订单', 'btn', `data-id="${esc(id)}"`) : button('close', '关闭', 'btn full')}</div>`);
}
function checkout(product, existing) {
  let order = existing;
  if (!order) {
    order = { id: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`, product, amount: products[product].amount, status: 'pending', created: new Date().toISOString(), fulfilled: false };
    state.orders.unshift(order); persist(); render();
  }
  showModal(`<h2 id="modal-title">确认演示订单</h2><p class="muted">${products[order.product].title}</p><div class="payment-symbol">◈</div><div class="payment-total">${money(order.amount)}</div><p style="text-align:center" class="muted">${products[order.product].description}</p><div class="callout">支付尚未开放，不会生成付款码或扣款。下方按钮只模拟服务端确认后的界面状态。</div><div class="actions">${button('complete-payment', '模拟支付成功', 'btn primary full', `data-id="${esc(order.id)}"`)}${button('payment-failed', '模拟支付失败', 'btn full')}${button('close', '稍后处理', 'link')}</div>`);
}
function completePayment(id) {
  const order = state.orders.find(o => o.id === id); if (!order || order.status !== 'pending') return;
  order.status = 'paid'; order.fulfilled = true;
  if (order.product === 'tokens') state.grants.push({ id: order.id, kind: '充值', total: 1000000, used: 0, expires: null });
  else {
    const active = state.expires && new Date(state.expires) > new Date();
    const start = active ? new Date(state.expires) : new Date(); const end = new Date(start); end.setFullYear(end.getFullYear() + 1);
    state.plan = 'premium'; state.expires = end.toISOString();
    // Future grants are tracked separately; quota() must not count them early.
    if (!active) state.grants.push({ id: order.id, kind: '赠送', total: 1000000, used: 0, expires: end.toISOString() });
    else { order.futureGrant = { total: 1000000, starts: start.toISOString(), expires: end.toISOString() }; state.grants.push({ id: order.id, kind: '赠送', used: 0, ...order.futureGrant }); }
  }
  persist(); render();
  showModal(`<div class="success"><div class="payment-symbol">✓</div><h2 id="modal-title">演示支付完成</h2><p class="muted">${order.product === 'tokens' ? '已增加 100 万演示 Token，长期有效。' : order.futureGrant ? '会员已顺延一年。新年度的 100 万赠送额度将在该年度开始时生效。' : '高级会员已开通，100 万演示 Token 已到账。'}</p><div class="callout">没有真实扣款，也没有发放真实权益。</div><div class="actions">${button('view-orders', '查看订单', 'btn primary full')}</div></div>`);
}
function exportUsage() {
  const rows = filterRows(state.usage); const values = [['请求 ID', '时间', '功能', '输入 Token', '输出 Token', '合计', '状态'], ...rows.map(r => [r.id, r.date, r.feature, r.input, r.output, r.input + r.output, statusLabels[r.status]])];
  const csv = '\uFEFF' + values.map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'neonagent-demo-usage.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('已导出演示用量明细');
}
document.addEventListener('click', async event => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); const main = document.querySelector('#main'); main.setAttribute('tabindex', '-1'); main.focus(); return; }
  const target = event.target.closest('[data-action]'); if (!target) return;
  const action = target.dataset.action;
  if (action === 'wechat-login') { if (!verifyingCode) void startWechatLogin(completeLogin); return; }
  if (action === 'wechat-cancel') { stopWechatLogin(); return; }
  if (action === 'theme') { const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = theme; try { localStorage.setItem('omniagent-theme', theme); } catch {} document.querySelectorAll('[data-action="theme"]').forEach(b => b.textContent = theme === 'light' ? '☾' : '☀'); return; }
  if (action === 'close') return modal.close();
  if (action === 'close-menu') { document.querySelector('#sidebar').classList.remove('open'); document.querySelector('[data-action="menu"]')?.setAttribute('aria-expanded', 'false'); return; }
  if (action === 'menu') { const open = document.querySelector('#sidebar').classList.toggle('open'); target.setAttribute('aria-expanded', String(open)); return; }
  if (action === 'demo-premium' || action === 'demo-free') return enterDemo(action === 'demo-free' ? 'free' : 'premium');
  if (action === 'admin-preview') { if (!state) return enterDemo('premium', true); adminPreview = true; location.hash = '/admin'; render(); return; }
  if (action === 'logout') { state = null; adminPreview = false; returnTo = 'overview'; try { sessionStorage.removeItem(storageKey); } catch {} modal.close(); location.hash = '/login'; render(); return; }
  if (action === 'real-logout') {
    target.disabled = true;
    try { await api.logout(); realUser = null; state = null; authNotice = ''; challenge = null; try { sessionStorage.removeItem(storageKey); } catch {} location.hash = '/login'; render(); }
    catch (error) { document.querySelector('#account-error').textContent = '退出未完成：' + error.message; target.disabled = false; } return;
  }
  if (action === 'send-code') {
    const email = document.querySelector('#email'); if (sendingCode || Date.now() < retryAt || !email.reportValidity()) return;
    const requestedEmail = email.value.trim().toLowerCase(); sendingCode = true; updateCodeButton();
    const output = document.querySelector('#login-error'); output.textContent = '';
    try {
      const result = await api.sendCode(requestedEmail);
      retryAt = Date.now() + result.retryAfter * 1000;
      if (document.querySelector('#email')?.value.trim().toLowerCase() === requestedEmail) {
        challenge = { id: result.challengeId, email: requestedEmail }; document.querySelector('#code').value = ''; output.textContent = ''; toast('验证码已发送，请查看收件箱或垃圾邮件。');
      } else { challenge = null; if (document.contains(output)) output.textContent = '邮箱已变化，请为当前邮箱重新获取验证码。'; }
    } catch (error) { challenge = null; if (error.retryAfter) retryAt = Date.now() + error.retryAfter * 1000; if (document.contains(output)) output.textContent = error.message; }
    finally { sendingCode = false; updateCodeButton(); } return;
  }
  if (!state) return;
  if (action === 'reset') { showModal(`<h2 id="modal-title">重置演示数据？</h2><p class="muted">本次演示新增的订单和额度将清除，恢复初始高级会员场景。</p><div class="actions">${button('confirm-reset', '重置', 'btn primary')}${button('close', '取消')}</div>`); return; }
  if (action === 'confirm-reset') { modal.close(); state = seed('premium'); persist(); render(); toast('演示数据已重置'); return; }
  if (action === 'buy-annual' || action === 'buy-tokens') return checkout(action === 'buy-annual' ? 'annual' : 'tokens');
  if (action === 'order-detail') return orderDetail(target.dataset.id);
  if (action === 'pay-order') return checkout(null, state.orders.find(o => o.id === target.dataset.id));
  if (action === 'complete-payment') return completePayment(target.dataset.id);
  if (action === 'payment-failed') { modal.close(); toast('演示支付失败，未扣款、未发放额度；可在订单中重试。'); return; }
  if (action === 'cancel-order') { const o = state.orders.find(o => o.id === target.dataset.id); if (o?.status === 'pending') o.status = 'closed'; persist(); render(); orderDetail(target.dataset.id); return; }
  if (action === 'view-orders') { modal.close(); location.hash = '/orders'; render(); return; }
  if (action === 'clear-filters') { filters = { days: '30', feature: '', status: '', search: '' }; render(); return; }
  if (action === 'export-usage') return exportUsage();
  if (action === 'user-detail') { const q = quota(state); showModal(`<h2 id="modal-title">用户详情</h2>${tag('虚构用户', 'purple')}<div class="detail-row"><span>邮箱</span><strong>${esc(state.email)}</strong></div><div class="detail-row"><span>会员</span><span>${state.plan === 'premium' ? '高级会员' : '免费会员'}</span></div><div class="detail-row"><span>可用额度</span><strong>${n(q.remaining)}</strong></div><div class="detail-row"><span>赠送 / 充值余额</span><span>${n(q.gift)} / ${n(q.paid)}</span></div><div class="actions">${button('user-usage', '查看使用记录', 'btn primary')}${button('user-orders', '查看支付记录')}</div><div class="callout">管理演示为只读，不提供禁用账号或修改余额操作。</div>`); return; }
  if (action === 'user-usage' || action === 'user-orders') { modal.close(); filters = { days: '30', feature: '', status: '', search: '' }; location.hash = action === 'user-usage' ? '/admin/usage' : '/admin/orders'; }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') { document.querySelector('#sidebar')?.classList.remove('open'); document.querySelector('[data-action="menu"]')?.setAttribute('aria-expanded', 'false'); } });
document.addEventListener('input', event => { if (event.target.id === 'email' && challenge && event.target.value.trim().toLowerCase() !== challenge.email) challenge = null; });
document.addEventListener('change', event => { if (event.target.dataset.filter) { filters[event.target.dataset.filter] = event.target.value.trim(); render(); } });
document.addEventListener('submit', async event => {
  if (event.target.id !== 'login-form') return; event.preventDefault(); if (verifyingCode) return;
  const output = document.querySelector('#login-error'); const email = document.querySelector('#email').value.trim().toLowerCase();
  if (!challenge || challenge.email !== email) { output.textContent = '请先为当前邮箱获取验证码。'; return; }
  stopWechatLogin();
  const btn = event.target.querySelector('[type="submit"]'); btn.disabled = true; verifyingCode = true; btn.textContent = '正在验证…'; output.textContent = '';
  try { completeLogin(await api.verifyCode({ challengeId: challenge.id, code: document.querySelector('#code').value.trim() })); }
  catch (error) { if (document.contains(output)) output.textContent = error.message; }
  finally { verifyingCode = false; btn.disabled = false; btn.textContent = '验证并登录 →'; }
});
window.addEventListener('hashchange', () => { modal.close(); filters = { days: '30', feature: '', status: '', search: '' }; render(); window.scrollTo(0, 0); app.querySelector('h1')?.focus({ preventScroll: true }); });
modal.addEventListener('click', event => { if (event.target === modal && (event.clientX < modal.getBoundingClientRect().left || event.clientX > modal.getBoundingClientRect().right || event.clientY < modal.getBoundingClientRect().top || event.clientY > modal.getBoundingClientRect().bottom)) modal.close(); });
render();
restoreAccount();
