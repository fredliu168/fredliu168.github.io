(async () => {
  const base = (window.NEONAGENT_CONFIG?.apiBaseURL || '').replace(/\/$/, '');
  if (!base) return;
  try {
    const response = await fetch(`${base}/payments/products`, { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) return;
    const catalog = await response.json();
    const money = cents => `¥${(cents / 100).toFixed(2).replace(/\.?0+$/, '')}`;
    const premiumPrice = document.querySelector('#public-premium-price');
    const premiumGift = document.querySelector('#public-premium-gift');
    const topupPrice = document.querySelector('#public-topup-price');
    const topupTokens = document.querySelector('#public-topup-tokens');
    if (premiumPrice) premiumPrice.textContent = money(catalog.premiumYear.amountCents);
    if (premiumGift) premiumGift.textContent = `${Number(catalog.premiumYear.tokens).toLocaleString('zh-CN')} Token`;
    if (topupPrice) topupPrice.textContent = money(catalog.minimumTopupCents);
    if (topupTokens) topupTokens.textContent = Number(catalog.tokenTopup.tokens).toLocaleString('zh-CN');
  } catch (error) {
    console.warn('无法读取会员价格配置', error);
  }
})();
