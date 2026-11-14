import path from 'node:path';
import { createHash } from 'node:crypto';

import type { Job } from 'bullmq';
import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { encode } from 'blurhash';

import { prisma } from '@treg/db';

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

function getS3() {
  return new S3Client({
    endpoint: process.env['BLOB_ENDPOINT'],
    region: process.env['BLOB_REGION'] ?? 'auto',
    credentials: {
      accessKeyId: process.env['BLOB_ACCESS_KEY'] ?? 'minioadmin',
      secretAccessKey: process.env['BLOB_SECRET_KEY'] ?? 'minioadmin',
    },
    forcePathStyle: true,
  });
}

const PRIVATE_BUCKET = process.env['BLOB_PRIVATE_CONTAINER'] ?? 'images-private';
const PUBLIC_BUCKET = process.env['BLOB_PUBLIC_CONTAINER'] ?? 'images-public';
const PUBLIC_BASE_URL = process.env['BLOB_PUBLIC_BASE_URL'] ?? 'http://localhost:9000/images-public';

export async function imageWorker(job: Job<ImageJob>) {
  const { listingId, imageId, key } = job.data;
  const s3 = getS3();

  // 1. Download original from private bucket
  const getRes = await s3.send(new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }));
  const originalBuffer = Buffer.from(await getRes.Body!.transformToByteArray());

  // 2. Process with sharp: strip EXIF, resize, generate formats
  const sharpInstance = sharp(originalBuffer)
    .rotate() // auto-orient from EXIF
    .withMetadata({ exif: {} }); // strip EXIF data

  const { width: origWidth = 1200, height: origHeight = 800 } = await sharp(originalBuffer).metadata();

  // Generate blurhash from tiny thumbnail
  const thumbBuffer = await sharp(originalBuffer)
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const blurhash = encode(
    new Uint8ClampedArray(thumbBuffer.data),
    thumbBuffer.info.width,
    thumbBuffer.info.height,
    4,
    3,
  );

  // 3. Upload variants to public bucket
  const ext = path.extname(key) || '.jpg';
  const baseName = path.basename(key, ext);
  const publicKey = `processed/${listingId}/${baseName}`;

  for (const variant of VARIANTS) {
    const variantBuffer = await sharp(originalBuffer)
      .resize(variant.width, undefined, { fit: 'inside', withoutEnlargement: true })
      .withMetadata({ exif: {} })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: PUBLIC_BUCKET,
      Key: `${publicKey}_${variant.suffix}.jpg`,
      Body: variantBuffer,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    // Also generate WebP
    const webpBuffer = await sharp(originalBuffer)
      .resize(variant.width, undefined, { fit: 'inside', withoutEnlargement: true })
      .withMetadata({ exif: {} })
      .webp({ quality: 85 })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: PUBLIC_BUCKET,
      Key: `${publicKey}_${variant.suffix}.webp`,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    }));
  }

  // 4. Update DB record with public URL and blurhash
  const publicUrl = `${PUBLIC_BASE_URL}/${publicKey}_md.jpg`;
  await prisma.listingImage.update({
    where: { id: imageId },
    data: {
      url: publicUrl,
      width: origWidth,
      height: origHeight,
      blurhash,
    },
  });

  // 5. Delete from private bucket
  await s3.send(new DeleteObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }));

  return { publicUrl, blurhash };
}
