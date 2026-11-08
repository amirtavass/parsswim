#!/usr/bin/env node
/*
 * Upload the legacy images to the configured S3-compatible bucket.
 *
 * Usage:
 *   node scripts/migrate-uploads-to-s3.js
 *   node scripts/migrate-uploads-to-s3.js --dry-run
 *   node scripts/migrate-uploads-to-s3.js --source backups/uploads/images --prefix uploads/images
 *   node scripts/migrate-uploads-to-s3.js --concurrency 4 --no-verify
 *
 * Idempotent: re-running overwrites the same keys.
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { createRequire } = require("module");

const backendRequire = createRequire(
  path.join(__dirname, "..", "backend", "package.json"),
);
const dotenv = backendRequire("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({
  path: path.join(__dirname, "..", "backend", ".env"),
  override: true,
});

const storage = require("../backend/lib/storage");

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

function usage() {
  console.log(`Usage: node scripts/migrate-uploads-to-s3.js [options]

Options:
  --source <dir>       Local directory to upload (default: backups/uploads/images)
  --prefix <key>       S3 key prefix (default: uploads/images)
  --concurrency <n>    Parallel uploads (default: 4)
  --dry-run            List what would be uploaded; no network calls
  --no-verify          Skip the post-upload size/MD5 check
  --help               Show this help
`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    if (["dry-run", "no-verify", "help"].includes(key)) {
      args[key] = true;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }

  return files.sort();
}

function md5(buffer) {
  return crypto.createHash("md5").update(buffer).digest("hex");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }

  const source = path.resolve(
    args.source || path.join(__dirname, "..", "backups", "uploads", "images"),
  );
  const prefix = String(args.prefix || storage.UPLOAD_PREFIX)
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  const dryRun = Boolean(args["dry-run"]);
  const verify = !args["no-verify"];
  const concurrency = Math.max(1, Number(args.concurrency) || 4);
  const bucket = process.env.S3_UPLOADS_BUCKET || "parsswim-uploads";

  if (!fs.existsSync(source)) {
    console.error(`Source directory not found: ${source}`);
    process.exit(1);
  }

  if (!dryRun && !storage.isConfigured()) {
    console.error(
      "Object storage is not configured. Run scripts/init-s3-env.ps1 first.",
    );
    process.exit(1);
  }

  const files = await walk(source);
  if (files.length === 0) {
    console.error(`No files found in ${source}`);
    process.exit(1);
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}Uploading ${files.length} files from ${source}`,
  );
  console.log(`Target: s3://${bucket}/${prefix}/`);

  const queue = files.slice();
  const totals = { uploaded: 0, failed: 0, bytes: 0 };

  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift();
      const relative = path.relative(source, file).split(path.sep).join("/");
      const key = `${prefix}/${relative}`;
      const type =
        CONTENT_TYPES[path.extname(file).toLowerCase()] ||
        "application/octet-stream";

      try {
        const buffer = await fsp.readFile(file);

        if (dryRun) {
          console.log(`[dry-run] ${key} (${buffer.length} bytes)`);
          totals.bytes += buffer.length;
          continue;
        }

        await storage.putObject(key, buffer, type);

        if (verify) {
          const remote = await storage.statObject(key);
          if (remote.size !== buffer.length) {
            throw new Error(
              `size mismatch (local ${buffer.length}, remote ${remote.size})`,
            );
          }

          if (/^[a-f0-9]{32}$/i.test(remote.etag)) {
            const localMd5 = md5(buffer);
            if (localMd5 !== remote.etag.toLowerCase()) {
              throw new Error(
                `MD5 mismatch (local ${localMd5}, remote ${remote.etag})`,
              );
            }
          }
        }

        totals.uploaded += 1;
        totals.bytes += buffer.length;
        console.log(`ok ${key}`);
      } catch (error) {
        totals.failed += 1;
        console.error(`FAIL ${key}: ${error.message}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, files.length) }, worker),
  );

  console.log("");
  console.log(
    `Done: ${totals.uploaded} uploaded, ${totals.failed} failed, ` +
      `${(totals.bytes / 1024 / 1024).toFixed(2)} MB`,
  );

  if (totals.failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
