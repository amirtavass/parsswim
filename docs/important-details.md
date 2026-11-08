# ParsSwim — Important Details (Discovery Snapshot)

Read-only audit performed 2026-11-01, data extraction 2026-11-03. No
application, DNS, or database changes were made to the live server.

## Repository and local tooling

| Item | Value |
| --- | --- |
| Local path | `C:\Users\Pc Dayan\Desktop\PROJECTS\Projects\parsSwim` |
| Git remote | `https://github.com/amirtavass/arman-portfolio` (branch `main`) |
| Node / npm | v24.18.0 / 11.16.0 local (pin Node 20 for production) |
| Azure CLI | installed (`az`) |
| Docker | **not installed** |
| LocalStack CLI | **not installed** |
| WSL | WSL 2 present, but **no distribution installed** → `wsl --install -d Ubuntu` + Docker Engine (or Docker Desktop) is required for LocalStack |
| AWS CLI | installed; currently authenticated with **temporary STS session credentials** (`aws configure` shows `[None]`) |
| AWS EC2 | **not available** in the sandbox — `describe-instance-type-offerings` for `t3.micro` in `eu-north-1` returns empty |
| AWS S3 | **working** — buckets can be created in `eu-north-1` |
| Docs folder | `docs/` |
| Scripts | `scripts/setup-azure-vm.sh` (VM provisioning: Node 20, PM2, Nginx, Certbot, swap, UFW — no Docker/MongoDB), `scripts/init-s3-env.ps1` (provider-agnostic key injection), `scripts/migrate-uploads-to-s3.js` (65 images → S3 with MD5 verification), `scripts/backup-db-to-s3.js` (`mongodump`/`--dir` → private bucket) |

Repo oddities:

- `backend/` (tracked) and `parsswim-backend/` (untracked duplicate) have the
  same `package.json`; the droplet also keeps both `/root/parsswim-backend` and
  `/root/parsswim/backend`.
- `backend/.env.example` previously held a real-looking DB credential — scrubbed
  and committed on 2026-11-03; the file is now tracked as a safe template. The
  credential was never present in git history.
- `.env` files are not tracked (`git ls-files` shows none), which is correct.

## Application facts

| Item | Value |
| --- | --- |
| Next.js | 15.1.x (React 18.3), App Router, Tailwind 3.4 |
| Backend | Express 4, Mongoose 7, Passport local, JWT, `express-session` (`connect-mongo`) |
| Ports | frontend 3000, backend 4000 (MongoDB is external on Atlas; nothing listens on 27017) |
| Upload | Multer `memoryStorage` (5 MB cap, image MIME filter) → `backend/lib/storage.js` → S3-compatible store (AWS S3 primary, R2 fallback); local-disk fallback when S3 env is absent |
| Upload key | `buildUploadKey()` → `uploads/images/<timestamp>-<name>`; API returns `/uploads/images/<file>` (URL-compatible) |
| Upload serving | `GET /uploads/*` 302s to the public S3/R2 URL when configured; otherwise serves `backend/public/uploads` |
| Images | `ProductCard` builds `NEXT_PUBLIC_API_URL.replace("/api","") + image` |
| Payments | Zarinpal **sandbox** merchant id hardcoded in `server.js`; Railway callback URL still present in production branch |
| CORS | allow-list now uses `parsswim.dev` + `localhost:3000` in code; move to env-driven `ALLOWED_ORIGINS` |
| Database | **old Atlas** (current, being retired) `parsswim-cluster.dja3fdh.mongodb.net`, DB `parsswim`; **target: new MongoDB Atlas M0 in Ireland** |

Environment layout (keys only, no values):

| File | Keys |
| --- | --- |
| `.env` (root) | `PORT`, `NODE_ENV`, `MONGODB_URL`, `SESSION_SECRET`, `COOKIE_SECRET`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` |
| `.env.local` (root) | `NEXT_PUBLIC_API_URL=http://localhost:4000` |
| `backend/.env` | `COOKIE_SECRET`, `SESSION_SECRET` only |
| `backend/.env.local` | `NODE_ENV`, `PORT`, `MONGODB_URL`, `SESSION_SECRET`, `COOKIE_SECRET`, `FRONTEND_URL`, `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` |

> **Gotcha:** `server.js` loads the root `.env` and then `backend/.env` (backend
> wins). Keep the real values in one place — preferably `backend/.env` on the VM.

