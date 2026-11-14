import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';
import Fastify from 'fastify';

import { buildApp } from './app.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(currentDir, '../../../.env') });

const host = process.env['API_HOST'] ?? '0.0.0.0';
const port = Number(process.env['API_PORT'] ?? 4000);

const server = Fastify({
  logger: {
    level: process.env['API_LOG_LEVEL'] ?? 'info',
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      'refreshHash',
      '*.email',
      '*.phone',
    ],
  },
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  genReqId: () => crypto.randomUUID(),
});

await buildApp(server);

try {
  await server.listen({ host, port });
  console.log(`🚀 API running at http://${host}:${port}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
