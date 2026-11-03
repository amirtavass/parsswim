# ParsSwim — Architecture & Migration Plan (Multi-Cloud, $0/month)

Definitive plan as of **2026-11-03**. Supersedes the earlier AWS-EC2-first draft.

## 1. Decision summary

| Workload | Provider | Spec | Cost | Notes |
| --- | --- | --- | --- | --- |
| Frontend + backend compute | **Azure for Students — Linux VM** | `B2ats_v2` (2 vCPU / 1 GiB) preferred, `B1s` fallback; Ubuntu 24.04 | **$0 for 12 months** (student free services) | Nginx + PM2, same layout as today. Azure $100 credit is the month-13 buffer. |
| Object storage — production | **Amazon S3** | `parsswim-uploads` (public read) + `parsswim-backups` (private) | **pennies/month** (≪ $1) | Real `@aws-sdk/client-s3`, native AWS portfolio value. |
| Object storage — local/CI | **LocalStack + Docker (WSL 2)** | `http://localhost:4566`, path-style | $0 | Same SDK, different endpoint. |
| Database | **MongoDB Atlas M0** | 512 MB shared, always free | $0 | Production data already lives here. |
| DNS / TLS / proxy | **Cloudflare** | Free plan, proxied | $0 | Domain: `parsswim.dev` only. |
| Legacy host | DigitalOcean droplet `161.35.174.84` | 1 vCPU / 1 GB | retire after cutover | Source of truth until cutover, then snapshot + destroy. |
| AWS credit | reserved for S3/backups | $100, **181 days remaining** (2026-11-03) | not spent on compute | No EC2, no NAT, no ALB, no EIP. |

**Domain policy:** `parsswim.dev` is the only production domain. The legacy `.ir`
domain has expired and is retired — no registrar, nameserver, or DNS work.

## 2. Why this split

- **AWS credit is protected.** EC2 `t3.micro` + EBS + EIP would burn ~$11/month
  (~$66 of the $100 in 6 months). S3 for this workload is < $1/month, so the
  credit lasts far beyond its 181-day window and expiry never threatens compute.
- **One compute host is the cleanest migration.** The app is same-origin today:
  Nginx routes `/` → Next `:3000` and `/api/` → Express `:4000`, so cookies,
  `express-session`, JWT and Zarinpal callbacks keep working with no rewrite.
- **Vercel + Heroku is rejected as the primary split.** Vercel Hobby forbids
  commercial use, the split introduces cross-site cookies/CORS/callback
  rewrites, and the Heroku student credit ends after 24 months. It stays as the
  fallback if the Azure student VM is unavailable.
- **Atlas is already the database.** Production traffic reads the existing
  `parsswim-cluster` Atlas cluster, so the M0 free tier is not a migration
  target to build — only to verify and allowlist.
- **Real S3 beats R2 here.** With active credit, native S3 is genuinely used
  (SDK, IAM, presigning/policies, lifecycle) at negligible cost. Cloudflare R2
  remains a drop-in fallback because both speak the S3 API.

## 3. Current state (audited 2026-11-01, verified 2026-11-03)

### Application

| Component | Detail |
| --- | --- |
| Frontend | Next.js 15.1 (React 18), App Router, Tailwind; `next start` on `:3000` |
| Backend | Express 4 on `:4000`, Passport + JWT, `express-session` stored in Mongo |
| Database | **Atlas** `parsswim-cluster` (not local Mongo on the droplet) |
| DB collections | `products` 12, `classes` 4, `users` 4, `payment` 0, `sessions` 0 |
| Files | Multer `diskStorage` on the droplet, `backend/public/uploads/images` — 65 files, 7,893,221 bytes |
| Payments | Zarinpal sandbox merchant id hardcoded in `server.js` |
| Deploy | PM2 (`parsswim-backend`, `parsswim-frontend`) + Nginx; Certbot |

### Live infrastructure

| Item | Detail |
| --- | --- |
| Droplet | `161.35.174.84` (Ubuntu 24.04, Node 20.20.2, 1 GB RAM, 24 GB disk, 5.5 GB used) |
| Domain | `parsswim.dev` / `www.parsswim.dev` → this IP; TLS valid until 2026-12-29 |
| SSH | `root@161.35.174.84` with `~/.ssh/id_ed25519` |
| Status | `https://parsswim.dev/` → 200, `/api/` → 200, HTTP → 301 |

### Backups completed (2026-11-03)

| Artifact | Location (local, git-ignored) | Verification |
| --- | --- | --- |
| Database | `backups/db_dump/parsswim-dump/parsswim/` (`mongodump --gzip`) | SHA-256 of every file matches the droplet copy |
| Uploads | `backups/uploads/images/` (65 files) | 65/65 SHA-256 match, 7,893,221 bytes |

