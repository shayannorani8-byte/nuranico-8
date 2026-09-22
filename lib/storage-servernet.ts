import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function client() {
  return new S3Client({
    region: process.env.ARVAN_REGION || 'us-east-1',
    endpoint: `https://${required('ARVAN_ENDPOINT').replace(/^https?:\/\//, '')}`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: required('ARVAN_ACCESS_KEY'),
      secretAccessKey: required('ARVAN_SECRET_KEY'),
    },
  });
}

export function mediaKey(originalName: string) {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
  const safeExt = (ext || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const id = `${Date.now()}-${crypto.randomUUID()}`;
  return `media/${id}${safeExt ? `.${safeExt}` : ''}`;
}

export function publicMediaUrl(key: string) {
  const endpoint = required('ARVAN_ENDPOINT').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const bucket = required('ARVAN_BUCKET');
  const base = `https://${bucket}.${endpoint}`;
  return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function createUploadUrl(key: string, contentType: string) {
  const bucket = required('ARVAN_BUCKET');
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    }),
    { expiresIn: 900 },
  );
}

export async function deleteObject(key: string) {
  const bucket = required('ARVAN_BUCKET');
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
