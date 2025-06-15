import { resolve } from 'node:path';

export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: '2025-06-14',
  replace: {
    'import * as process': 'import * as processUnused',
  }, // workaround for prisma + nitro compatibility
  //https://github.com/prisma/prisma/issues/26908
  alias: {
    '@': resolve(__dirname, 'server'),
  }
});
