import { api } from './api.js?v=20260930-pages';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n = value => new Intl.NumberFormat('zh-CN').format(value);
const yuan = cents => `¥${(cents/100).toFixed(2)}`;
const cost = value => `¥${esc(String(value).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1'))}`;
const card = (label,value,note) => `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><small>${note}</small></div>`;
export function operationsSummary(data) {
 return `<section class="box"><div class="box-head"><h2>运营数据 · 近 30 天</h2><a class="link" href="#/admin/operations">明细与成本配置 →</a></div><div class="settings-row"><strong>支付收入</strong><span>${yuan(data.revenueCents)}</span></div><div class="settings-row"><strong>Token 估算成本</strong><span>${cost(data.costYuan)}</span></div><p class="muted">按当前成本单价估算；历史缓存明细缺失时按未命中价计算。</p></section>`;
}
const timeText = minute => `${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
const rateInput = (p,band,key,label) => `<label class="field" for="rate-${band}-${key}"><span>${label}</span><input id="rate-${band}-${key}" name="${band}-${key}" type="number" min="0" max="10000" step="0.0001" required value="${p[band][key]/10000}"></label>`;
export function operationsPage(data) {
 const p=data.pricing,b=data.buckets;
 const unknown=b.peak.unknownCacheRequests+b.offPeak.unknownCacheRequests;
 const calendarUnknown=b.peak.unknownCalendarRequests+b.offPeak.unknownCalendarRequests;
 return `<div class="page-head"><div><div class="eyebrow">BUSINESS OPERATIONS</div><h1 tabindex="-1">运营数据</h1><p>支付收入与内置模型 Token 成本</p></div><div class="actions"><label for="operations-period">统计范围</label><select id="operations-period">${[['1','今日'],['7','近 7 天'],['30','近 30 天'],['all','全部']].map(([value,label])=>`<option value="${value}" ${data.period===value?'selected':''}>${label}</option>`).join('')}</select><button class="btn small" data-live="refresh">刷新数据 ↻</button></div></div>
 <div class="stats">${card('支付收入',yuan(data.revenueCents),`${n(data.paidOrders)} 笔已支付且已履约订单`)}${card('Token 估算成本',cost(data.costYuan),'按当前价格配置重算所选期间')}${card('收入 − Token 估算成本',cost(data.differenceYuan),'未扣支付手续费及其他运营费用')}${card('待结算 / 待核对',n(data.unsettledRequests),'尚未计入 Token 成本')}</div>
 <section class="box"><div class="box-head"><h2>支付收入构成</h2><a class="link" href="#/admin/orders">查看支付订单 →</a></div><div class="settings-row"><strong>会员收入</strong><span>${yuan(data.membershipRevenueCents)}</span></div><div class="settings-row"><strong>Token 充值收入</strong><span>${yuan(data.topupRevenueCents)}</span></div><p class="muted">收入为已支付且已履约的订单金额，不包含待支付订单；不作为退款、税费或手续费结算报表。</p></section>
 <section class="box table-box"><div class="box-head"><h2>Token 成本明细</h2><a class="link" href="#/admin/usage">查看用量 →</a></div><div class="table-scroll"><table><thead><tr><th>时段</th><th>已结算请求</th><th>输入 Token</th><th>已知缓存命中</th><th>输出 Token</th><th>估算成本</th></tr></thead><tbody>${[['peak','高峰'],['offPeak','空闲（波谷）']].map(([key,name])=>`<tr><td>${name}</td><td>${n(b[key].requests)}</td><td>${n(b[key].promptTokens)}</td><td>${n(b[key].cacheHitTokens)}</td><td>${n(b[key].completionTokens)}</td><td>${cost(b[key].costYuan)}</td></tr>`).join('')}</tbody></table></div></section>
 <div class="callout">${esc(data.basis)}。<br>${n(unknown)} 条记录缺少缓存命中明细，输入部分按未命中价估算。${n(data.missingUsageRequests)} 条记录缺少有效用量，未计入成本。${calendarUnknown?`<br>${n(calendarUnknown)} 条记录所属年份的节假日表尚未核对，暂按星期与时段估算；请补充下方日历配置。`:''}</div>
 <section class="box" style="margin-top:22px"><h2>Token 成本价格配置</h2><p class="muted">单位：人民币元 / 百万 Token。仅影响运营成本估算，不改变用户 Token 扣费数量。保存后将重算所选期间的历史估算。</p>
 <form id="token-pricing-form"><div class="pricing-grid">${[['peak','高峰价格'],['offPeak','空闲价格']].map(([band,label])=>`<fieldset class="pricing-fields"><legend>${label}</legend>${rateInput(p,band,'cacheHit','输入 · 缓存命中')}${rateInput(p,band,'cacheMiss','输入 · 缓存未命中')}${rateInput(p,band,'output','输出')}</fieldset>`).join('')}</div><button type="button" class="btn small" id="half-price">将空闲价格设为高峰的一半</button>
 <div class="admin-edit-form" style="margin-top:20px"><div class="field"><label for="pricing-windows">高峰时段（北京时间，周一至周五）</label><textarea id="pricing-windows" name="windows" rows="3" required>${p.peakWindows.map(w=>timeText(w.start)+'-'+timeText(w.end)).join('\n')}</textarea><small>每行一段 HH:mm-HH:mm，起点包含、终点不包含。其余时间及周末为空闲时段。</small></div><div class="field"><label for="pricing-years">已核对全年节假日的年份（逗号分隔）</label><input id="pricing-years" name="years" value="${esc(p.calendarYears.join(', '))}"><small>新增年份前请补全全年放假日期。未列入的年份会显示估算提示。</small></div><div class="field admin-edit-wide"><label for="pricing-holidays">节假日 / 放假日期（全天空闲，每行一个 YYYY-MM-DD）</label><textarea id="pricing-holidays" name="holidays" rows="7">${esc(p.holidays.join('\n'))}</textarea><small>已内置 <a class="link" href="https://www.beijing.gov.cn/cs/gncs/zcwj/202603/t20260327_4568275.html" target="_blank" rel="noopener">2026 年官方放假安排</a>。调休上班的周末仍按空闲价格。</small></div></div>
 <p class="form-error" id="pricing-error" role="alert"></p><div class="actions"><button class="btn primary" type="submit">保存成本配置</button><span id="pricing-status" role="status"></span></div></form></section>`;
}
function parseRate(value) {
 if(!/^\d+(?:\.\d{1,4})?$/.test(String(value).trim()))throw new Error('单价须为非负数，最多 4 位小数。');
 const scaled=Math.round(Number(value)*10000);if(!Number.isSafeInteger(scaled)||scaled>100000000)throw new Error('单价不能超过 10000 元 / 百万 Token。');return scaled;
}
export function mountOperations({onPeriod,onSaved,onUnauthorized,isCurrent}) {
 const form=document.querySelector('#token-pricing-form');if(!form)return;
 document.querySelector('#operations-period').addEventListener('change',event=>onPeriod(event.target.value));
 form.querySelector('#half-price').addEventListener('click',()=>{
  try{for(const key of ['cacheHit','cacheMiss','output']){const rate=parseRate(form.elements[`peak-${key}`].value);if(rate%2)throw new Error('高峰单价减半后超过 4 位小数，请手动填写空闲价格。');form.elements[`offPeak-${key}`].value=String(rate/20000)}form.querySelector('#pricing-error').textContent=''}catch(error){form.querySelector('#pricing-error').textContent=error.message}
 });
 let saving=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(saving||!form.reportValidity())return;
  const error=form.querySelector('#pricing-error'),status=form.querySelector('#pricing-status');error.textContent='';status.textContent='';
  try {
   const p={peak:{},offPeak:{},peakWindows:[],holidays:[],calendarYears:[]};
   for(const band of ['peak','offPeak'])for(const key of ['cacheHit','cacheMiss','output'])p[band][key]=parseRate(form.elements[`${band}-${key}`].value);
   p.peakWindows=form.elements.windows.value.trim().split(/\n+/).map(line=>{const m=line.trim().match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);if(!m||Number(m[2])>59||Number(m[4])>59||Number(m[1])>23||Number(m[3])>24||(Number(m[3])===24&&Number(m[4])!==0))throw new Error('时段格式为 HH:mm-HH:mm，每行一段。');return {start:Number(m[1])*60+Number(m[2]),end:Number(m[3])*60+Number(m[4])}});
   p.holidays=form.elements.holidays.value.trim().split(/\s+/).filter(Boolean);
   const years=form.elements.years.value.trim();p.calendarYears=years?years.split(/[,，\s]+/).map(value=>{if(!/^\d{4}$/.test(value))throw new Error('请输入四位年份，以逗号分隔。');return Number(value)}):[];
   saving=true;form.querySelector('[type="submit"]').disabled=true;status.textContent='正在保存…';
   await api.updateTokenPricing(p);if(isCurrent())await onSaved();
  }catch(cause){if(isCurrent()){status.textContent='';if(cause.status===401)onUnauthorized(cause.message);else error.textContent=cause.message}}
  finally{saving=false;if(form.isConnected)form.querySelector('[type="submit"]').disabled=false}
 });
}
