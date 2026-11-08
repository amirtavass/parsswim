# ParsSwim — Architecture & Migration Plan (Azure compute, Atlas M0 database, S3 storage, $0/month)

Definitive plan as of **2026-11-05** (Phase 2 final: Azure VM + MongoDB Atlas M0 +
AWS S3, with Cloudflare R2 as the drop-in storage fallback).

## 1. Decision summary

| Workload | Provider | Spec | Cost | Notes |
| --- | --- | --- | --- | --- |
| Frontend + backend | **Azure for Students — Linux VM** | `B2ats_v2` (2 vCPU / 1 GiB), Ubuntu 24.04, region **Ireland (`northeurope`)** | **$0 for 12 months** | Nginx + PM2 only; no Docker, no local MongoDB. |
| Database | **MongoDB Atlas M0 (free tier)** | Ireland; DB `parsswim`; DB user with `readWrite` | **$0** | External to the VM; saves the entire 1 GiB for Node. |
| Object storage — production | **AWS S3, `eu-north-1`** (primary) | `parsswim-uploads` public, `parsswim-backups-amir` private | **pennies/month** | IAM user `parsswim-deploy`; S3 API via `@aws-sdk/client-s3`. |
| Object storage — production fallback | **Cloudflare R2** | S3-compatible; 10 GB storage, zero egress | **$0** within free tier | Same code; only env changes. |
| Object storage — local/CI | **LocalStack + Docker** | `http://localhost:4566`, path-style | $0 | Optional for local testing. |
| DNS / TLS / proxy | **Cloudflare** | Free plan, proxied | $0 | `parsswim.dev` only. |
| Legacy host | DigitalOcean droplet `161.35.174.84` | 1 vCPU / 1 GB | retire after cutover | Source of truth until cutover, then snapshot + destroy. |
| AWS account | **S3 only** | IAM access key confirmed; EC2 unavailable | S3 pennies/month | No compute on AWS. |

**AWS S3 is confirmed:** the `parsswim-deploy` IAM user with an access key was
created, and the `parsswim-uploads` / `parsswim-backups-amir` buckets exist in
`eu-north-1`. After the migration, replace `AmazonS3FullAccess` with a bucket-scoped
policy.

**Database is external:** the Azure VM does **not** run Docker or MongoDB. MongoDB
Atlas M0 hosts the database, so the VM only runs Node.js 20, PM2, Nginx, and
Certbot.

**Domain policy:** `parsswim.dev` is the only production domain. The legacy `.ir`
domain has expired and is retired — no registrar or DNS work.

## 2. Phase 2 decisions

### 2.1 Region and SKU

- **Region: Ireland (`northeurope`)** — the VM is already provisioned there.
- **SKU: `B2ats_v2`** (2 vCPU / 1 GiB).
- With MongoDB off the VM, the 1 GiB is reserved for Next.js, Express, PM2/Nginx,
  and the OS. A 2 GB swap file remains as a build-time safety net.

### 2.2 Database: MongoDB Atlas M0 (free tier)

| Criterion | A — Atlas M0 | B — Self-hosted MongoDB on the VM |
| --- | --- | --- |
| Cost | $0 (512 MB–5 GB free tier) | $0 (uses the VM) |
| VM RAM impact | **none** | ~150–250 MB + page cache |
| Compatibility | Upstream MongoDB (Mongoose 7, `connect-mongo`) | Upstream MongoDB |
| Ops | managed HA/patching; M0 has no automated cloud backups | install/patch/backup yourself |
| Network | Atlas access list must include the VM public IP | loopback only |
| Failure mode | M0 limits (shared CPU, 500 connections) | OOM/swap thrash on 1 GiB |

**Decision: Atlas M0, external to the VM.**

Rationale:

1. The dataset is tiny (12 products, 4 classes, 4 users, 0 payments), well inside
   the M0 free limits.
2. Keeping `mongod` off the 1 GiB VM removes the largest OOM risk.
3. Exact upstream MongoDB compatibility for Mongoose 7 and `connect-mongo`.
4. The VM stays a simple app host: Node, PM2, Nginx, Certbot.

Operational notes:

- Add the **Azure VM public IP** and the **local public IP** (for the initial
  restore) to Atlas → Network Access.
- Connection string lives only in `backend/.env`:
  `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/parsswim?retryWrites=true&w=majority`
- M0 has no automated cloud backups; keep periodic `mongodump` exports in
  `parsswim-backups-amir`.

### 2.3 Storage: provider-agnostic S3 API (AWS S3 primary, R2 fallback)

AWS is the **storage** layer only; compute stays on Azure. The storage layer uses
canonical `S3_*` environment variables and `@aws-sdk/client-s3`, so the same code
runs against AWS S3, Cloudflare R2, or LocalStack:

