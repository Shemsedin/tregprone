import { PrismaClient } from '../generated/client/index.js';
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env['NODE_ENV'] === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });
};
export const prisma = globalThis.__prisma ?? prismaClientSingleton();
if (process.env['NODE_ENV'] !== 'production') {
    globalThis.__prisma = prisma;
}
export default prisma;
export { PrismaClient } from '../generated/client/index.js';