S3 variables belong in `backend/.env` (git-ignored), using the canonical
provider-agnostic names: `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`,
`S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_UPLOADS_BUCKET`, `S3_BACKUPS_BUCKET`,
`S3_PUBLIC_BASE_URL`, `S3_FORCE_PATH_STYLE`. Temporary STS credentials also need
`S3_SESSION_TOKEN` (or `AWS_SESSION_TOKEN`). Legacy `AWS_*`/`R2_*` names are
still read as fallbacks. Inject them with
`powershell -ExecutionPolicy Bypass -File .\scripts\init-s3-env.ps1`
(hidden input, never echoed). For AWS S3 leave `S3_ENDPOINT` empty and use
`S3_REGION=eu-north-1`; for R2 set the R2 endpoint and `S3_REGION=auto`.

## Live droplet (`parsswim.dev`)

| Item | Value |
| --- | --- |
| IP / host | `161.35.174.84`, hostname `parsswim` |
| OS | Ubuntu 24.04.3 LTS |
| Resources | 1 vCPU / 961 MB RAM / 24 GB disk (5.5 GB used) |
| Node | v20.20.2 (PM2) |
| Process manager | PM2: `parsswim-backend` at `/root/parsswim-backend/server.js`; `parsswim-frontend` (`npm run start`) at `/root/parsswim` |
| Web server | Nginx reverse proxy: `/` → `localhost:3000`, `/api/` → `localhost:4000/`, `/uploads/` → `localhost:4000/uploads/` |
| Nginx server_name | `parsswim.dev`, `www.parsswim.dev` |
| TLS | Let's Encrypt for `parsswim.dev`, valid until **2026-12-29** |
| Status | `https://parsswim.dev/` → 200, `/api/` → 200, HTTP → 301 |
| Docker/LocalStack/AWS CLI | Docker and LocalStack not installed; AWS CLI installed (temporary STS session) |
| SSH | `ssh -o BatchMode=yes root@161.35.174.84` works with `~/.ssh/id_ed25519` |

### Database (read-only counts via Mongoose, 2026-11-03)

| Collection | Documents |
| --- | --- |
| `products` | 12 |
| `classes` | 4 |
| `users` | 4 |
| `payment` | 0 |
| `sessions` | 0 |

The database is **MongoDB Atlas** (SRV connection), not a local `mongod` on the
droplet. `mongodump` therefore runs against Atlas; MongoDB Database Tools are not
installed on the droplet (a temp binary in `/tmp` was used, then removed).

### Uploads

- Path: `/root/parsswim-backend/public/uploads/images`
- 65 files, **7,893,221 bytes** (64 `.jpg`, 1 `.png`)

## Completed extraction — 2026-11-03

Explicitly approved read-only extraction from the droplet.

| Artifact | Local path | Verification |
| --- | --- | --- |
| Database dump (`mongodump --gzip`) | `backups/db_dump/parsswim-dump/parsswim/` | Every file's SHA-256 matches the droplet copy |
| Upload images | `backups/uploads/images/` | 65/65 SHA-256 match; 7,893,221 bytes |

`backups/` is git-ignored. The droplet's `/tmp` working copies were deleted
after transfer.

## Domain

| Item | Value |
| --- | --- |
| Production domain | `parsswim.dev` / `www.parsswim.dev` |
| DNS target today | Droplet `161.35.174.84` |
| TLS | Valid until 2026-12-29 |
| Legacy `.ir` domain | Expired and retired — out of scope; no registrar or DNS work |

## Offers / cost facts used for the plan

| Item | Fact |
| --- | --- |
| AWS account type | **Academy/education sandbox**; CLI uses temporary STS session credentials (`aws configure` shows `[None]`) |
| AWS EC2 | **Unavailable** — `describe-instance-type-offerings` for `t3.micro` in `eu-north-1` returns no rows |
| AWS S3 | **Available** — buckets can be created in `eu-north-1`; used as the storage layer |
| AWS IAM | **Confirmed** — `parsswim-deploy` user + access key created; scope down from `AmazonS3FullAccess` after launch |
| Azure for Students | VM already provisioned in **Ireland (`northeurope`)** (`B2ats_v2`); $100 credit; App Service F1 free indefinitely |
| LocalStack Student plan | Free licence + 1,000 monthly CI credits; optional for local S3 testing |
| Cloudflare R2 | 10 GB storage, 1M Class A ops + 10M Class B ops/month, **zero egress**, S3 API — storage fallback |
| Heroku Student | $13/month credit for 24 months (one Basic dyno ≈ $7/mo) — fallback only |
| MongoDB Atlas | **new M0 free cluster in Ireland**; old `parsswim-cluster` is retired after verification |
| DigitalOcean | Retired by project decision (do not use) |
| Vercel | Hobby is free but not allowed for commercial sites — fallback with caveat |

## Known risks / actions for the implementation phase

