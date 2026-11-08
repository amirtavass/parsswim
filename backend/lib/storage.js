const fs = require("fs/promises");
const path = require("path");

const UPLOAD_PREFIX = "uploads/images";

function normalizeKey(key) {
  return String(key || "").replace(/^\/+/, "");
}

function envBool(value) {
  return String(value || "").toLowerCase() === "true";
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return undefined;
}

// Canonical variables are S3_*. Legacy AWS_*/R2_* names are still accepted so
// existing .env files keep working after the storage migration.
function resolveConfig() {
  const endpoint = firstDefined(
    process.env.S3_ENDPOINT,
    process.env.R2_ENDPOINT_URL,
    process.env.AWS_ENDPOINT_URL_S3,
    process.env.AWS_ENDPOINT_URL,
  );

  const accessKeyId = firstDefined(
    process.env.S3_ACCESS_KEY_ID,
    process.env.R2_ACCESS_KEY_ID,
    process.env.AWS_ACCESS_KEY_ID,
    process.env.ACCESS_KEY,
  );

  const secretAccessKey = firstDefined(
    process.env.S3_SECRET_ACCESS_KEY,
    process.env.R2_SECRET_ACCESS_KEY,
    process.env.AWS_SECRET_ACCESS_KEY,
    process.env.SECRET_ACCESS_KEY,
  );

  // Temporary STS credentials (AWS Academy / role assumption) also need a token.
  const sessionToken = firstDefined(
    process.env.S3_SESSION_TOKEN,
    process.env.AWS_SESSION_TOKEN,
  );

  const bucket = firstDefined(process.env.S3_UPLOADS_BUCKET);

  // R2 uses "auto"; AWS needs a real region. If no region is supplied, use
  // "auto" for an S3-compatible endpoint and the AWS default otherwise.
  const region =
    firstDefined(
      process.env.S3_REGION,
      process.env.AWS_REGION,
      process.env.AWS_DEFAULT_REGION,
      process.env.R2_REGION,
    ) || (endpoint ? "auto" : "us-east-1");

  const forcePathStyle =
    process.env.S3_FORCE_PATH_STYLE !== undefined
      ? envBool(process.env.S3_FORCE_PATH_STYLE)
      : Boolean(endpoint);

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    bucket,
    region,
    forcePathStyle,
  };
}

function isConfigured() {
  const { bucket, accessKeyId, secretAccessKey } = resolveConfig();
  return Boolean(bucket && accessKeyId && secretAccessKey);
}

let cached = null;

function getClient() {
  const config = resolveConfig();
  const fingerprint = JSON.stringify(config);

  if (cached && cached.fingerprint === fingerprint) {
    return cached.client;
  }

  const { S3Client } = require("@aws-sdk/client-s3");
  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint || undefined,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      ...(config.sessionToken ? { sessionToken: config.sessionToken } : {}),
    },
  });

  cached = { fingerprint, client };
  return client;
}

function getPublicUrl(key) {
  const cleanKey = normalizeKey(key);
  const base = firstDefined(process.env.S3_PUBLIC_BASE_URL);

  if (base) {
    return `${base.replace(/\/+$/, "")}/${cleanKey}`;
  }

  const { bucket, region, endpoint } = resolveConfig();

  // Real AWS S3 without an explicit public base: use the virtual-hosted URL.
  if (!endpoint && bucket) {
    return `https://${bucket}.s3.${region}.amazonaws.com/${cleanKey}`;
  }

  // S3-compatible endpoints (R2/LocalStack) need a public domain to be
  // browser-readable, so fall back to a local-relative path.
  return `/${cleanKey}`;
}

function buildUploadKey(originalName) {
  const ext = path.extname(originalName || "").toLowerCase() || ".bin";
  const base =
    path
      .basename(originalName || "file", ext)
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file";

  return `${UPLOAD_PREFIX}/${Date.now()}-${base}${ext}`;
}

async function putObject(key, buffer, contentType) {
  const cleanKey = normalizeKey(key);

  if (!isConfigured()) {
    const target = path.join(__dirname, "..", "public", cleanKey);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
    return { key: cleanKey, url: `/${cleanKey}`, local: true };
  }

  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  await getClient().send(
    new PutObjectCommand({
      Bucket: resolveConfig().bucket,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { key: cleanKey, url: getPublicUrl(cleanKey), local: false };
}

async function deleteObject(key) {
  const cleanKey = normalizeKey(key);

  if (!isConfigured()) {
    await fs.rm(path.join(__dirname, "..", "public", cleanKey), {
      force: true,
    });
    return;
  }

  const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: resolveConfig().bucket,
      Key: cleanKey,
    }),
  );
}

async function putBackup(key, buffer, contentType) {
  const cleanKey = normalizeKey(key);
  const bucket = firstDefined(process.env.S3_BACKUPS_BUCKET);

  if (!isConfigured() || !bucket) {
    throw new Error(
      "Object storage backups are not configured (S3_BACKUPS_BUCKET / S3 credentials).",
    );
  }

  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    }),
  );

  return { key: cleanKey };
}

async function statObject(key, bucket = resolveConfig().bucket) {
  if (!isConfigured() || !bucket) {
    throw new Error(
      "Object storage is not configured (S3 credentials / bucket).",
    );
  }

  const { HeadObjectCommand } = require("@aws-sdk/client-s3");
  const result = await getClient().send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: normalizeKey(key),
    }),
  );

  return {
    size: result.ContentLength,
    etag: String(result.ETag || "").replace(/"/g, ""),
    contentType: result.ContentType,
  };
}

module.exports = {
  UPLOAD_PREFIX,
  isConfigured,
  getPublicUrl,
  buildUploadKey,
  putObject,
  deleteObject,
  putBackup,
  statObject,
};
