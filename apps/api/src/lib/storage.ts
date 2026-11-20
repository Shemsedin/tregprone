import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3Client: S3Client | null = null;

export function getS3(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env['BLOB_ENDPOINT'],
      region: process.env['BLOB_REGION'] ?? 'auto',
      credentials: {
        accessKeyId: process.env['BLOB_ACCESS_KEY'] ?? 'minioadmin',
        secretAccessKey: process.env['BLOB_SECRET_KEY'] ?? 'minioadmin',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }
  return s3Client;
}

const PRIVATE_BUCKET = process.env['BLOB_PRIVATE_CONTAINER'] ?? 'images-private';
const PUBLIC_BUCKET = process.env['BLOB_PUBLIC_CONTAINER'] ?? 'images-public';
const PUBLIC_BASE_URL = process.env['BLOB_PUBLIC_BASE_URL'] ?? 'http://localhost:9002/images-public';

/** Generate a presigned PUT URL for the client to upload directly */
export async function generateUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: PRIVATE_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(getS3(), command, { expiresIn: 300 });
  return { uploadUrl, key };
}

/** Generate a presigned GET URL for a private object */
export async function generateDownloadUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key });
  return getSignedUrl(getS3(), command, { expiresIn: 3600 });
}

/** Get the public CDN URL for a processed image */
export function getPublicUrl(key: string): string {
  return `${PUBLIC_BASE_URL}/${key}`;
}

/** Delete from private bucket */
export async function deletePrivateObject(key: string) {
  await getS3().send(new DeleteObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }));
}

/** Delete from public bucket */
export async function deletePublicObject(key: string) {
  await getS3().send(new DeleteObjectCommand({ Bucket: PUBLIC_BUCKET, Key: key }));
}

export { PRIVATE_BUCKET, PUBLIC_BUCKET, PUBLIC_BASE_URL };
