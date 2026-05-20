import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greenemerald.gema',
  appName: 'GEMA',
  webDir: 'out',
  android: {
    allowMixedContent: true,
  },
  ios: {
    scheme: 'App',
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
};

export default config;
