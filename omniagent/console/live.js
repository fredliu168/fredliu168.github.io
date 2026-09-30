import { operationsPage, operationsSummary, mountOperations } from './operations.js?v=20260930-pages';
import { emailBindingForm, mountEmailBinding } from './email-binding.js?v=20260930-pages';
import { api, number as n, amountToCents, topupTokenQuote } from './api.js?v=20260930-pages';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const when = value => value ? new Date(value).toLocaleString('zh-CN', { hour12:false }) : '—';
const tag = (text, good = true) => `<span class="tag ${good ? 'green' : ''}">${esc(text)}</span>`;
const link = (route, text, cls = 'btn') => `<a href="#/${route}" class="${cls}">${text}</a>`;
const stat = (name, value, note) => `<div class="stat"><div class="stat-label">${name}</div><div class="stat-value">${esc(value)}</div><small>${note}</small></div>`;
const row = (name, value) => `<div class="settings-row"><strong>${name}</strong><span style="overflow-wrap:anywhere;text-align:right">${esc(value)}</span></div>`;
const title = (label, heading, text) => `<div class="page-head"><div><div class="eyebrow">${label}</div><h1 tabindex="-1">${heading}</h1><p>${text}</p></div><button class="btn small" data-live="refresh">刷新数据 ↻</button></div>`;
const userNav = [['overview','◫','账户概览'],['membership','✧','会员与权益'],['recharge','◈','Token 充值'],['usage','▥','用量明细'],['orders','▤','支付订单'],['settings','⚙','账户设置']];
const adminNav = [['admin','◫','系统总览'],['admin/operations','▥','运营数据'],['admin/users','◎','用户管理'],['admin/usage','▥','用量统计'],['admin/orders','▤','支付管理'],['admin/system','⚙','系统信息'],['settings','⚙','账户设置']];
let generation = 0;
let active = null;
let search = '';
let page = 1;
let operationsPeriod = '30';
let orderStatus = '';
let refreshingOrder = '';
let previousRoute = '';
let editedUser = null;
let savingUser = false;
let savingPaymentCatalog = false;
let cleanupEmailBinding = () => {};
export function cancelLive() { cleanupEmailBinding(); generation++; active = null; }
function shell(user, route, body) {
  const admin = route.startsWith('admin');
  const nav = admin && user.role === 'admin' ? adminNav : userNav;
  const current = nav.find(x => x[0] === route)?.[2] || (route.startsWith('admin/users/') ? '用户详情' : '用户中心');
  document.title = `${current} · NeonAgent`;
  return `<aside class="sidebar" id="sidebar"><a class="brand-console" href="../"><img src="../icon-64.png" alt="">NeonAgent</a><button class="btn small sidebar-close" data-action="close-menu">关闭导航 ×</button><div class="workspace-label">${admin && user.role === 'admin' ? 'ADMIN WORKSPACE' : 'PERSONAL WORKSPACE'}</div><nav class="side-nav" aria-label="账户导航">${nav.map(([path, icon, text]) => `<a href="#/${path}" class="${path === route ? 'active' : ''}" ${path === route ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span>${text}</a>`).join('')}</nav><div class="sidebar-bottom"><nav class="side-nav" aria-label="其他入口">${user.role === 'admin' ? link(admin ? 'overview' : 'admin', admin ? '↙ 我的账户' : '↗ 管理员后台', '') : ''}<a href="../">↗ 返回产品主页</a></nav><div class="account-chip"><div class="avatar">${user.role === 'admin' ? 'A' : 'N'}</div><div><strong>${esc(user.wechatName || user.email || '微信用户')}</strong><span>${user.role === 'admin' ? '管理员' : '普通用户'} · 已验证</span></div></div></div></aside><div class="console"><header class="topbar"><div class="actions"><button class="btn small mobile-menu" data-action="menu" aria-label="展开侧边导航" aria-expanded="false" aria-controls="sidebar">☰</button><span class="breadcrumb">${admin ? '管理后台' : '用户中心'}<b>/ ${current}</b></span></div><div class="actions">${tag('已登录')}<button class="theme-btn" data-action="theme" aria-label="切换深浅主题">${document.documentElement.dataset.theme === 'light' ? '☾' : '☀'}</button><button class="btn small" data-action="real-logout">退出登录</button></div></header><main class="page${route === 'admin/users' ? ' page-wide' : ''}" id="main">${user.emailBound === false && route !== 'settings' ? `<div class="preview-note"><span>绑定邮箱后，可使用邮箱验证码登录同一账号。</span>${link('settings','绑定邮箱 →','link')}</div>` : ''}${body}<p id="account-error" class="form-error" role="alert"></p><p class="footnote">NeonAgent · <a href="../privacy/">隐私政策</a></p></main></div>`;
}
function services(states) {
  const names = { authentication:'邮箱登录', membership:'会员服务', payments:'支付服务', models:'内置模型服务' };
  return `<section class="box"><div class="box-head"><h2>服务状态</h2></div>${Object.entries(names).map(([key,name]) => `<div class="settings-row"><strong>${name}</strong>${tag(states[key] === 'available' ? '已开放' : '尚未开放', states[key] === 'available')}</div>`).join('')}</section>`;
}
function profile(user) { return `<section class="box"><div class="box-head"><h2>账户资料</h2>${tag(user.emailBound === false ? '微信已验证' : '邮箱已验证')}</div>${user.wechatName ? row('微信昵称',user.wechatName) : ''}${row('电子邮箱',user.email || '未绑定')}${row('账号 ID',user.id)}${row('账户角色',user.role === 'admin' ? '管理员' : '普通用户')}${row('会员等级',user.plan === 'premium' ? '高级会员' : '免费会员')}${row('会员到期',user.membershipExpiresAt ? when(user.membershipExpiresAt) : '无')}${row('可用 Token',n(user.tokenBalance ?? 0))}${row('注册时间',when(user.createdAt))}</section>`; }
function sessionTable(sessions) {
  return `<section class="box table-box"><div class="box-head"><h2>有效登录会话</h2><span class="muted">${sessions.length} 个会话</span></div><div class="table-scroll"><table><thead><tr><th>登录时间</th><th>有效至</th><th>当前会话</th></tr></thead><tbody>${sessions.map(s => `<tr><td>${when(s.createdAt)}</td><td>${when(s.expiresAt)}</td><td>${s.current ? tag('当前登录') : tag('其他登录',false)}</td></tr>`).join('')}</tbody></table></div><div class="table-foot">有效会话表示尚未过期的登录凭证，不代表设备当前在线。</div></section>`;
}
function overview(data) {
  const current = data.sessions.find(s=>s.current);
  return `${title('YOUR WORKSPACE','欢迎回来。','以下账户与登录信息来自服务器。')}<div class="stats">${stat('会员等级',data.user.plan === 'premium' ? '高级会员':'免费会员','与管理员角色分别管理')}${stat('有效会话',n(data.sessions.length),'包含当前登录')}${stat('可用 Token',n(data.user.tokenBalance ?? 0),'管理员配置的可用余额')}${stat('支付总额','—','支付服务尚未开放')}</div><div class="two-col">${profile(data.user)}${services(data.services)}</div>${sessionTable(data.sessions)}<div class="callout">当前登录有效至 ${when(current?.expiresAt)}。在插件中配置自己的模型接口可继续使用已有功能。</div>`;
}
function userTable(items) {
  if (!items.length) return '<div class="empty"><strong>没有匹配的用户</strong>请调整搜索条件。</div>';
  return `<div class="table-scroll"><table><thead><tr><th>用户邮箱</th><th>角色</th><th>会员等级 / Token</th><th>状态</th><th>注册时间</th><th>有效会话</th><th>操作</th></tr></thead><tbody>${items.map(u=>`<tr><td>${esc(u.email)}</td><td>${u.role === 'admin' ? '管理员':'普通用户'}</td><td>${u.plan === 'premium' ? '高级会员' : '免费会员'}<small>${n(u.tokenBalance ?? 0)} Token</small></td><td>${tag(u.disabled?'已停用':'正常',!u.disabled)}</td><td>${when(u.createdAt)}</td><td>${n(u.activeSessions)}</td><td>${link('admin/users/'+encodeURIComponent(u.id),'查看详情','link')}</td></tr>`).join('')}</tbody></table></div>`;
}
function adminOverview(data) {
  return `${title('ADMIN WORKSPACE','系统总览','用户与会话统计来自当前数据库。')}<div class="stats">${stat('用户总数',n(data.totalUsers),`管理员 ${n(data.administrators)} 人`)}${stat('近 7 天注册',n(data.newUsers7Days),'最近七天的新用户')}${stat('有效会话',n(data.activeSessions),'不含已停用账号')}${stat('已停用用户',n(data.disabledUsers),'当前账号状态')}</div><section class="box table-box"><div class="box-head"><h2>最新注册用户</h2>${link('admin/users','查看全部 →','link')}</div>${userTable(data.recentUsers)}</section><div class="two-col">${services(data.services)}${operationsSummary(data.operations)}</div><p class="muted">更新于 ${when(data.updatedAt)}</p>`;
}
function users(data) {
  const pages = Math.max(1,Math.ceil(data.total/data.pageSize));
  return `${title('USER MANAGEMENT','用户管理','搜索邮箱并查看用户资料与会话状态。')}<section class="box table-box"><form class="filters" id="live-user-search"><div class="field"><label for="live-search">邮箱搜索</label><input id="live-search" name="search" type="search" maxlength="254" placeholder="输入邮箱或邮箱片段" value="${esc(search)}"></div><button class="btn primary" type="submit">搜索</button><button class="btn" type="button" data-live="reset-search">重置</button></form>${userTable(data.items)}<div class="table-foot"><span>共 ${n(data.total)} 位用户 · 第 ${data.page} / ${pages} 页</span><div class="actions"><button class="btn small" data-live="previous" ${data.page<=1?'disabled':''}>上一页</button><button class="btn small" data-live="next" ${data.page>=pages?'disabled':''}>下一页</button></div></div></section>`;
}
function adminOrders(data) {
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const statusNames = { creating: '创建中', pending: '待支付', unknown: '待核对', paid: '已支付', closed: '已关闭' };
  const rows = data.items.map(order => `<tr>
    <td><strong>${esc(order.id)}</strong><small>${when(order.createdAt)}</small></td>
    <td>${link('admin/users/' + encodeURIComponent(order.userId), esc(order.wechatName || order.userEmail || order.userId), 'link')}${order.wechatName ? `<small>邮箱：${esc(order.userEmail || '未绑定')}</small>` : ''}<small>${esc(order.userId)}</small></td>
    <td>${esc(order.title || order.productId)}<small>${n(order.tokens)} Token</small></td>
    <td><strong>¥${(order.amountCents / 100).toFixed(2)}</strong></td>
    <td>${tag(statusNames[order.status] || order.status, order.status === 'paid')}<small>${order.fulfilledAt ? '权益已发放' : order.status === 'paid' ? '待履约' : '未到账'}</small></td>
    <td>${order.providerOrder ? `<small>平台单号：${esc(order.providerOrder)}</small>` : ''}${order.payNo ? `<small>支付流水：${esc(order.payNo)}</small>` : ''}${order.paidAt ? `<small>支付时间：${when(order.paidAt)}</small>` : ''}</td>
    <td>${['creating','pending','unknown'].includes(order.status) ? `<button class="btn small" data-live="refresh-order" data-id="${esc(order.id)}" ${refreshingOrder === order.id ? 'disabled' : ''}>${refreshingOrder === order.id ? '查询中…' : '查询状态'}</button>` : '—'}</td>
  </tr>`).join('');
  return `${title('PAYMENT MANAGEMENT','订购订单','查看所有用户的会员订购与 Token 充值订单；待支付订单可向支付平台查询状态。')}
    <section class="box table-box">
      <form class="filters" id="live-order-search">
        <div class="field"><label for="order-search">订单、平台流水或用户邮箱</label><input id="order-search" name="search" type="search" maxlength="254" placeholder="输入订单号、流水号或邮箱" value="${esc(search)}"></div>
        <div class="field"><label for="order-status">支付状态</label><select id="order-status" name="status">${[['','全部状态'],['creating','创建中'],['pending','待支付'],['unknown','待核对'],['paid','已支付'],['closed','已关闭']].map(([value,label]) => `<option value="${value}" ${orderStatus === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
        <button class="btn primary" type="submit">筛选订单</button><button class="btn" type="button" data-live="reset-orders">重置</button>
      </form>
      <div class="table-scroll"><table><thead><tr><th>商户订单号 / 下单时间</th><th>用户</th><th>商品</th><th>金额</th><th>支付 / 履约状态</th><th>平台信息</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="7"><div class="empty"><strong>暂无订购订单</strong>新订单会显示在这里。</div></td></tr>'}</tbody></table></div>
      <div class="table-foot"><span>共 ${n(data.total)} 笔订单 · 第 ${data.page} / ${pages} 页</span><div class="actions"><button class="btn small" data-live="previous" ${data.page<=1?'disabled':''}>上一页</button><button class="btn small" data-live="next" ${data.page>=pages?'disabled':''}>下一页</button></div></div>
    </section><div class="callout">金额、商品和订单状态来自支付订单记录。订单二维码不会在管理列表中公开展示。</div>`;
}
function userDetail(data) {
  const u=data.user; editedUser = u;
  return `${title('USER DETAILS','用户详情',esc(u.email))}<div class="actions" style="margin-bottom:20px">${link('admin/users','← 返回用户列表')}</div><div class="two-col">${profile(u)}<section class="box"><h2>账号状态</h2>${row('当前状态',u.disabled?'已停用':'正常')}${row('有效会话',n(u.activeSessions))}${row('最近保留的会话创建时间',when(u.lastSessionAt))}<div class="callout">已退出会话会被删除，此时间不代表完整的历史登录记录。</div></section></div>${editUserForm(u)}${auditTable(data.audit || [])}${services(data.services)}`;
}
function localDate(value) {
 const d = value ? new Date(value) : new Date();
 if (!value) d.setFullYear(d.getFullYear() + 1);
 const pad = n => String(n).padStart(2, '0');
 return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function editUserForm(u) {
 return `<section class="box"><h2>管理用户</h2><p class="muted">调整账号状态、会员期限和可用 Token。高级会员不会获得管理员权限。</p><form id="live-user-edit" class="admin-edit-form"><div class="field"><label for="edit-status">账号状态</label><select id="edit-status" name="disabled" ${active?.user.id === u.id ? 'disabled' : ''}><option value="false" ${!u.disabled?'selected':''}>正常</option><option value="true" ${u.disabled?'selected':''}>禁用（撤销已有登录）</option></select></div><div class="field"><label for="edit-plan">会员等级</label><select id="edit-plan" name="plan"><option value="free" ${u.plan==='free'?'selected':''}>免费会员</option><option value="premium" ${u.plan==='premium'?'selected':''}>高级会员</option></select></div><div class="field"><label for="edit-expiry">高级会员到期时间（本地时间）</label><input id="edit-expiry" name="expires" type="datetime-local" value="${localDate(u.plan==='premium'?u.membershipExpiresAt:null)}" ${u.plan==='premium'?'required':'disabled'}></div><div class="field"><label for="edit-tokens">当前可用 Token 余额</label><input id="edit-tokens" name="tokens" type="number" min="0" max="1000000000000" step="1" required value="${u.tokenBalance ?? 0}"></div><div class="field admin-edit-wide"><label for="edit-reason">操作原因（必填）</label><input id="edit-reason" name="reason" maxlength="500" required placeholder="例如：手动开通一年高级会员，配置 100 万 Token"></div><div class="callout admin-edit-wide">Token 数量会替换当前可用余额，并记录增减流水；不会自动赠送 100 万。降级不清除余额。进行中或待核对的请求处理完毕后才能修改余额。</div><p id="edit-error" class="form-error admin-edit-wide" role="alert"></p><div class="actions admin-edit-wide"><button type="submit" class="btn primary">保存用户设置</button><span id="edit-result" role="status"></span></div></form></section>`;
}
function auditTable(entries) {
 return `<section class="box table-box"><div class="box-head"><h2>最近管理记录</h2><span class="muted">最多 20 条</span></div>${entries.length?`<div class="table-scroll"><table><thead><tr><th>时间 / 操作人</th><th>变更</th><th>原因</th></tr></thead><tbody>${entries.map(a=>a.before.requestId ? `<tr><td>${when(a.createdAt)}<small>${esc(a.actor)}</small></td><td>模型用量核对<small>${esc(a.before.requestId)}</small>输入 ${n(a.after.promptTokens)} / 输出 ${n(a.after.completionTokens)}</td><td>${esc(a.reason)}</td></tr>` : `<tr><td>${when(a.createdAt)}<small>${esc(a.actor)}</small></td><td>${a.before.disabled?'禁用':'正常'} → ${a.after.disabled?'禁用':'正常'}<small>${a.before.plan==='premium'?'高级':'免费'} → ${a.after.plan==='premium'?'高级':'免费'}；到期 ${when(a.after.membershipExpiresAt)}</small><small>Token ${n(a.before.tokenBalance)} → ${n(a.after.tokenBalance)}</small></td><td style="white-space:normal;min-width:180px">${esc(a.reason)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">暂无管理记录</div>'}</section>`;
}
function yuan(cents) { return (cents / 100).toFixed(2).replace(/\.?0+$/, ''); }
function system(data, catalog) {
  const quick = catalog.quickAmountsCents.map(yuan).join(', ');
  return `${title('SYSTEM INFORMATION','系统信息','显示服务运行信息，不显示密钥或授权码。')}<section class="box"><div class="box-head"><h2>会员、充值与注册赠送</h2>${tag('支付已配置','green')}</div><p class="muted">修改后立即用于新订单。新用户首次注册赠送额度对邮箱与微信登录一致，每个账号只赠送一次。</p><form id="live-payment-catalog" class="admin-edit-form"><div class="field"><label for="catalog-registration-bonus">首次注册赠送 Token</label><input id="catalog-registration-bonus" name="registrationBonus" type="number" min="0" max="1000000000000" step="1" required value="${catalog.registrationBonusTokens}"></div><div class="field"><label for="catalog-annual-price">高级会员年费（元）</label><input id="catalog-annual-price" name="annualPrice" type="number" min="0.01" max="999999.99" step="0.01" required value="${yuan(catalog.premiumYear.amountCents)}"></div><div class="field"><label for="catalog-annual-tokens">年费赠送 Token</label><input id="catalog-annual-tokens" name="annualTokens" type="number" min="0" max="1000000000000" step="1" required value="${catalog.premiumYear.tokens}"></div><div class="field"><label for="catalog-minimum">最低充值金额（元）</label><input id="catalog-minimum" name="minimumTopup" type="number" min="0.01" max="999999.99" step="0.01" required value="${yuan(catalog.minimumTopupCents)}"></div><div class="field"><label for="catalog-topup-tokens">最低充值对应 Token</label><input id="catalog-topup-tokens" name="topupTokens" type="number" min="1" max="1000000000000" step="1" required value="${catalog.tokenTopup.tokens}"></div><div class="field admin-edit-wide"><label for="catalog-quick">快捷充值金额（元，逗号分隔，最多 8 项）</label><input id="catalog-quick" name="quickAmounts" required value="${quick}" placeholder="5, 10, 20"></div><p id="catalog-error" class="form-error admin-edit-wide" role="alert"></p><div class="actions admin-edit-wide"><button type="submit" class="btn primary" ${savingPaymentCatalog?'disabled':''}>${savingPaymentCatalog?'正在保存…':'保存商品配置'}</button><span id="catalog-result" role="status"></span></div></form><div class="callout">充值 Token 按金额与最低充值比例折算，向下取整。所有金额以人民币元输入。</div></section><div class="two-col"><section class="box"><h2>基础服务</h2>${row('系统名称',data.name)}${row('数据库',data.database)}${row('数据库状态',data.databaseStatus==='available'?'连接正常':'不可用')}${row('更新时间',when(data.updatedAt))}</section><section class="box"><h2>验证码邮件</h2>${row('SMTP 主机',data.smtp.host)}${row('端口',data.smtp.port)}${row('连接加密',data.smtp.security.toUpperCase())}${row('发件邮箱',data.smtp.sender)}${row('授权码',data.smtp.configured?'已配置（不显示内容）':'未配置')}<div class="callout">已配置不等于实时投递检查，此页面不会发送测试邮件。</div></section></div><section class="box"><h2>登录策略</h2>${row('验证码有效期',data.sessionPolicy.codeMinutes+' 分钟')}${row('访问凭证有效期',data.sessionPolicy.accessMinutes+' 分钟')}${row('登录会话有效期',data.sessionPolicy.sessionYears+' 年')}</section>${services(data.services)}`;
}
function membershipPage(user, catalog) {
  const annual = catalog.premiumYear, topup = catalog.tokenTopup;
  const rows = [['基础问答与划词翻译','✓','✓'],['自定义模型接口','✓','✓'],['内置 Token 充值',`¥${yuan(catalog.minimumTopupCents)} / ${n(topup.tokens)} Token`,`¥${yuan(catalog.minimumTopupCents)} / ${n(topup.tokens)} Token`],['整页自动翻译','—','✓'],['浏览器 Agent 多步操作','—','✓'],['年度赠送额度','无',`${n(annual.tokens)} Token`]];
  return `${title('MEMBERSHIP','适合你的，才是好方案。','价格和赠送额度来自支付服务当前配置。')}<div class="pricing-grid"><section class="box"><div class="box-head"><h2>免费会员</h2>${tag(user.plan==='free'?'当前方案':'基础方案',user.plan==='free')}</div><div class="plan-price">¥0 <small>/ 长期免费</small></div><p class="muted">基础功能与自定义模型接口。</p><ul class="benefits"><li>基础问答与划词、双击翻译</li><li>可购买内置 Token 用于基础功能</li><li>使用明细与订单随时可查</li></ul>${link('recharge','查看充值额度','btn full')}</section><section class="box recommended membership-box"><div class="box-head"><h2>高级会员</h2>${tag(user.plan==='premium'?'当前方案 · PRO':'解锁完整能力',user.plan==='premium')}</div><div class="plan-price">¥${yuan(annual.amountCents)} <small>/ 年</small></div><p class="muted">每个付费年度赠送 ${n(annual.tokens)} Token。</p><ul class="benefits"><li>包含全部免费会员功能</li><li>整页自动翻译、Agent 多步操作</li><li>技能复用、跨会话记忆与定时任务</li><li>自定义接口同样可使用高级功能</li></ul><div class="callout">支付二维码目前可在 NeonAgent 插件账户面板中创建；此处显示实时商品配置。</div></section></div><section class="box table-box"><div class="box-head"><h2>会员权益对比</h2></div><div class="table-scroll"><table class="comparison"><thead><tr><th>功能与权益</th><th>免费会员</th><th>高级会员</th></tr></thead><tbody>${rows.map(row=>`<tr>${row.map((value,index)=>`<td class="${index&&value==='✓'?'compare-yes':''}">${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section><div class="callout">主动续费，不自动扣款。充值不会解锁高级功能；充值额度长期有效，年度赠送额度按会员年度到期。</div>`;
}
function rechargePage(catalog) {
  const minimum = catalog.minimumTopupCents;
  return `${title('TOKEN RECHARGE','给下一次灵感，留足额度。','选择充值金额，Token 数量按后端当前比例计算。')}<section class="box purchase-card"><h2>内置 Token 充值</h2><p class="muted">每 ¥${yuan(minimum)} 获得 ${n(catalog.tokenTopup.tokens)} Token，充值额度长期有效；免费会员也可充值。</p><div class="actions" role="group" aria-label="快捷充值金额">${catalog.quickAmountsCents.map(amount=>`<button type="button" class="btn" data-topup-cents="${amount}">¥${yuan(amount)}</button>`).join('')}</div><div class="field" style="margin-top:20px"><label for="live-topup-amount">自定义充值金额（最低 ¥${yuan(minimum)}）</label><input id="live-topup-amount" type="number" min="${yuan(minimum)}" max="999999.99" step="0.01" value="${yuan(minimum)}"></div><p id="live-topup-preview" class="token-count" aria-live="polite">可获得 ${n(catalog.tokenTopup.tokens)} Token</p><div class="callout">当前网页账户中心暂不创建支付订单。请在 NeonAgent 插件账户面板完成支付。</div><a class="btn primary full" href="../#install">获取 NeonAgent 插件</a></section>`;
}
function unavailable(route,data) {
  const name=[...userNav,...adminNav].find(x=>x[0]===route)?.[2]||'页面';
  return `${title('SERVICE STATUS',name,'此功能的业务服务尚未开放。')}<section class="box"><h2>即将开放</h2><p class="muted">${['membership','recharge'].includes(route)?'高级会员 10 元/年，每个付费年度赠送 100 万 Token；充值包 5 元/100 万 Token。':'真实用量与支付数据将在对应服务接入后显示。'}</p><div class="callout">当前不支持付款，也不会产生演示订单。</div><div class="actions" style="margin-top:20px">${link(route.startsWith('admin')?'admin':'overview','返回概览')}<a class="btn" href="../#pricing">查看会员方案</a></div></section>${services(data.services)}`;
}
export async function renderLive(options) {
  cleanupEmailBinding();
  active=options;
  const {user,onUnauthorized}=options;
  const route=options.route==='login'?(user.role==='admin'?'admin':'overview'):options.route;
  if (route!==previousRoute && ['admin/users','admin/usage','usage','admin/orders'].includes(route)) {search='';page=1;orderStatus='';refreshingOrder='';} previousRoute=route;
  const ticket=++generation;
  const root=document.querySelector('#app');
  if (route.startsWith('admin') && user.role!=='admin') { root.innerHTML=shell(user,route,title('ACCESS DENIED','无权访问','管理员页面仅对管理员账号开放。')+link('overview','返回我的账户')); return; }
  root.innerHTML=shell(user,route,`<section class="box" role="status" aria-live="polite"><h2>正在加载</h2><p class="muted">正在获取最新信息…</p></section>`);
  try {
    let data,content;
    if (route==='admin') {const [overview,operations]=await Promise.all([api.adminOverview(),api.adminOperations('30')]);data={...overview,operations};content=adminOverview(data);}
    else if(route==='admin/operations'){data=await api.adminOperations(operationsPeriod);content=operationsPage(data);}
    else if(route==='admin/orders'){data=await api.adminPayments({page,search,status:orderStatus});content=adminOrders(data);}
    else if(route==='admin/users'){data=await api.adminUsers({page,search});content=users(data);}
    else if(route.startsWith('admin/users/')){data=await api.adminUser(decodeURIComponent(route.slice(12)));content=userDetail(data);}
    else if(route==='usage'||route==='admin/usage'){data=await api.usage({admin:route==='admin/usage',page,search});content=usagePage(data,route==='admin/usage');}
    else if(route==='admin/system'){[data,options.catalog]=await Promise.all([api.adminSystem(),api.adminPaymentCatalog()]);content=system(data,options.catalog);}
    else if(route==='membership'){[data,options.catalog]=await Promise.all([api.dashboard(),api.paymentCatalog()]);content=membershipPage(data.user,options.catalog);}
    else if(route==='recharge'){options.catalog=await api.paymentCatalog();content=rechargePage(options.catalog);}
    else if(route==='overview'||route==='settings'){data=await api.dashboard();content=route==='overview'?overview(data):title('ACCOUNT SETTINGS','账户设置','查看已验证资料和有效登录会话。')+profile(data.user)+emailBindingForm(data.user)+sessionTable(data.sessions);}
    else if([...userNav,...adminNav].some(x=>x[0]===route)){data=route.startsWith('admin')?await api.adminSystem():await api.dashboard();content=unavailable(route,data);}
    else {content=title('404','页面不存在','请从导航中选择页面。')+link('overview','返回概览');}
    if(ticket!==generation)return;
    if(data?.user?.id === user.id) Object.assign(user, data.user);
    root.innerHTML=shell(user,route,content);
    mountOperations({isCurrent:()=>ticket===generation,onUnauthorized,
      onPeriod:period=>{operationsPeriod=period;renderLive(options)},
      onSaved:async()=>{await renderLive(options);if(active===options&&document.querySelector('#pricing-status'))document.querySelector('#pricing-status').textContent='已保存，成本估算已按新配置更新。'}
    });
    cleanupEmailBinding = mountEmailBinding({user, isCurrent: () => ticket === generation, onUnauthorized,
      onBound: async (updated, merged) => {
        Object.assign(user, updated);
        await renderLive(options);
        if (active === options && document.querySelector('#account-error')) {
          const result = document.querySelector('#account-error');
          result.className = 'muted'; result.setAttribute('role', 'status'); result.textContent = merged ? '账号合并成功，可使用微信或邮箱登录同一账号。其他设备请重新登录。' : '邮箱绑定成功，可使用微信或邮箱登录。';
        }
      }
    });
  }catch(error){
    if(ticket!==generation)return;
    if(error.status===401){onUnauthorized(error.message);return;}
    root.innerHTML=shell(user,route,`${title('REQUEST FAILED',error.status===403?'无权访问':'暂时无法加载',esc(error.message))}<section class="box"><p>请检查连接，或稍后点击“刷新数据”重试。</p>${link('overview','返回我的账户')}</section>`);
  }
}
document.addEventListener('click',event=>{
 const target=event.target.closest('[data-live]');if(!target||!active)return;
 if(target.dataset.live==='reset-search'){search='';page=1;}
 if(target.dataset.live==='reset-orders'){search='';orderStatus='';page=1;}
 if(target.dataset.live==='previous')page=Math.max(1,page-1);
 if(target.dataset.live==='next')page++;
 if(target.dataset.live==='refresh-order'){
   const id=target.dataset.id;refreshingOrder=id;target.disabled=true;target.textContent='查询中…';
   const options=active;const ticket=generation;
   api.refreshAdminPayment(id).then(()=>{if(ticket===generation){refreshingOrder='';renderLive(options);}}).catch(error=>{if(ticket===generation){const root=document.querySelector('#account-error');if(root)root.textContent=error.message;refreshingOrder='';target.disabled=false;target.textContent='查询状态';}});
   return;
 }
 renderLive(active);
});
document.addEventListener('submit',event=>{
 const form=event.target;if(form.id!=='live-order-search'||!active)return;event.preventDefault();
 const values=new FormData(form);search=String(values.get('search')||'').trim();orderStatus=String(values.get('status')||'');page=1;renderLive(active);
});
document.addEventListener('submit',event=>{
 if(event.target.id!=='live-user-search'||!active)return;event.preventDefault();search=new FormData(event.target).get('search').trim();page=1;renderLive(active);
});

document.addEventListener('change', event => {
 if (event.target.id === 'edit-plan') { const input = document.querySelector('#edit-expiry'); input.disabled = event.target.value !== 'premium'; input.required = !input.disabled; }
});
document.addEventListener('submit', async event => {
 if (event.target.id !== 'live-user-edit' || !active || !editedUser) return;
 event.preventDefault(); if (savingUser) return;
 const form = event.target; const output = form.querySelector('#edit-error'); const values = new FormData(form);
 const balance = Number(values.get('tokens')); const reason = String(values.get('reason')).trim(); const plan = values.get('plan');
 if (!Number.isSafeInteger(balance) || balance < 0 || balance > 1000000000000 || !reason) { output.textContent = '请填写非负整数额度和操作原因。'; return; }
 let expiry = null;
 if (plan === 'premium') { const date = new Date(values.get('expires')); if (!Number.isFinite(date.getTime()) || date <= new Date()) { output.textContent = '请设置未来的会员到期时间。'; return; } expiry = date.toISOString(); }
 const ticket = generation; const options = active; const button = form.querySelector('[type="submit"]'); savingUser = true; button.disabled = true; button.textContent = '正在保存…'; output.textContent = '';
 try {
   await api.updateUser(editedUser.id, {disabled: values.get('disabled') === 'true', plan, membershipExpiresAt: expiry, tokenBalance: balance, version: editedUser.version, reason});
   if (ticket === generation) { await renderLive(options); const result = document.querySelector('#edit-result'); if(result)result.textContent = '已保存，设置已生效。'; }
 } catch (error) { if(ticket === generation) { if(error.status === 401) options.onUnauthorized(error.message); else output.textContent = error.message; } }
 finally { savingUser = false; button.disabled = false; button.textContent = '保存用户设置'; }
});

function usagePage(data,admin) {
 const summary=data.summary; const pages=Math.max(1,Math.ceil(data.total/data.pageSize));
 const labels={reserved:'进行中',settled:'已结算',failed:'未扣费',pending:'待核对'};
 const total=summary.usedTokens+summary.heldTokens+data.availableTokens;
 return `${title('MODEL USAGE',admin?'模型用量统计':'内置模型用量','以官方返回的输入 + 输出 Token 原始用量结算，不保存对话正文。')}<div class="stats">${stat('已消费 Token',n(summary.usedTokens),'已结算的官方用量')}${stat('预留 / 待核对',n(summary.heldTokens),'暂不可用，结算后退回差额')}${stat('调用次数',n(data.total),'包含失败和待核对请求')}${stat('待核对请求',n(summary.pendingRequests),'管理员核对后结算')}</div>${!admin?`<section class="box"><h2>当前可用 ${n(data.availableTokens)} Token</h2><progress value="${summary.usedTokens}" max="${Math.max(1,total)}" style="width:100%" aria-label="已消费 Token 比例"></progress><p class="muted">进度以已消费、可用和预留额度的合计为基准。${data.configured?'模型服务已配置':'管理员尚未配置模型密钥'}。</p></section>`:''}<section class="box table-box">${admin?`<form class="filters" id="live-user-search"><div class="field"><label for="live-search">用户邮箱</label><input id="live-search" name="search" value="${esc(search)}" maxlength="254"></div><button class="btn primary">搜索</button></form>`:''}<div class="table-scroll"><table><thead><tr><th>时间 / 请求</th>${admin?'<th>用户</th>':''}<th>模型 / 功能</th><th>输入 / 输出</th><th>状态 / 预留</th>${admin?'<th>核对</th>':''}</tr></thead><tbody>${data.items.map(item=>`<tr><td>${when(item.createdAt)}<small style="overflow-wrap:anywhere;max-width:220px;white-space:normal">${esc(item.id)}</small>${item.upstreamId?`<small style="overflow-wrap:anywhere;max-width:220px;white-space:normal">官方 ID：${esc(item.upstreamId)}</small>`:""}</td>${admin?`<td>${esc(item.email)}</td>`:''}<td>${esc(item.model)}<small>${esc(item.feature)}</small></td><td>${item.promptTokens===null?'—':n(item.promptTokens)} / ${item.completionTokens===null?'—':n(item.completionTokens)}<small>缓存命中：${item.cacheHitTokens==null?'未记录':n(item.cacheHitTokens)}</small></td><td>${tag(labels[item.status]||item.status,item.status==='settled')}<small>${n(item.reserved)} Token</small><small>${esc(item.errorCode)}</small></td>${admin?`<td>${item.status==='pending'?`<details><summary>核对用量</summary><form data-resolve="${esc(item.id)}"><p class="muted">请先核实官方用量；确认未消费时填 0。</p><label>输入 Token<input name="promptTokens" type="number" min="0" max="2000000" step="1" required></label><label>输出 Token<input name="completionTokens" type="number" min="0" max="2000000" step="1" required></label><label>缓存命中 Token（可选）<input name="cacheHitTokens" type="number" min="0" max="2000000" step="1"></label><label>核对依据<input name="reason" minlength="5" maxlength="500" required></label><button class="btn primary" type="submit">确认结算</button><p role="alert"></p></form></details>`:'—'}</td>`:''}</tr>`).join('')||`<tr><td colspan="6">暂无调用记录</td></tr>`}</tbody></table></div><div class="table-foot">第 ${page} / ${pages} 页<div class="actions"><button class="btn small" data-live="previous" ${page<=1?'disabled':''}>上一页</button><button class="btn small" data-live="next" ${page>=pages?'disabled':''}>下一页</button></div></div></section>`;
}
document.addEventListener('submit',async event=>{
 const form=event.target;if(!form.matches('form[data-resolve]')||!active)return;event.preventDefault();
 const button=form.querySelector('button');if(button.disabled)return;button.disabled=true;
 const values=new FormData(form);const ticket=generation;const options=active;
 try{await api.resolveUsage(form.dataset.resolve,{promptTokens:Number(values.get('promptTokens')),completionTokens:Number(values.get('completionTokens')),reason:String(values.get('reason')).trim(),...(values.get('cacheHitTokens')!==''?{cacheHitTokens:Number(values.get('cacheHitTokens'))}:{})});if(ticket===generation)await renderLive(options);}
 catch(error){if(ticket===generation){if(error.status===401)options.onUnauthorized(error.message);else form.querySelector('[role="alert"]').textContent=error.message;}}finally{button.disabled=false;}
});
document.addEventListener('input',event=>{
 if(event.target.id!=='live-topup-amount'||!active?.catalog)return;
 const catalog=active.catalog;const cents=parseCents(event.target.value);const preview=document.querySelector('#live-topup-preview');
 if(cents===null||cents<catalog.minimumTopupCents){preview.textContent=`请输入至少 ¥${yuan(catalog.minimumTopupCents)} 的金额`;return;}
 const tokens=topupTokenQuote(cents,catalog.minimumTopupCents,catalog.tokenTopup.tokens);
 if(tokens===null){preview.textContent='该充值金额对应的 Token 数量超出上限';return;}
 preview.textContent=`可获得 ${n(tokens)} Token`;
});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-topup-cents]');if(!button||!active?.catalog)return;
 const amount=document.querySelector('#live-topup-amount');amount.value=yuan(Number(button.dataset.topupCents));amount.dispatchEvent(new Event('input',{bubbles:true}));
});
document.addEventListener('submit',async event=>{
 const form=event.target;if(form.id!=='live-payment-catalog'||!active)return;event.preventDefault();if(savingPaymentCatalog)return;
 const values=new FormData(form);const error=form.querySelector('#catalog-error');const result=form.querySelector('#catalog-result');
 const annualPrice=amountToCents(values.get('annualPrice'));const minimum=amountToCents(values.get('minimumTopup'));const registrationBonus=Number(values.get('registrationBonus'));const annualTokens=Number(values.get('annualTokens'));const topupTokens=Number(values.get('topupTokens'));
 const quickRaw=String(values.get('quickAmounts')||'').split(',').map(value=>value.trim()).filter(Boolean);const quick=quickRaw.map(amountToCents);
 if(annualPrice===null||annualPrice<1||minimum===null||minimum<1||!Number.isSafeInteger(registrationBonus)||registrationBonus<0||registrationBonus>1e12||!Number.isSafeInteger(annualTokens)||annualTokens<0||annualTokens>1e12||!Number.isSafeInteger(topupTokens)||topupTokens<1||topupTokens>1e12||quick.length<1||quick.length>8||quick.some(amount=>amount===null||amount<minimum||amount>99999999)){
  error.textContent='请检查注册赠送 Token、商品金额、Token 数量和快捷充值金额；快捷金额需不少于最低充值额，且最多填写 8 项。';return;
 }
 savingPaymentCatalog=true;error.textContent='';result.textContent='正在保存…';form.querySelector('[type="submit"]').disabled=true;
 try{
  await api.updatePaymentCatalog({registrationBonusTokens:registrationBonus,premiumYearAmountCents:annualPrice,premiumYearTokens:annualTokens,minimumTopupCents:minimum,topupTokens,quickAmountsCents:quick});
  const options=active;savingPaymentCatalog=false;await renderLive(options);const saved=document.querySelector('#catalog-result');if(saved)saved.textContent='配置已保存并生效。';
 }catch(cause){error.textContent=cause.message||'保存失败，请稍后重试。';result.textContent='';}
 finally{savingPaymentCatalog=false;const submit=form.querySelector('[type="submit"]');if(submit){submit.disabled=false;submit.textContent='保存商品配置';}}
});
