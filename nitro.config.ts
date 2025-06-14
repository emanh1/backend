import { resolve } from 'node:path';
//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: '2025-06-14',
  alias: {
    '@': resolve(__dirname, 'server'),
    '@dbclient': resolve(__dirname, '.prisma/client'),
  }
});
