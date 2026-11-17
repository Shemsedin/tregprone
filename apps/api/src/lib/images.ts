import path from 'node:path';

import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { encode } from 'blurhash';
import type { FastifyBaseLogger } from 'fastify';
import sharp from 'sharp';

import prisma from './prisma.js';
import { getS3, PRIVATE_BUCKET, PUBLIC_BUCKET, PUBLIC_BASE_URL } from './storage.js';

interface ImageJob {
  listingId: string;
  imageId: string;
  key: string;
}

const VARIANTS = [
  { suffix: 'sm', width: 400 },
  { suffix: 'md', width: 800 },
  { suffix: 'lg', width: 1200 },
] as const;

async function processImage({ listingId, imageId, key }: ImageJob) {
  const s3 = getS3();

  const getRes = await s3.send(new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }));
  const original = Buffer.from(await getRes.Body!.transformToByteArray());

  const { width = 1200, height = 800 } = await sharp(original).rotate().metadata();

  const thumb = await sharp(original)
    .rotate()
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const blurhash = encode(
    new Uint8ClampedArray(thumb.data),
    thumb.info.width,
    thumb.info.height,
    4,
    3,
  );

  const ext = path.extname(key);
  const publicKey = `processed/${listingId}/${path.basename(key, ext)}`;

  for (const variant of VARIANTS) {
    const resized = sharp(original)
      .rotate()
      .resize(variant.width, undefined, { fit: 'inside', withoutEnlargement: true });

    const [jpeg, webp] = await Promise.all([
      resized.clone().jpeg({ quality: 85, progressive: true }).toBuffer(),
      resized.clone().webp({ quality: 85 }).toBuffer(),
    ]);

    for (const [buffer, extension, contentType] of [
      [jpeg, 'jpg', 'image/jpeg'],
      [webp, 'webp', 'image/webp'],
    ] as const) {
      await s3.send(
        new PutObjectCommand({
          Bucket: PUBLIC_BUCKET,
          Key: `${publicKey}_${variant.suffix}.${extension}`,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    }
  }

  await prisma.listingImage.update({
    where: { id: imageId },
    data: { url: `${PUBLIC_BASE_URL}/${publicKey}_md.jpg`, width, height, blurhash },
  });

  await s3.send(new DeleteObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }));
}

// Jobs run one at a time in-process so a burst of uploads cannot exhaust memory.
let chain: Promise<void> = Promise.resolve();

export function enqueueImageProcessing(job: ImageJob, log: FastifyBaseLogger) {
  chain = chain
    .then(() => processImage(job))
    .catch((err: unknown) => {
      log.error({ err, imageId: job.imageId }, 'Image processing failed');
    });
}