| Concern | AWS S3 (primary) | Cloudflare R2 (fallback) | LocalStack |
| --- | --- | --- | --- |
| `S3_ENDPOINT` | empty | `https://<account-id>.r2.cloudflarestorage.com` | `http://localhost:4566` |
| `S3_REGION` | `eu-north-1` | `auto` | `us-east-1` |
| Credentials | IAM access key (long-lived) | R2 API token | `test` / `test` |
| `S3_FORCE_PATH_STYLE` | `false` | `true` | `true` |
| `S3_PUBLIC_BASE_URL` | `https://parsswim-uploads.s3.eu-north-1.amazonaws.com` | `https://uploads.parsswim.dev` (or `r2.dev`) | `http://localhost:4566/parsswim-uploads` |

Legacy `AWS_*` and `R2_*` variable names are still read as fallbacks; new setups
should use the canonical `S3_*` names. Temporary STS credentials are supported via
`S3_SESSION_TOKEN` (or `AWS_SESSION_TOKEN`), but production uses the long-lived IAM
access key.

| Bucket | Access | Contents |
| --- | --- | --- |
| `parsswim-uploads` | Public read for `uploads/*` only | product/class/user images |
| `parsswim-backups-amir` | Private (credentials only) | `mongodump` archives under `Backup/YYYY-MM-DD/` |

**Images are served browser → S3 directly**, not proxied through Azure, so there
is no meaningful Azure↔S3 egress (only small backup/restore traffic).

## 3. Why this split

- **Azure is compute only.** Next.js, Express, Nginx, PM2, Certbot. No Docker, no
  MongoDB.
- **Atlas M0 is the database.** Managed, free, and off the 1 GiB VM.
- **AWS S3 is object storage.** Real AWS usage for the portfolio; images bypass
  Azure.
- **Storage is provider-agnostic.** AWS S3 and R2 use identical
  `@aws-sdk/client-s3` code; LocalStack validates the same path locally.
- **Vercel + Heroku is only a fallback**; a single VM keeps same-origin cookies,
  sessions, and Zarinpal callbacks working with no rewrite.

## 4. Current state (audited 2026-11-01, verified 2026-11-05)

### Application

| Component | Detail |
| --- | --- |
| Frontend | Next.js 15.1 (React 18), App Router, Tailwind; `next start` on `:3000` |
| Backend | Express 4 on `:4000`, Passport + JWT, `express-session` stored in Mongo |
| Database | **old Atlas** `parsswim-cluster` — migration target is the new **Atlas M0** |
| DB collections | `products` 12, `classes` 4, `users` 4, `payment` 0, `sessions` 0 |
| Files (legacy) | Multer `diskStorage` on the droplet, `backend/public/uploads/images` — 65 files, 7,893,221 bytes |
| Upload path (new) | Multer `memoryStorage` → `backend/lib/storage.js` → S3-compatible store; local-disk fallback when S3 env is absent |
| Payments | Zarinpal sandbox merchant id hardcoded in `server.js` |
| Deploy | PM2 (`parsswim-backend`, `parsswim-frontend`) + Nginx; Certbot |

### Live infrastructure

| Item | Detail |
| --- | --- |
| Droplet | `161.35.174.84` (Ubuntu 24.04, Node 20.20.2, 1 GB RAM, 24 GB disk, 5.5 GB used) |
| Domain | `parsswim.dev` / `www.parsswim.dev` → this IP; TLS valid until 2026-12-29 |
| SSH | `root@161.35.174.84` with `~/.ssh/id_ed25519` |
| Status | `https://parsswim.dev/` → 200, `/api/` → 200, HTTP → 301 |
| New VM | Azure `B2ats_v2` in Ireland (`northeurope`), Ubuntu 24.04 |

### Backups completed (2026-11-03)

| Artifact | Local path (git-ignored) | Verification |
| --- | --- | --- |
| Database | `backups/db_dump/parsswim-dump/parsswim/` (`mongodump --gzip`) | SHA-256 of every file matches the droplet copy |
| Uploads | `backups/uploads/images/` (65 files) | 65/65 SHA-256 match, 7,893,221 bytes |

### Local tooling

| Item | State |
| --- | --- |
| Azure CLI | installed and authenticated (`Azure for Students`) |
| Docker | **not installed** locally (not needed for the VM) |
| MongoDB Database Tools | **not installed**; download the Windows zip for the Atlas restore |
| AWS CLI | not required locally; Node scripts use the SDK |
| AWS S3 | **working** — `parsswim-uploads` and `parsswim-backups-amir` exist in `eu-north-1` |
| S3 keys | injected into a git-ignored `.env` only (`scripts/init-s3-env.ps1`); never commit |
| Atlas | M0 free cluster in Ireland, DB `parsswim` |

## 5. Target architecture

