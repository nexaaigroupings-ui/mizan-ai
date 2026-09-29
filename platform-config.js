// Platform Configuration for Web, Mobile, and Desktop
window.MIZAN_CONFIG = {
  API_URL: process.env.MIZAN_API_URL || window.location.origin + '/api',
  WEB_URL: process.env.MIZAN_WEB_URL || window.location.origin,
  APP_VERSION: '3.2.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  ENABLE_DESKTOP: typeof window !== 'undefined' && window.electron !== undefined,
  ENABLE_MOBILE: typeof window !== 'undefined' && typeof window.Capacitor !== 'undefined'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.MIZAN_CONFIG;
}
