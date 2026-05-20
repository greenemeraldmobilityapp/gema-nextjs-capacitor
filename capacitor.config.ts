import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greenemerald.gema',
  appName: 'GEMA',
  webDir: 'out',
  android: {
    allowMixedContent: true,
  },
};

export default config;
