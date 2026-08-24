import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.guimaraeseguedesadvocacia.app',
  appName: 'Guimarães & Guedes Advocacia',
  webDir: 'dist',
  server: {
    url: 'https://app.guimaraeseguedesadvocacia.com.br',
    cleartext: false,
  },
};

export default config;