### Repo hygiene

- `backend/.env.example` leaked a real-looking DB credential — **scrubbed** and
  committed, and the file is now tracked as a safe template (`!.env.example`).
  The credential was never in git history, so no history rewrite is needed.
- Two backend copies exist (`backend/` tracked, `parsswim-backend/` untracked).
- `backend/.env` still lacks `MONGODB_URL`; the live value lives in
  `backend/.env.local`/droplet env. Consolidate to one `.env` location.
- Source still contains hardcoded production URLs and Railway callbacks — fix in
  the code phase (env-driven `PUBLIC_SITE_URL`, `API_BASE_URL`, `PAYMENT_CALLBACK_URL`).

## 4. Target architecture

```
Browser
  |
Cloudflare (DNS, TLS, proxy, caching) — parsswim.dev / www.parsswim.dev
  |
  v
Azure Linux VM (Ubuntu 24.04, Nginx)
  /        -> Next.js :3000      (PM2)
  /api/    -> Express :4000      (PM2)
  /uploads -> 302 -> S3 public URL
  |
  +--> MongoDB Atlas M0 (external)
  +--> Amazon S3
         parsswim-uploads  (public read: images)
         parsswim-backups  (private: mongodump, lifecycle 30-90 days)

Local dev / CI: LocalStack in Docker (WSL 2) emulates the same S3 API.
```

## 5. Compute — Azure for Students (chosen)

| Aspect | Detail |
| --- | --- |
| SKU | `B2ats_v2` (2 vCPU / 1 GiB) preferred; `B1s` (1 vCPU / 1 GiB) fallback |
| Region | `uksouth` (preferred) or `westeurope` — must be available in the student subscription |
| OS | Ubuntu 24.04 LTS |
| Runtime | Node 20 via `nvm`, PM2, Nginx |
| Memory | 2 GB swap; build Next.js locally/CI, never on the 1 GiB VM |
| Network | Azure NSG: 22 from home IP, 80/443 from Cloudflare, close 3000/4000 |
| Cost | $0 for 12 months of student free services; Azure credit covers month 13+ |
| Exit ramp | Month 10: move to Azure App Service F1 (always free) or the Vercel + Heroku split; S3/Atlas stay as-is |

**Why not AWS EC2:** it spends the credit and forces a 6-month compute
migration. **Why not Vercel + Heroku as primary:** Vercel Hobby commercial-use
restriction, cross-site session/CORS complexity, and Heroku credit expiry.

## 6. Object storage — Amazon S3 (production) + LocalStack (dev)

### Buckets

| Bucket | Access | Contents | Lifecycle |
| --- | --- | --- | --- |
| `parsswim-uploads` | Public read restricted to `uploads/*` | product/class images | none |
| `parsswim-backups` | Private (Block Public Access on) | `mongodump` archives under `Backup/YYYY-MM-DD/` | expire after 30–90 days |

### Design

1. `lib/storage.js` exposes `putObject(key, buffer, contentType)` and
   `deleteObject(key)` using `@aws-sdk/client-s3`.
2. Multer switches to `memoryStorage` (5 MB cap, image MIME filter); the route
   uploads the buffer and the DB keeps storing `/uploads/images/<name>` for URL
   compatibility.
3. `GET /uploads/*` redirects (302) to `S3_PUBLIC_BASE_URL/<key>`; no object
   streaming through the VM for the public images.
4. A one-off migration script copies the 65 existing files from
   `backups/uploads/images/` into `parsswim-uploads` and verifies checksums.
5. Nightly `mongodump` is uploaded to `parsswim-backups` (tested against
   LocalStack first), satisfying the "real AWS" requirement cheaply.

### Configuration matrix

| Variable | LocalStack | Production (AWS S3) |
| --- | --- | --- |
| `S3_ENDPOINT` | `http://localhost:4566` | *(unset — native AWS)* |
| `S3_REGION` | `us-east-1` | `eu-west-2` (confirm) |
| `S3_BUCKET` | `parsswim-uploads` | `parsswim-uploads` |
| `S3_FORCE_PATH_STYLE` | `true` | `false` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | `test` / `test` | IAM user keys (never in repo) |
| `S3_PUBLIC_BASE_URL` | `http://localhost:4566/parsswim-uploads` | `https://parsswim-uploads.s3.eu-west-2.amazonaws.com` |
| `S3_BACKUP_BUCKET` | `parsswim-backups` | `parsswim-backups` |

### IAM least privilege

IAM user `parsswim-s3-app`, no console access, access key stored only in the
deployment env:

