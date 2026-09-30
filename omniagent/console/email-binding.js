import { api } from './api.js?v=20260930-pages';
const cooldowns = new Map();
export function emailBindingForm(user) {
  if (user.emailBound !== false) return '';
  return `<section class="box"><h2>绑定邮箱 / 合并账号</h2><p class="muted">验证后，可使用微信或此邮箱登录同一个账号。邮箱已有账号时，可验证邮箱并确认合并。</p><form id="email-binding-form" class="email-binding-form"><div class="field"><label for="binding-email">电子邮箱</label><input id="binding-email" name="email" type="email" required maxlength="254" autocomplete="email" placeholder="you@example.com"></div><div class="field"><label for="binding-code">邮箱验证码</label><div class="code-row"><input id="binding-code" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="one-time-code" placeholder="6 位验证码"><button type="button" class="btn" id="binding-send">获取验证码</button></div></div><div id="merge-confirmation" class="callout" hidden><strong>此邮箱已有账号</strong><p>确认后，当前微信账号将合并到该邮箱账号。Token、订单和用量记录一并转入，保留双方已有管理员权限；会员取较晚到期日，赠送 Token 仍按原期限失效。</p><p>其他设备需要重新登录，原微信账号将停用；合并无法自行撤销。</p><label class="merge-consent"><input type="checkbox" id="merge-consent">我已确认合并以上两个账号</label></div><p class="form-error" id="binding-error" role="alert"></p><p class="muted" id="binding-status" role="status"></p><button class="btn primary" type="submit">验证并绑定</button></form></section>`;
}
export function mountEmailBinding({user, isCurrent, onBound, onUnauthorized}) {
  const form = document.querySelector('#email-binding-form');
  if (!form) return () => {};
  const email = form.elements.email, code = form.elements.code;
  const send = form.querySelector('#binding-send'), submit = form.querySelector('[type="submit"]');
  const error = form.querySelector('#binding-error'), status = form.querySelector('#binding-status');
  const confirmation = form.querySelector('#merge-confirmation'), consent = form.querySelector('#merge-consent');
  function resetConfirmation() { confirmation.hidden = true; consent.checked = false; consent.required = false; submit.textContent = '验证并绑定'; }
  let challenge = null, sending = false, saving = false, disposed = false;
  const current = () => !disposed && isCurrent() && form.isConnected;
  const normalizedEmail = () => email.value.trim().toLowerCase();
  function update() {
    const seconds = Math.max(0, Math.ceil(((cooldowns.get(user.id) || 0) - Date.now()) / 1000));
    send.disabled = sending || saving || seconds > 0;
    send.textContent = sending ? '发送中…' : seconds ? `${seconds} 秒后重发` : '获取验证码';
    submit.disabled = saving || sending;
  }
  function fail(cause) { if (cause.status === 401) onUnauthorized(cause.message); else error.textContent = cause.message; }
  email.addEventListener('input', () => { if (challenge && normalizedEmail() !== challenge.email) { challenge = null; resetConfirmation(); code.value = ''; status.textContent = '邮箱已改变，请重新获取验证码。'; } });
  send.addEventListener('click', async () => {
    if (send.disabled || !email.reportValidity()) return;
    const requestedEmail = normalizedEmail(); resetConfirmation(); sending = true; challenge = null; error.textContent = ''; status.textContent = ''; update();
    try {
      const result = await api.sendEmailBindingCode(requestedEmail, true);
      cooldowns.set(user.id, Date.now() + (result.retryAfter || 60) * 1000);
      if (!current()) return;
      if (normalizedEmail() !== requestedEmail) { status.textContent = '邮箱已改变，请重新获取验证码。'; return; }
      challenge = {...result, email: requestedEmail}; code.value = '';
      confirmation.hidden = !result.mergeRequired; consent.required = Boolean(result.mergeRequired);
      submit.textContent = result.mergeRequired ? '验证并合并账号' : '验证并绑定';
      status.textContent = '验证码已发送，请查看邮箱或垃圾邮件。';
    } catch (cause) {
      if (cause.retryAfter) cooldowns.set(user.id, Date.now() + cause.retryAfter * 1000);
      if (current()) fail(cause);
    } finally { sending = false; if (current()) update(); }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (sending || saving || !form.reportValidity()) return;
    error.textContent = ''; status.textContent = '';
    if (!challenge || challenge.email !== normalizedEmail()) { error.textContent = '请先为当前邮箱获取验证码。'; return; }
    if (!Number.isFinite(Date.parse(challenge.expiresAt)) || Date.parse(challenge.expiresAt) <= Date.now()) { error.textContent = '验证码已过期，请重新获取。'; return; }
    if (challenge.mergeRequired && !consent.checked) { error.textContent = '请先确认账号合并规则。'; return; }
    saving = true; email.disabled = true; code.disabled = true; submit.textContent = '正在绑定…'; update();
    try { const updated = await api.verifyEmailBinding({challengeId: challenge.challengeId, code: code.value.trim(), ...(challenge.mergeRequired ? {confirmMerge:consent.checked} : {})}); if (current()) await onBound(updated, Boolean(challenge.mergeRequired)); }
    catch (cause) { if (current()) fail(cause); }
    finally { saving = false; if (current()) { email.disabled = false; code.disabled = false; submit.textContent = challenge?.mergeRequired ? '验证并合并账号' : '验证并绑定'; update(); } }
  });
  update(); const timer = setInterval(update, 1000);
  return () => { disposed = true; clearInterval(timer); };
}
