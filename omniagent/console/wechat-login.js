import { api } from './api.js?v=20260930-pages';
let generation = 0;
let timer;
let popup;
function notice(text) {
  const output = document.querySelector('#wechat-login-status');
  if (output) output.textContent = text;
}
export function stopWechatLogin() {
  generation++;
  clearTimeout(timer);
  if (popup && !popup.closed) popup.close();
  popup = null;
  const button = document.querySelector('[data-action="wechat-login"]');
  if (button) { button.disabled = false; button.textContent = '微信扫码登录'; }
  const cancel = document.querySelector('[data-action="wechat-cancel"]');
  if (cancel) cancel.hidden = true;
  notice('在新窗口中扫码，完成后此页面会自动登录。');
}
export async function startWechatLogin(onLogin) {
  stopWechatLogin();
  const version = generation;
  const current = () => generation === version && Boolean(document.querySelector('#wechat-login-status'));
  // Open synchronously within the click so browser popup blockers allow it.
  popup = window.open('about:blank', '_blank', 'popup,width=600,height=720');
  if (!popup) { notice('浏览器阻止了授权窗口，请允许此站点弹出窗口后重试。'); return; }
  popup.opener = null;
  const button = document.querySelector('[data-action="wechat-login"]');
  button.disabled = true;
  button.textContent = '等待微信授权…';
  document.querySelector('[data-action="wechat-cancel"]').hidden = false;
  notice('正在准备微信扫码登录…');
  const fail = message => { if (current()) { stopWechatLogin(); notice(message); } };
  try {
    const flow = await api.startWechatLogin();
    if (!current()) return;
    const url = new URL(flow.qrUrl);
    const expires = Date.parse(flow.expiresAt);
    if (url.origin !== 'https://open.weixin.qq.com' || url.pathname !== '/connect/qrconnect' || url.username || url.password || !flow.flowId || !flow.pollToken || !Number.isFinite(expires) || expires <= Date.now()) throw new Error('微信登录二维码无效，请重试。');
    if (popup.closed) throw new Error('授权窗口已关闭，请重新打开微信登录。');
    popup.location.replace(url.href);
    notice('请在新窗口中使用微信扫码并确认授权，此页面将自动登录。');
    async function poll() {
      if (!current()) return;
      if (Date.now() >= expires) { fail('二维码已过期，请重新扫码登录。'); return; }
      try {
        const user = await api.pollWechatLogin(flow, current);
        if (!current()) return;
        if (user) { stopWechatLogin(); onLogin(user); return; }
        if (popup.closed) { fail('授权窗口已关闭，请重新扫码登录。'); return; }
        timer = setTimeout(poll, 2000);
      } catch (error) { fail(error.status === 401 ? '二维码已失效，请重新扫码登录。' : error.message); }
    }
    timer = setTimeout(poll, 2000);
  } catch (error) { fail(error.message); }
}
window.addEventListener('pagehide', stopWechatLogin);
