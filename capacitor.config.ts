import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mizanai.app',
  appName: 'Mizan AI',
  webDir: '.',
  bundledWebRuntime: false,
  android: { backgroundColor: '#f4f7fb' }
};

export default config;