```
Browser
  |
Cloudflare (DNS, TLS, proxy, caching) — parsswim.dev / www.parsswim.dev
  |
  v
Azure Linux VM — Ireland / northeurope (Ubuntu 24.04, Nginx)
  /        -> Next.js :3000        (PM2)
  /api/    -> Express :4000        (PM2)
  /uploads -> 302 -> S3 public URL
  |
  +--> MongoDB Atlas M0 (external, Ireland)
  +--> AWS S3 eu-north-1
         parsswim-uploads      (public: images)
         parsswim-backups-amir (private: mongodump)

Browser --(images, direct)--> AWS S3

No Docker and no MongoDB process run on the VM.
Local dev / CI: LocalStack in Docker emulates the same S3 API.
```

## 6. Compute — Azure (Ireland)

| Aspect | Detail |
| --- | --- |
| SKU | `B2ats_v2` (fallback `B1s`) |
| Region | Ireland (`northeurope`) |
| OS | Ubuntu 24.04 LTS |
| Runtime | Node 20, PM2, Nginx, Certbot |
| Memory | 2 GB swap, `vm.swappiness=10`; Node heap caps for builds |
| Network | NSG: 22 from home IP, 80/443 public; 3000/4000 closed externally |
| Public IP | Standard SKU, static (needed for DNS) |
| Cost | $0 for 12 months of student free services |
| Exit ramp | Month 10: Azure App Service F1 (always free) or Vercel + Heroku; Atlas and S3 are unchanged |

## 7. Object storage — S3-compatible (AWS S3 primary / R2 fallback)

### Design (implemented in `backend/lib/storage.js`)

1. `putObject(key, buffer, contentType)` and `deleteObject(key)` wrap
   `@aws-sdk/client-s3`. The client is built from `S3_ENDPOINT`, `S3_REGION`,
   `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`; legacy `AWS_*`/`R2_*` names are
   accepted as fallbacks. When credentials are absent the functions fall back to
   local disk so `npm run dev` still works.
2. Multer uses `memoryStorage` (5 MB cap, image MIME filter); the DB keeps storing
   `/uploads/images/<name>` for URL compatibility.
3. `GET /uploads/*` redirects (302) to the public S3/R2 URL when configured;
   otherwise it serves the local folder.
4. `scripts/migrate-uploads-to-s3.js` uploads the 65 images and verifies size/MD5.
5. Backups: `mongodump --gzip` exports are uploaded to `parsswim-backups-amir`
   (M0 has no automated cloud backups).

### Migration tooling

| Script | Purpose |
| --- | --- |
| `scripts/setup-azure-vm.sh` | Provisions the Ubuntu 24.04 app host: Node 20, PM2, Nginx, Certbot, 2 GB swap, UFW. No Docker/MongoDB. |
| `scripts/init-s3-env.ps1` | Injects canonical `S3_*` values into `backend/.env` (hidden secret input; can import from an existing `.env` with `-SourceEnvFile`). |
| `scripts/migrate-uploads-to-s3.js` | Uploads `backups/uploads/images/` to `S3_UPLOADS_BUCKET` with per-file size/MD5 verification. Supports `--dry-run`. |
| `scripts/backup-db-to-s3.js` | Runs `mongodump --gzip --archive` (or tars an existing dump with `--dir`), uploads to `S3_BACKUPS_BUCKET` under `Backup/YYYY-MM-DD/`, verifies size. Supports `--file`, `--dir`, `--dry-run`. |

### Canonical configuration

| Variable | AWS S3 | Cloudflare R2 | LocalStack |
| --- | --- | --- | --- |
| `S3_ENDPOINT` | *(empty)* | `https://<account_id>.r2.cloudflarestorage.com` | `http://localhost:4566` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | IAM access key (never in repo) | R2 API token (never in repo) | `test` / `test` |
| `S3_REGION` | `eu-north-1` | `auto` | `us-east-1` |
| `S3_FORCE_PATH_STYLE` | `false` | `true` | `true` |
| `S3_UPLOADS_BUCKET` | `parsswim-uploads` | `parsswim-uploads` | `parsswim-uploads` |
| `S3_BACKUPS_BUCKET` | `parsswim-backups-amir` | `parsswim-backups-amir` | `parsswim-backups-amir` |
| `S3_PUBLIC_BASE_URL` | `https://parsswim-uploads.s3.eu-north-1.amazonaws.com` | `https://uploads.parsswim.dev` (or `r2.dev`) | `http://localhost:4566/parsswim-uploads` |

## 8. Database — MongoDB Atlas M0