- `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on
  `arn:aws:s3:::parsswim-uploads/uploads/*`
- `s3:PutObject`, `s3:GetObject`, `s3:ListBucket` on `parsswim-backups/*`
- no `s3:*`, no bucket deletion, no IAM rights.

## 7. Database — MongoDB Atlas M0

- Keep the existing `parsswim-cluster` (confirm it is **M0**, not a paid tier).
- Create/rotate a dedicated app user; allowlist the Azure VM public IP only.
- Sessions live in Mongo (`connect-mongo`), which is fine on M0.
- The 2026-11-03 `mongodump` is a safety backup, not a restore step — production
  data is already in Atlas.

## 8. Domain, DNS and TLS

- **Only** `parsswim.dev` and `www.parsswim.dev` are served.
- Cloudflare free zone: proxied `A`/`CNAME` records to the Azure VM public IP.
- TLS: Cloudflare Origin CA certificate on Nginx, or Let's Encrypt; SSL/TLS mode
  **Full (strict)**; HSTS after verification.
- Images resolve to the S3 public URL (`parsswim-uploads.s3.eu-west-2.amazonaws.com`)
  or, optionally, a Cloudflare Worker proxy — not a bucket-hosted custom domain.

## 9. Cost model

| Resource | Spec | Est. / month |
| --- | --- | --- |
| Azure Linux VM | `B2ats_v2` / `B1s`, Ubuntu 24.04 | **$0** (12-month student free services) |
| Amazon S3 | ~10 MB objects, low requests | **< $1** (pennies) |
| Data transfer | Cloudflare proxy + small image traffic | ~$0 |
| MongoDB Atlas M0 | 512 MB shared | $0 |
| Cloudflare DNS/proxy | Free plan | $0 |
| **Total** | | **≈ $0 out of pocket; AWS credit barely touched** |

AWS credit runway is no longer a compute deadline: S3 spend is a few dollars at
most across the 181 remaining days.

## 10. Guardrails

1. AWS root: MFA on, no root access keys; use the least-privilege IAM user.
2. AWS Budgets alarms at **$5 and $10**, hard spend limit on; no EC2/EIP/NAT/ALB.
3. Tag S3 buckets `Project=parsswim`, `Owner=...`.
4. Azure: budget alert on the student subscription; one VM, one public IP.
5. Secret rotation: create a new Atlas DB user, then disable the leaked one.
6. Store all credentials outside the repo (`.env` on the VM, local `.env`).

## 11. Migration order (execution after approval)

0. **Hygiene** — dedupe `backend/` vs `parsswim-backend/`, consolidate env files,
   remove hardcoded domains/Railway from code, rotate Atlas credential. *(scrub done)*
1. **Storage abstraction** — add `lib/storage.js`, switch Multer to memory, add
   `/uploads` redirect; test against LocalStack.
2. **LocalStack locally** — Docker Engine in WSL 2, `awslocal s3 mb`, upload test,
   optional `mongodump` backup test.
3. **Azure VM** — provision `B2ats_v2`/`B1s`, NSG, swap, Node 20, PM2, Nginx.
4. **S3** — create buckets + IAM user, configure bucket policy, run file migration
   from `backups/uploads/images/` and verify 65/65.
5. **Atlas** — confirm M0, rotate user, allowlist the VM IP, point env at Atlas.
6. **Cloudflare** — zone for `parsswim.dev`, proxied records to the VM, Origin CA,
   Full (strict).
7. **Cutover** — freeze writes, final `mongodump` to S3, deploy, verify `/` and
   `/api/health`, keep the droplet 48 h for rollback, then snapshot and destroy.
8. **Post** — nightly `mongodump` → S3, uptime monitor, budget review, month-10
   compute exit ramp.

## 12. Risks

- **Azure student VM availability/SKU:** confirm `B2ats_v2`/`B1s` in the
  subscription and region before cutover; otherwise use the Vercel + Heroku
  fallback.
- **1 GiB RAM:** Next.js builds can OOM → build locally/CI, enable 2 GB swap.
- **S3 public bucket abuse:** keep the public policy scoped to `uploads/*` and
  set a request alarm; backups stay private.
- **Zarinpal callbacks:** must resolve through `parsswim.dev`; verify from Iran.
- **DNS registrar:** confirm `parsswim.dev` is delegated to Cloudflare before the
  cutover window.
- **Only one 12-month compute window:** the month-10 exit ramp is mandatory, but
  it is a compute-only move (data and storage stay put).

## 13. Open decisions

1. Azure region/SKU that is actually available in the student subscription.
2. S3 region (`eu-west-2` suggested) and whether public-read images are acceptable
   versus presigned URLs.
3. Zarinpal: keep sandbox during migration or wire the production merchant id.
4. Cutover window and write-freeze duration.
5. Whether `parsswim.dev` DNS is already on Cloudflare or stays at its registrar.
