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
| AWS CLI | not installed (not required; the SDK reads env vars) |
| WSL | WSL 2 present, but **no distribution installed** → `wsl --install -d Ubuntu` + Docker Engine (or Docker Desktop) is required for LocalStack |
| Docs folder | `docs/` |
| Scripts | `scripts/init-aws-env.ps1` (secure AWS key injection; no secrets echoed) |

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
| Ports | frontend 3000, backend 4000 |
| Upload | Multer `memoryStorage` (5 MB cap, image MIME filter) → `backend/lib/storage.js` → S3 `parsswim-uploads`; local-disk fallback when S3 env is absent |
| Upload key | `buildUploadKey()` → `uploads/images/<timestamp>-<name>`; API returns `/uploads/images/<file>` (URL-compatible) |
| Upload serving | `GET /uploads/*` 302s to the S3 public URL when configured; otherwise serves `backend/public/uploads` |
| Images | `ProductCard` builds `NEXT_PUBLIC_API_URL.replace("/api","") + image` |
| Payments | Zarinpal **sandbox** merchant id hardcoded in `server.js`; Railway callback URL still present in production branch |
| CORS | allow-list now uses `parsswim.dev` + `localhost:3000` in code; move to env-driven `ALLOWED_ORIGINS` |
| Database | **Atlas** (current, being retired) `parsswim-cluster.dja3fdh.mongodb.net`, DB `parsswim`; **target: Cosmos DB for MongoDB free tier** |

Environment layout (keys only, no values):

| File | Keys |
| --- | --- |
| `.env` (root) | `PORT`, `NODE_ENV`, `MONGODB_URL`, `SESSION_SECRET`, `COOKIE_SECRET`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` |
| `.env.local` (root) | `NEXT_PUBLIC_API_URL=http://localhost:4000` |
| `backend/.env` | `COOKIE_SECRET`, `SESSION_SECRET` only |
| `backend/.env.local` | `NODE_ENV`, `PORT`, `MONGODB_URL`, `SESSION_SECRET`, `COOKIE_SECRET`, `FRONTEND_URL`, `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX` |

> **Gotcha:** `server.js` calls `dotenv.config()` (loads `backend/.env` only).
> Locally that file has no `MONGODB_URL`, so the backend falls back to
> `mongodb://localhost:27017/parsswim`. The droplet's `backend/.env` holds the
> Atlas URL. Consolidate to one env location during migration.

AWS S3 variables belong in `backend/.env` (git-ignored):
`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
`S3_UPLOADS_BUCKET`, `S3_BACKUPS_BUCKET`. Inject them with
`powershell -ExecutionPolicy Bypass -File .\scripts\init-aws-env.ps1`
(hidden input, never echoed). They were **not present in any `.env`** at audit
time on 2026-11-03.

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
| Docker/LocalStack/AWS CLI | none installed |
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
| AWS promotional tier (this account) | **$100 credit, 181 days remaining** as of 2026-11-03; reserved for S3/backups |
| Azure for Students | Untouched **12-month free Linux VM** (`B1s`/`B2ats_v2`); $100 credit; App Service F1 free indefinitely |
| LocalStack Student plan | Free licence + 1,000 monthly CI credits; requires Docker + auth token |
| Heroku Student | $13/month credit for 24 months (one Basic dyno ≈ $7/mo) — fallback only |
| MongoDB Atlas | Current cluster; being retired in favor of the Cosmos free tier |
| Azure Cosmos DB for MongoDB | Free tier: 1000 RU/s + 25 GB; **one free-tier account per subscription** |
| DigitalOcean | Retired by project decision (do not use) |
| Vercel | Hobby is free but not allowed for commercial sites — fallback with caveat |

## Known risks / actions for the implementation phase

1. **Rotate the Atlas DB user** that was exposed in the old env example, then
   disable the Atlas cluster once Cosmos is verified; the value was never
   committed to git history.
2. **Preflight the Cosmos free tier** — one free-tier account per subscription.
   If already used, Alternative A becomes paid; use the self-hosted MongoDB
   fallback (0.25 GB WiredTiger cache + 2 GB swap).
3. **Verify Cosmos Mongo API compatibility** with Mongoose 7 / `connect-mongo`
   (TTL index on sessions, no transactions) and that `mongorestore` imports the
   2026-11-03 dump.
4. Normalise env handling: one `.env` location, complete `backend/.env`,
   `NEXT_PUBLIC_API_URL` per environment; remove Railway callbacks.
5. Replace hardcoded legacy-domain and Railway URLs with env-driven values
   (`PUBLIC_SITE_URL`, `API_BASE_URL`, `PAYMENT_CALLBACK_URL`).
6. Deduplicate the two backend copies and the two repo folders before deploy.
7. Keep the 2026-11-03 backups until the Cosmos + S3 migration is verified.
8. Zarinpal callbacks must resolve through `parsswim.dev`; verify from Iran.
9. Confirm `B2ats_v2`/`B1s` availability in `germanywestcentral` and the
   `parsswim.dev` DNS delegation before scheduling cutover.
10. Install a WSL distro + Docker Engine (or Docker Desktop) before LocalStack
    testing; WSL 2 currently has no distribution.

## Decision and next steps (2026-11-03)

| Decision | Choice |
| --- | --- |
| Azure region | **`germanywestcentral`** (all resources) |
| Compute | **Azure for Students Linux VM** (`B2ats_v2`/`B1s`), Nginx + PM2 |
| Production object storage | **Amazon S3** (`@aws-sdk/client-s3`) |
| Local/CI object storage | **LocalStack** + Docker (WSL 2) |
| Database | **Azure Cosmos DB for MongoDB free tier** |
| DB fallback | Self-hosted MongoDB on the VM (0.25 GB cache + 2 GB swap) |
| DNS / TLS | Cloudflare, `parsswim.dev` only |
| AWS credit | reserved for S3/backups; no EC2 |
| Backups | completed 2026-11-03 (DB dump + 65 images, hashes verified) |

**Before executing anything:**

1. Confirm `B2ats_v2`/`B1s` availability in `germanywestcentral` and that the
   Cosmos free tier is unused in the subscription.
2. Create/confirm the S3 buckets + least-privilege IAM user and set budget alarms
   ($5/$10), with the AWS hard spend limit on.
3. Confirm `parsswim.dev` DNS delegation (Cloudflare or registrar).
4. Decide Zarinpal sandbox vs production for the migration window.
5. Rotate the Atlas DB user, then disable Atlas after Cosmos verification.

## Reference commands

```powershell
# read-only server audit
ssh -o BatchMode=yes root@161.35.174.84 "pm2 ls; df -h /; free -m"

# database counts (computed on the server; secrets never printed)
ssh root@161.35.174.84 "cd /root/parsswim-backend && node -"   # pipe the mongoose script

# backup extraction (already completed 2026-11-03)
# mongodump was run against the Atlas URL via a temp binary in /tmp;
# the restore target is now Cosmos DB (same dump, verified counts)

# Azure provisioning (exact commands in docs/architecture-options.md §12)
az group create --name parsswim-rg --location germanywestcentral

# current public status
curl.exe -s -o NUL -w "%{http_code}`n" https://parsswim.dev/
```
