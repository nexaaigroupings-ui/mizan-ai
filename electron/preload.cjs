const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('mizanPlatform', {
  name: 'desktop',
  version: process.versions.electron
});
