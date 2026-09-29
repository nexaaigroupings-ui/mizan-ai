import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mizanai.app',
  appName: 'Mizan AI',
  webDir: '.',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#f4f7fb'
  },
  server: {
    // Set CAPACITOR_SERVER_URL to the deployed Railway URL for native builds.
    // Leaving this unset makes Capacitor load the local web files.
    url: process.env.CAPACITOR_SERVER_URL || undefined,
    cleartext: false
  }
};

export default config;