1. **Rotate the old Atlas DB user** that was exposed in the old env example, then
   retire the old `parsswim-cluster` after the new Atlas M0 is verified; the value
   was never committed to git history.
2. **Atlas access list** — add the Azure VM public IP for runtime and the local
   public IP for the initial `mongorestore`; avoid `0.0.0.0/0` long-term.
3. **Production credentials** — use the long-lived `parsswim-deploy` IAM access
   key for AWS S3; replace `AmazonS3FullAccess` with a bucket-scoped policy.
4. **S3 public access** — make `parsswim-uploads` public-read for `uploads/*`
   only; keep `parsswim-backups-amir` private. `S3_PUBLIC_BASE_URL` must be set or
   `/uploads/*` will not resolve.
5. **S3 credential scope** — restrict the IAM user to the two buckets only;
   rotate if leaked.
6. Normalise env handling: one `.env` location, complete `backend/.env`,
   `NEXT_PUBLIC_API_URL` per environment; remove Railway callbacks.
7. Replace hardcoded legacy-domain and Railway URLs with env-driven values
   (`PUBLIC_SITE_URL`, `API_BASE_URL`, `PAYMENT_CALLBACK_URL`).
8. Deduplicate the two backend copies and the two repo folders before deploy.
9. Keep the 2026-11-03 backups until the Atlas + storage migration is verified.
10. Zarinpal callbacks must resolve through `parsswim.dev`; verify from Iran.
11. Confirm the Azure VM is in **Ireland (`northeurope`)** and the
    `parsswim.dev` DNS delegation before scheduling cutover.
12. **1 GiB RAM during Next.js build** — use the 2 GB swap and
    `NODE_OPTIONS=--max-old-space-size=768`; build locally if it still OOMs.

## Decision and next steps (2026-11-05)

| Decision | Choice |
| --- | --- |
| Azure region | **Ireland (`northeurope`)**, as provisioned |
| Compute | **Azure for Students Linux VM** (`B2ats_v2`), Nginx + PM2; no Docker/Mongo |
| Database | **MongoDB Atlas M0 free tier (Ireland)** — external |
| Production object storage | **AWS S3 `eu-north-1`** via `@aws-sdk/client-s3` (primary) |
| Storage fallback | **Cloudflare R2** (same code; not needed while AWS works) |
| Local/CI object storage | **LocalStack** + Docker (optional) |
| DNS / TLS | Cloudflare, `parsswim.dev` only |
| AWS | S3 only; IAM key confirmed; EC2 unavailable in the sandbox |
| Backups | completed 2026-11-03 (DB dump + 65 images, hashes verified) |

**Before executing anything:**

1. Add the Azure VM public IP and the local public IP to **Atlas → Network
   Access**.
2. Confirm the Atlas M0 connection string works from the VM (backend health shows
   `database: connected`).
3. Confirm the buckets and set `S3_PUBLIC_BASE_URL`
   (`https://parsswim-uploads.s3.eu-north-1.amazonaws.com`).
4. Confirm `parsswim.dev` DNS delegation (Cloudflare).
5. Decide Zarinpal sandbox vs production for the migration window.
6. Retire the old Atlas cluster only after the new M0 restore is verified.

## Reference commands

```powershell
# read-only server audit
ssh -o BatchMode=yes root@161.35.174.84 "pm2 ls; df -h /; free -m"

# database counts (computed on the server; secrets never printed)
ssh root@161.35.174.84 "cd /root/parsswim-backend && node -"   # pipe the mongoose script

# backup extraction (already completed 2026-11-03)
# mongodump was run against the old Atlas URL via a temp binary in /tmp.
# The restore target is now the new Atlas M0 cluster.
#
# Local Windows restore (after downloading MongoDB Database Tools):
# mongorestore.exe --uri "<ATLAS_MONGODB_URL>" --gzip \
#   "C:\Users\Pc Dayan\Desktop\PROJECTS\Projects\parsSwim\backups\db_dump\parsswim-dump"

# Azure VM provisioning (already provisioned in Ireland)
az group list --query "[?location=='northeurope'].name" -o tsv

# Storage credentials (hidden input, writes backend/.env)
# AWS S3: leave endpoint blank, region eu-north-1
powershell -ExecutionPolicy Bypass -File .\scripts\init-s3-env.ps1 -Provider aws
# R2 fallback: R2 endpoint, region auto, public base URL required
powershell -ExecutionPolicy Bypass -File .\scripts\init-s3-env.ps1 -Provider r2
# LocalStack
powershell -ExecutionPolicy Bypass -File .\scripts\init-s3-env.ps1 -Provider localstack

# current public status
curl.exe -s -o NUL -w "%{http_code}`n" https://parsswim.dev/
```
