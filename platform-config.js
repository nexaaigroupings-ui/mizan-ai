const desktopApi = typeof window !== 'undefined' && window.mizanPlatform?.apiUrl;
window.MIZAN_API_URL = window.MIZAN_API_URL || desktopApi || '';
