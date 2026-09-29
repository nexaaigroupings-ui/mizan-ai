const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('mizanPlatform', {
  name: 'desktop',
  version: process.versions.electron,
  apiUrl: process.env.MIZAN_API_URL || 'http://localhost:3000/api'
});
