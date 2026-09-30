// Public configuration only. Never put SMTP authorization codes or API secrets here.
// Set productionAPI to the deployed HTTPS API origin before enabling online login.
(() => {
  const productionAPI = 'https://neonagent.qzdm.cn';
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  window.NEONAGENT_CONFIG = Object.freeze({
    apiBaseURL: local ? 'http://127.0.0.1:8080' : productionAPI,
  });
})();
