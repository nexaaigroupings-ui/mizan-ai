import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mizanai.app',
  appName: 'Mizan AI',
  webDir: '.',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#f3f5fb'
  }
};

export default config;
