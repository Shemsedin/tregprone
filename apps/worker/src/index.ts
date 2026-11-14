import 'dotenv/config';

import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import pino from 'pino';

import { imageWorker } from './workers/image.js';
import { searchWorker } from './workers/search.js';
import { mailWorker } from './workers/mail.js';

const logger = pino({
  level: process.env['WORKER_LOG_LEVEL'] ?? 'info',
  redact: ['*.email', '*.phone'],
});

const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const CONCURRENCY = Number(process.env['WORKER_CONCURRENCY'] ?? 4);

logger.info('Starting workers…');

// Image pipeline worker
const imgWorker = new Worker('image-pipeline', imageWorker, {
  connection: redis,
  concurrency: CONCURRENCY,
});

// Search index worker
const searchIndexWorker = new Worker('search-index', searchWorker, {
  connection: redis,
  concurrency: CONCURRENCY,
});

// Mail worker
const emailWorker = new Worker('mail', mailWorker, {
  connection: redis,
  concurrency: 2,
});

for (const worker of [imgWorker, searchIndexWorker, emailWorker]) {
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: worker.name }, 'Job completed');
  });
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: worker.name, err: err.message }, 'Job failed');
  });
}

logger.info('Workers started');

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down workers…');
  await Promise.all([imgWorker.close(), searchIndexWorker.close(), emailWorker.close()]);
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
