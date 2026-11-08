#!/usr/bin/env node
/*
 * Create a gzipped MongoDB archive with mongodump and upload it to the
 * configured private backups bucket.
 *
 * Usage:
 *   node scripts/backup-db-to-s3.js
 *   node scripts/backup-db-to-s3.js --dry-run
 *   node scripts/backup-db-to-s3.js --file backups/db_dump/parsswim.archive.gz
 *   node scripts/backup-db-to-s3.js --dir backups/db_dump/parsswim-dump
 *   node scripts/backup-db-to-s3.js --key Backup/2026-11-05/custom.archive.gz
 *
 * Requires MongoDB Database Tools (mongodump) on PATH unless --file/--dir is used.
 */

const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
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

function usage() {
  console.log(`Usage: node scripts/backup-db-to-s3.js [options]

Options:
  --file <path>     Upload an existing .archive.gz instead of running mongodump
  --dir <path>      Tar a dump directory (.tar.gz) instead of running mongodump
  --uri <uri>       MongoDB URI (default: MONGODB_URL from .env)
  --prefix <key>    S3 key prefix (default: Backup)
  --key <key>       Full S3 object key (overrides --prefix)
  --keep-local      Keep the temporary archive on disk
  --dry-run         Show the target key/command; no dump or upload
  --help            Show this help
`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    if (["keep-local", "dry-run", "help"].includes(key)) {
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

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestamp(date = new Date()) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
  );
}

function defaultKey(prefix, extension, date = new Date()) {
  const day = timestamp(date).slice(0, 10);
  return `${prefix}/${day}/parsswim-${timestamp(date)}.${extension}`;
}

function runCommand(command, args, notFoundMessage) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "inherit", "inherit"],
    });

    child.on("error", (error) => {
      if (error.code === "ENOENT") {
        reject(new Error(notFoundMessage));
        return;
      }
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function runMongodump(uri, archivePath) {
  return runCommand(
    "mongodump",
    [`--uri=${uri}`, "--gzip", `--archive=${archivePath}`],
    "mongodump not found on PATH. Install MongoDB Database Tools, or pass --file/--dir.",
  );
}

function runTar(dir, archivePath) {
  const parent = path.dirname(dir);
  const base = path.basename(dir);
  return runCommand(
    "tar",
    ["-czf", archivePath, "-C", parent, base],
    "tar not found on PATH. Create an archive manually and pass --file.",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    return;
  }

  const dryRun = Boolean(args["dry-run"]);
  const keepLocal = Boolean(args["keep-local"]);
  const prefix = String(args.prefix || "Backup")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  const bucket = process.env.S3_BACKUPS_BUCKET || "parsswim-backups";

  if (args.file && args.dir) {
    console.error("Use either --file or --dir, not both.");
    process.exit(1);
  }
  if (args.file === true || args.dir === true) {
    console.error("--file and --dir require a path.");
    process.exit(1);
  }

  const directory = args.dir ? path.resolve(args.dir) : null;
  const key = args.key
    ? String(args.key).replace(/^\/+/, "")
    : defaultKey(prefix, directory ? "tar.gz" : "archive.gz");

  if (directory && !fs.existsSync(directory)) {
    console.error(`Directory not found: ${directory}`);
    process.exit(1);
  }

  let archivePath = args.file ? path.resolve(args.file) : null;
  let temporary = false;

  if (!dryRun && !storage.isConfigured()) {
    console.error(
      "Object storage is not configured. Run scripts/init-s3-env.ps1 first.",
    );
    process.exit(1);
  }

  if (!dryRun && !bucket) {
    console.error("S3_BACKUPS_BUCKET is not configured.");
    process.exit(1);
  }

  if (!archivePath && directory) {
    if (dryRun) {
      console.log(
        `[dry-run] tar -czf <temp> -C "${path.dirname(directory)}" "${path.basename(directory)}"`,
      );
      console.log(`[dry-run] upload to s3://${bucket}/${key}`);
      return;
    }

    archivePath = path.join(os.tmpdir(), `parsswim-${timestamp()}.tar.gz`);
    temporary = true;

    console.log("Creating tar archive...");
    await runTar(directory, archivePath);
    console.log(`Archive created: ${archivePath}`);
  }

  if (!archivePath) {
    const uri = args.uri || process.env.MONGODB_URL;

    if (!uri) {
      console.error(
        "MONGODB_URL is not set. Add it to .env or pass --uri <mongodb-uri>.",
      );
      process.exit(1);
    }

    if (dryRun) {
      console.log("[dry-run] mongodump --uri=<MONGODB_URL> --gzip --archive=<temp>");
      console.log(`[dry-run] upload to s3://${bucket}/${key}`);
      return;
    }

    archivePath = path.join(os.tmpdir(), `parsswim-${timestamp()}.archive.gz`);
    temporary = true;

    console.log("Running mongodump...");
    await runMongodump(uri, archivePath);
    console.log(`Archive created: ${archivePath}`);
  }

  if (!fs.existsSync(archivePath)) {
    console.error(`Archive not found: ${archivePath}`);
    process.exit(1);
  }

  const buffer = await fsp.readFile(archivePath);

  if (dryRun) {
    console.log(
      `[dry-run] upload ${archivePath} (${buffer.length} bytes) to s3://${bucket}/${key}`,
    );
  } else {
    await storage.putBackup(key, buffer, "application/gzip");

    const remote = await storage.statObject(key, bucket);
    if (remote.size !== buffer.length) {
      throw new Error(
        `upload verification failed (local ${buffer.length}, remote ${remote.size})`,
      );
    }

    console.log(`Uploaded: s3://${bucket}/${key}`);
    console.log(`Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  }

  if (temporary && !keepLocal) {
    await fsp.rm(archivePath, { force: true });
    console.log(`Removed temporary archive: ${archivePath}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
