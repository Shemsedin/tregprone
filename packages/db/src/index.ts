import { PrismaClient } from '../generated/client/index.js';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma: ReturnType<typeof prismaClientSingleton> =
  globalThis.__prisma ?? prismaClientSingleton();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
export { PrismaClient } from '../generated/client/index.js';
export type { Prisma } from '../generated/client/index.js';