| Aspect | Detail |
| --- | --- |
| Tier | Atlas **M0** free cluster, Ireland |
| Database | `parsswim` |
| DB user | `readWrite` on `parsswim` (used by the app) |
| Network access | Azure VM public IP + local public IP (for restore) |
| Connection | `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/parsswim?retryWrites=true&w=majority` |
| Restore | `mongorestore --gzip` from local Windows using MongoDB Database Tools |
| Backup | periodic `mongodump` → `parsswim-backups-amir` (M0 has no automated cloud backups) |
| Limits | shared CPU, 512 MB–5 GB storage, ~500 connections — well above this app's needs |

## 9. Domain, DNS and TLS

- **Only** `parsswim.dev` and `www.parsswim.dev` are served.
- Cloudflare free zone: proxied records to the Azure static public IP.
- TLS: Let's Encrypt via Certbot on Nginx (DNS-only during issuance), then
  Cloudflare **Full (strict)** with the proxy re-enabled.
- Images resolve to the S3 virtual-hosted URL
  (`https://parsswim-uploads.s3.eu-north-1.amazonaws.com/...`).

## 10. Cost model

| Resource | Spec | Est. / month |
| --- | --- | --- |
| Azure Linux VM | `B2ats_v2`, Ireland | **$0** (12-month student free services) |
| MongoDB Atlas M0 | free tier | **$0** |
| AWS S3 (primary) | 2 buckets, ~8 MB uploads + small backups | **< $1** (pennies) |
| Cloudflare R2 (fallback) | 10 GB storage, zero egress | **$0** (free tier) |
| Cloudflare DNS/proxy | Free plan | $0 |
| **Total** | | **~$0/month** |

## 11. Guardrails

1. **No AWS compute.** EC2 is unavailable; do not attempt EC2/EIP/NAT/ALB.
2. Replace `AmazonS3FullAccess` with a bucket-scoped IAM policy after launch;
   rotate the access key if leaked.
3. `parsswim-uploads` is public-read **only** for `uploads/*`;
   `parsswim-backups-amir` stays private.
4. Atlas access list includes only the VM public IP and the local admin IP; never
   `0.0.0.0/0` long-term.
5. Azure budget alert on the student subscription.
6. No Docker or MongoDB on the VM; nothing listens on 27017.
7. Rotate the old Atlas credential, then retire the old `parsswim-cluster` after
   the new M0 is verified.
8. Store all credentials outside the repo (`.env` on the VM, local `.env`).

## 12. Migration order

0. **Hygiene** — dedupe `backend/` vs `parsswim-backend/`, consolidate env files,
   remove hardcoded domains/Railway from code, rotate the old DB credential.
1. **Storage abstraction** — `lib/storage.js`, Multer memory storage, `/uploads`
   redirect, provider-agnostic `S3_*` env, `scripts/init-s3-env.ps1`. *(done)*
2. **AWS S3** — IAM user + access key, buckets, upload images, verify. *(done)*
3. **Azure VM** — `B2ats_v2` in Ireland, Node 20, PM2, Nginx, Certbot, swap, UFW.
   *(VM live; run `scripts/setup-azure-vm.sh`)*
4. **Atlas M0** — create the DB user and network access; restore the 2026-11-03
   dump from local Windows with `mongorestore`; verify counts (12/4/4/0/0).
5. **App deploy** — clone repo, transfer `.env` files, build Next.js, start both
   PM2 processes.
6. **Cloudflare** — point `parsswim.dev`/`www` to the VM, run Certbot (DNS-only),
   then re-enable the proxy with Full (strict).
7. **Cutover** — freeze writes, final `mongodump` to S3, verify `/` and `/api/`,
   keep the droplet 48 h for rollback, then snapshot and destroy.
8. **Post** — periodic `mongodump` → S3, uptime monitor, budget review, month-10
   compute exit ramp.

## 13. Risks

- **1 GiB RAM during Next.js build** → 2 GB swap plus `NODE_OPTIONS=--max-old-space-size=768`;
  build locally if the VM still OOMs.
- **Atlas M0 limits** → shared CPU and ~500 connections; fine for this workload,
  but avoid connection storms (one PM2 backend instance).
- **Atlas access list** → the VM cannot connect until its public IP is added.
- **S3 public bucket policy** → public-read must be limited to `uploads/*`.
- **Public bucket names** → `parsswim-uploads` must be globally unique; adjust if
  creation fails.
- **Zarinpal callbacks** → must resolve through `parsswim.dev`; verify from Iran.
- **Only one 12-month compute window** → month-10 exit ramp is mandatory; Atlas
  and S3 are unaffected.

## 14. Open decisions

1. **TLS path:** Certbot + Cloudflare Full (strict) (current plan) vs Cloudflare
   Origin CA.
2. **IAM hardening:** replace `AmazonS3FullAccess` with a bucket-scoped policy.
3. **Zarinpal:** keep sandbox during migration or wire the production merchant id.
4. **Cutover window:** when to freeze writes and how long to keep the droplet as
   rollback (suggested 48 h).
