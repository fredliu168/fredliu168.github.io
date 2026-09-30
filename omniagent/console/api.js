// Public API adapter. Real sessions and local demo data use separate storage.
export class ServiceUnavailable extends Error {
  constructor() { super('登录服务尚未配置，请稍后再试。也可以先体验演示界面。'); }
}
const base = (globalThis.NEONAGENT_CONFIG?.apiBaseURL || '').replace(/\/$/, '');
const sessionKey = 'neonagent-auth-v1:' + base;
let refreshing;
function readSession() { try { return JSON.parse(localStorage.getItem(sessionKey)); } catch { return null; } }
function saveSession(session) { try { localStorage.setItem(sessionKey, JSON.stringify(session)); } catch { throw new Error('浏览器未允许保存登录状态，请开启此站点的本地存储后重试。'); } }
function clearSession() { try { localStorage.removeItem(sessionKey); } catch {} }
function validateBase() {
  if (!base) throw new ServiceUnavailable();
  const u = new URL(base);
  if (u.username || u.password || u.search || u.hash || (u.protocol !== 'https:' && !(u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname)))) throw new Error('登录 API 地址需要 HTTPS，本地调试可使用 localhost HTTP。');
}
async function request(path, { body, token, method = 'POST' } = {}) {
  validateBase();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 28000);
  try {
    const response = await fetch(base + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined, credentials: 'omit', cache: 'no-store', signal: controller.signal });
    let data; try { data = await response.json(); } catch { throw new Error('服务返回格式不正确，请检查 API 地址。'); }
    if (!response.ok) { const error = new Error(data.error?.message || '服务暂时不可用，请稍后重试。'); error.status = response.status; error.retryAfter = data.error?.retryAfter || Number(response.headers.get('Retry-After')) || 0; throw error; }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('请求超时，请稍后重试。若验证码邮件已收到，可重新获取后验证。');
    if (error instanceof TypeError) throw new Error('无法连接登录服务，请检查网络后重试。');
    throw error;
  } finally { clearTimeout(timer); }
}
async function ensureAccess(force = false, staleToken = null) {
  const run = async () => {
    const session = readSession();
    if (!session?.refreshToken) { const e = new Error('请先登录。'); e.status = 401; throw e; }
    if ((!force || (staleToken && session.accessToken !== staleToken)) && Date.parse(session.accessExpiresAt) > Date.now() + 30000) return session;
    try { const next = await request('/auth/refresh', { body: { refreshToken: session.refreshToken } }); saveSession(next); return next; }
    catch (error) { if (error.status === 401) clearSession(); throw error; }
  };
  if (!refreshing) refreshing = (globalThis.navigator?.locks ? navigator.locks.request('neonagent-refresh:' + base, run) : run()).finally(() => { refreshing = null; });
  return refreshing;
}
async function authenticatedGet(path, options = {}) {
  let session = await ensureAccess();
  try { return await request(path, { method: 'GET', ...options, token: session.accessToken }); }
  catch (error) {
    if (error.status !== 401) throw error;
    session = await ensureAccess(true, session.accessToken);
    try { return await request(path, { method: 'GET', ...options, token: session.accessToken }); }
    catch (nextError) { if (nextError.status === 401) clearSession(); throw nextError; }
  }
}
export const api = {
  configured: Boolean(base),
  hasSession: () => Boolean(readSession()?.refreshToken),
  paymentCatalog: () => request('/payments/products', { method: 'GET' }),
  async sendCode(email) { return request('/auth/code', { body: { email } }); },
  async verifyCode({ challengeId, code } = {}) { const session = await request('/auth/verify', { body: { challengeId, code } }); saveSession(session); return session.user; },
  startWechatLogin: () => request('/auth/wechat/start', { body: {} }),
  async pollWechatLogin(flow, isCurrent = () => true) {
    const result = await request('/auth/wechat/result', { body: { flowId: flow.flowId, pollToken: flow.pollToken } });
    if (!isCurrent()) return null;
    if (result.status === 'pending') return null;
    const session = result.tokens;
    if (result.status !== 'complete' || !session?.accessToken || !session?.refreshToken || !session?.user?.id || !['admin', 'user'].includes(session.user.role) || !Number.isFinite(Date.parse(session.accessExpiresAt)) || !Number.isFinite(Date.parse(session.refreshExpiresAt))) throw new Error('微信登录结果无效，请重新扫码。');
    saveSession(session);
    return session.user;
  },
  sendEmailBindingCode: (email, allowMerge = false) => authenticatedGet('/me/email/code', { method: 'POST', body: { email, ...(allowMerge ? {allowMerge:true} : {}) } }),
  verifyEmailBinding: body => authenticatedGet('/me/email/verify', { method: 'POST', body }),
  me: () => authenticatedGet('/me'),
  dashboard: () => authenticatedGet('/dashboard'),
  adminOperations: (period='30') => authenticatedGet('/admin/operations?' + new URLSearchParams({period})),
  updateTokenPricing: body => authenticatedGet('/admin/token-pricing', {method:'POST',body}),
  adminOverview: () => authenticatedGet('/admin/overview'),
  adminUsers: ({ page = 1, search = '' } = {}) => authenticatedGet('/admin/users?' + new URLSearchParams({ page, search })),
  adminUser: id => authenticatedGet('/admin/users/' + encodeURIComponent(id)),
  adminPayments: ({ page = 1, search = '', status = '' } = {}) => authenticatedGet('/admin/payments?' + new URLSearchParams({ page, search, status })),
  refreshAdminPayment: id => authenticatedGet('/admin/payments/' + encodeURIComponent(id) + '/refresh', { method: 'POST', body: {} }),
  usage: ({admin=false,page=1,search=""}={}) => authenticatedGet((admin ? "/admin/usage" : "/usage")+"?"+new URLSearchParams({page,search})),
  resolveUsage: (id,body) => authenticatedGet("/admin/usage/"+encodeURIComponent(id)+"/resolve",{method:"POST",body}),
  adminSystem: () => authenticatedGet('/admin/system'),
  adminPaymentCatalog: () => authenticatedGet('/admin/payment-catalog'),
  updatePaymentCatalog: body => authenticatedGet('/admin/payment-catalog', { method: 'POST', body }),
  updateUser: (id, body) => authenticatedGet('/admin/users/' + encodeURIComponent(id), { method: 'POST', body }),
  async logout() {
    const run = async () => { const session = readSession(); if (session?.refreshToken) await request('/auth/logout', { body: { refreshToken: session.refreshToken } }); clearSession(); };
    if (globalThis.navigator?.locks) return navigator.locks.request('neonagent-refresh:' + base, run);
    return run();
  },
};
export const number = n => new Intl.NumberFormat('zh-CN').format(n);
export const money = n => `¥${(n / 100).toFixed(2)}`;
export function amountToCents(value) {
  const raw = String(value ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
  const [whole, fraction = ''] = raw.split('.');
  const cents = Number(whole) * 100 + Number((fraction + '00').slice(0, 2));
  return Number.isSafeInteger(cents) ? cents : null;
}
export function topupTokenQuote(amountCents, minimumCents, tokensAtMinimum) {
  if (![amountCents, minimumCents, tokensAtMinimum].every(Number.isSafeInteger) || minimumCents < 1 || tokensAtMinimum < 1) return null;
  const tokens = BigInt(amountCents) * BigInt(tokensAtMinimum) / BigInt(minimumCents);
  return tokens <= 1000000000000n ? Number(tokens) : null;
}
export const products = {
  annual: { id: 'annual', title: '高级会员 · 年付', amount: 1000, tokens: 1000000, description: '一年高级功能，每个付费年度赠送 100 万 Token。' },
  tokens: { id: 'tokens', title: '内置 Token 充值', amount: 500, tokens: 1000000, description: '100 万 deepseek-flash Token，长期有效。' },
};
export function seed(plan = 'premium') {
  const today = new Date();
  const date = (days, hours = 10) => { const d = new Date(today); d.setDate(d.getDate() - days); d.setHours(hours, 24, 0, 0); return d.toISOString(); };
  const end = new Date(today); end.setFullYear(end.getFullYear() + 1);
  return {
    plan, email: 'demo@example.com', expires: plan === 'premium' ? end.toISOString() : null,
    grants: plan === 'premium' ? [{ id: 'gift', kind: '赠送', total: 1000000, used: 350000, expires: end.toISOString() }] : [],
    orders: plan === 'premium' ? [{ id: 'DEMO-202609-001', product: 'annual', amount: 1000, status: 'paid', created: date(4), fulfilled: true }] : [],
    usage: plan === 'premium' ? [
      { id: 'DEMO-R001', date: date(0, 14), feature: '浏览器 Agent', input: 100000, output: 20000, status: 'settled' },
      { id: 'DEMO-R002', date: date(1), feature: '整页翻译', input: 85000, output: 15000, status: 'settled' },
      { id: 'DEMO-R003', date: date(2), feature: '基础问答', input: 70000, output: 10000, status: 'settled' },
      { id: 'DEMO-R004', date: date(3), feature: '划词翻译', input: 40000, output: 10000, status: 'settled' },
      { id: 'DEMO-R005', date: date(3, 16), feature: '基础问答', input: 0, output: 0, status: 'failed' },
    ] : [],
  };
}
export function quota(state) {
  const now = new Date();
  const active = state.grants.filter(g => (!g.starts || new Date(g.starts) <= now) && (!g.expires || new Date(g.expires) > now));
  const total = active.reduce((s, g) => s + g.total, 0);
  const used = active.reduce((s, g) => s + g.used, 0);
  const gift = active.filter(g => g.kind === '赠送').reduce((s, g) => s + g.total - g.used, 0);
  const giftExpiry = active.filter(g => g.kind === '赠送' && g.total > g.used && g.expires).map(g => g.expires).sort()[0] || null;
  return { total, used, gift, giftExpiry, paid: total - used - gift, remaining: total - used, percent: total ? Math.round(used / total * 100) : 0 };
}
