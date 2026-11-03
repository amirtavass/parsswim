# ParsSwim — Architecture & Migration Plan (Multi-Cloud, $0/month)

Definitive plan as of **2026-11-03** (Phase 2 provisioning decisions included).

## 1. Decision summary

| Workload | Provider | Spec | Cost | Notes |
| --- | --- | --- | --- | --- |
| Frontend + backend compute | **Azure for Students — Linux VM** | `B2ats_v2` (2 vCPU / 1 GiB) preferred, `B1s` fallback; Ubuntu 24.04; region **`germanywestcentral`** | **$0 for 12 months** | Nginx + PM2, same layout as today. Region is mandatory per the student subscription. |
| Database | **Azure Cosmos DB for MongoDB (free tier)** | RU-based Mongo API, **1000 RU/s + 25 GB**, region `germanywestcentral` | **$0** (one free-tier account per subscription) | Offloads the DB from the 1 GiB VM. Fallback: self-hosted MongoDB on the VM. |
| Object storage — production | **Amazon S3** | `parsswim-uploads` (public read) + `parsswim-backups` (private) | **pennies/month** (≪ $1) | Real `@aws-sdk/client-s3`; LocalStack for local/CI. |
| Object storage — local/CI | **LocalStack + Docker** | `http://localhost:4566`, path-style | $0 | Docker/WSL 2 not installed yet. |
| DNS / TLS / proxy | **Cloudflare** | Free plan, proxied | $0 | `parsswim.dev` only. |
| Legacy host | DigitalOcean droplet `161.35.174.84` | 1 vCPU / 1 GB | retire after cutover | Source of truth until cutover, then snapshot + destroy. |
| AWS credit | reserved for S3/backups | $100, **181 days remaining** (2026-11-03) | not spent on compute | No EC2/EIP/NAT/ALB. |

**Domain policy:** `parsswim.dev` is the only production domain. The legacy `.ir`
domain has expired and is retired — no registrar or DNS work.

## 2. Phase 2 decisions

### 2.1 Region and SKU

- **Region: `germanywestcentral` — mandatory.** All Azure resources (RG, VM, NSG,
  public IP, Cosmos DB) go there because of the student-subscription constraints
  found on VioletWatch.
- **SKU: `B2ats_v2`** (2 vCPU / 1 GiB) preferred; **`B1s`** (1 vCPU / 1 GiB)
  fallback. Verify with `az vm list-skus` before creating.
- 1 GiB is tight: build Next.js off-VM, add 2 GB swap, cap Node heaps, and keep
  the database off the VM.

### 2.2 Database: Cosmos DB vs self-hosted MongoDB

| Criterion | A — Cosmos DB for MongoDB (free tier) | B — Self-hosted MongoDB on the VM |
| --- | --- | --- |
| Cost | $0 within 1000 RU/s / 25 GB (one free account per subscription) | $0 (uses the VM) |
| VM RAM impact | **none** (external) | ~150–250 MB for `mongod` + page cache pressure |
| Compatibility | Mongo API (RU-based), not upstream MongoDB; TTL/index and transaction differences | Exact MongoDB 7 (Mongoose 7, `connect-mongo`) |
| Ops | managed HA/backups | install/patch/backup yourself |
| Billing risk | 0 if free tier available; RU overage possible | none |
| Failure mode | free tier already used by another account → paid or blocked | OOM/swap thrash on 1 GiB |

**Decision: Alternative A — Azure Cosmos DB for MongoDB free tier.**

Rationale:

1. The binding constraint is the **1 GiB VM**; Next.js + Express + Nginx already
   use most of it. Keeping the DB external is the only comfortable fit.
2. The app uses **simple CRUD only** — verified: no `aggregate`, `$lookup`,
   transactions, or custom indexes. The risk of Mongo-API incompatibility is low.
3. The data is tiny (12 products, 4 classes, 4 users, 0 payments), far inside
   1000 RU/s and 25 GB.
4. It removes DB backup/patching from the single VM.

**Preflight is mandatory:** the Cosmos free tier is **one per subscription**. If
another account already enabled it, Alternative A is no longer $0. In that case
(or if Mongoose compatibility fails), fall back to **Alternative B**: self-hosted
MongoDB with `wiredTigerCacheSizeGB: 0.25`, bound to `127.0.0.1`, 2 GB swap.
The storage abstraction is unaffected either way.

Caveats to verify during migration:

- `connect-mongo` creates a TTL index on sessions; confirm Cosmos honours it
  (if not, sessions simply accumulate slowly — schedule a cleanup).
- RU-based Mongo API does not support every upstream feature; the current code
  does not use any of the known gaps.
- Do not use `db.createUser`; Cosmos authenticates with the account key.

## 3. Why this split

- **AWS credit is protected.** EC2 would burn ~$11/month; S3 for this workload is
  < $1/month, so the credit lasts far beyond its 181-day window.
- **Azure single-origin compute keeps cookies/sessions/callbacks working.** Nginx
  routes `/` → Next `:3000` and `/api/` → Express `:4000`.
- **Vercel + Heroku is only a fallback.** Vercel Hobby forbids commercial use,
  the split complicates cross-site cookies/CORS, and the Heroku credit expires
  after 24 months.
- **Real S3 beats R2 here.** With active credit, native S3 is genuinely used at
  negligible cost; R2 remains a drop-in fallback because both use the S3 API.

## 4. Current state (audited 2026-11-01, verified 2026-11-03)

### Application

| Component | Detail |
| --- | --- |
| Frontend | Next.js 15.1 (React 18), App Router, Tailwind; `next start` on `:3000` |
| Backend | Express 4 on `:4000`, Passport + JWT, `express-session` stored in Mongo |
| Database | **currently Atlas** `parsswim-cluster` — migration target is Cosmos free tier |
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

| Artifact | Local path (git-ignored) | Verification |
| --- | --- | --- |
| Database | `backups/db_dump/parsswim-dump/parsswim/` (`mongodump --gzip`) | SHA-256 of every file matches the droplet copy |
| Uploads | `backups/uploads/images/` (65 files) | 65/65 SHA-256 match, 7,893,221 bytes |

### Local tooling

| Item | State |
| --- | --- |
| Azure CLI | installed (`az`) |
| Docker | **not installed** |
| WSL 2 | present, but **no distribution installed** → LocalStack needs `wsl --install -d Ubuntu` + Docker Engine, or Docker Desktop |
| AWS CLI | not installed (not required; the SDK uses env vars) |
| AWS keys | injected into a git-ignored `.env` only (use `scripts/init-aws-env.ps1`); never commit |

## 5. Target architecture

```
Browser
  |
Cloudflare (DNS, TLS, proxy, caching) — parsswim.dev / www.parsswim.dev
  |
  v
Azure Linux VM — germanywestcentral (Ubuntu 24.04, Nginx)
  /        -> Next.js :3000      (PM2)
  /api/    -> Express :4000      (PM2)
  /uploads -> 302 -> S3 public URL
  |
  +--> Azure Cosmos DB for MongoDB (free tier, same region)
  +--> Amazon S3
         parsswim-uploads  (public read: images)
         parsswim-backups  (private: mongodump, lifecycle 30-90 days)

Local dev / CI: LocalStack in Docker (WSL 2) emulates the same S3 API.
```

## 6. Compute — Azure (germanywestcentral)

| Aspect | Detail |
| --- | --- |
| SKU | `B2ats_v2` preferred; `B1s` fallback |
| Region | `germanywestcentral` (mandatory) |
| OS | Ubuntu 24.04 LTS |
| Runtime | Node 20 via `nvm`, PM2, Nginx |
| Memory | 2 GB swap; build Next.js locally/CI, never on the VM |
| Network | NSG: 22 from home IP, 80/443 from the internet/Cloudflare; 3000/4000 closed |
| Public IP | Standard SKU, static (needed for DNS + Cosmos allowlist) |
| Cost | $0 for 12 months of student free services; Azure credit covers month 13+ |
| Exit ramp | Month 10: Azure App Service F1 (always free) or the Vercel + Heroku split |

## 7. Object storage — Amazon S3 + LocalStack

### Buckets

| Bucket | Access | Contents | Lifecycle |
| --- | --- | --- | --- |
| `parsswim-uploads` | Public read restricted to `uploads/*` | product/class/user images | none |
| `parsswim-backups` | Private (Block Public Access on) | `mongodump` archives under `Backup/YYYY-MM-DD/` | expire after 30–90 days |

### Design (implemented in `backend/lib/storage.js`)

1. `putObject(key, buffer, contentType)` and `deleteObject(key)` wrap
   `@aws-sdk/client-s3`; when S3 env vars are absent they fall back to local disk
   so `npm run dev` still works without LocalStack.
2. Multer uses `memoryStorage` (5 MB cap, image MIME filter); the DB keeps storing
   `/uploads/images/<name>` for URL compatibility.
3. `GET /uploads/*` redirects (302) to the S3 public URL when configured;
   otherwise it serves the local folder.
4. File migration copies `backups/uploads/images/` (65 files) into
   `parsswim-uploads/uploads/images/` and verifies checksums.
5. Nightly `mongodump` is uploaded to `parsswim-backups` (tested against
   LocalStack first).

### Configuration matrix

| Variable | LocalStack | Production (AWS S3) |
| --- | --- | --- |
| `AWS_REGION` | `us-east-1` | `eu-west-2` (confirm) |
| `S3_ENDPOINT` | `http://localhost:4566` | *(unset — native AWS)* |
| `S3_FORCE_PATH_STYLE` | `true` | `false` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | `test` / `test` | IAM user keys (never in repo) |
| `S3_UPLOADS_BUCKET` | `parsswim-uploads` | `parsswim-uploads` |
| `S3_BACKUPS_BUCKET` | `parsswim-backups` | `parsswim-backups` |
| `S3_PUBLIC_BASE_URL` | `http://localhost:4566/parsswim-uploads` | `https://parsswim-uploads.s3.eu-west-2.amazonaws.com` |

### IAM least privilege

IAM user `parsswim-deploy` (no console access):

- `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on
  `arn:aws:s3:::parsswim-uploads/uploads/*`
- `s3:PutObject`, `s3:GetObject`, `s3:ListBucket` on `parsswim-backups/*`
- no `s3:*`, no bucket deletion, no IAM rights.

## 8. Database — Azure Cosmos DB for MongoDB (free tier)

| Aspect | Detail |
| --- | --- |
| API | Cosmos DB for MongoDB (RU-based), `--kind MongoDB --capabilities EnableMongo` |
| Region | `germanywestcentral` |
| Free tier | 1000 RU/s + 25 GB; `--enable-free-tier` (preview) |
| Throughput | shared 1000 RU/s on the `parsswim` database |
| Auth | account key in `MONGODB_URL` (Cosmos has no `db.createUser`) |
| Collections | `products`, `classes`, `users`, `payment`, `sessions` |
| Backups | `mongodump` → S3 (`parsswim-backups`) |

Connection string shape (append `/parsswim` to the path):

```
mongodb://<account>:<key>@<account>.mongo.cosmos.azure.com:10255/parsswim?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@<account>@
```

## 9. Domain, DNS and TLS

- **Only** `parsswim.dev` and `www.parsswim.dev` are served.
- Cloudflare free zone: proxied records to the Azure static public IP.
- TLS: Cloudflare Origin CA certificate on Nginx, or Let's Encrypt; **Full
  (strict)**; HSTS after verification.
- Images resolve to the S3 public URL
  (`parsswim-uploads.s3.eu-west-2.amazonaws.com`).

## 10. Cost model

| Resource | Spec | Est. / month |
| --- | --- | --- |
| Azure Linux VM | `B2ats_v2`/`B1s`, `germanywestcentral` | **$0** (12-month student free services) |
| Azure Cosmos DB | Mongo API, 1000 RU/s + 25 GB | **$0** (free tier) |
| Amazon S3 | ~10 MB objects, low requests | **< $1** |
| Data transfer | Cloudflare proxy + small image traffic | ~$0 |
| Cloudflare DNS/proxy | Free plan | $0 |
| **Total** | | **≈ $0 out of pocket; AWS credit barely touched** |

## 11. Guardrails

1. AWS root: MFA on, no root access keys; use the least-privilege IAM user.
2. AWS Budgets alarms at **$5 and $10**, hard spend limit on; no EC2/EIP/NAT/ALB.
3. Azure budget alert on the student subscription (VM + Cosmos).
4. Verify the Cosmos free tier is available **before** creating the account.
5. Tag resources `Project=parsswim`.
6. Rotate the old Atlas credential, then disable the Atlas cluster once Cosmos is
   verified.
7. Store all credentials outside the repo (`.env` on the VM, local `.env`).

## 12. Migration order

0. **Hygiene** — dedupe `backend/` vs `parsswim-backend/`, consolidate env files,
   remove hardcoded domains/Railway from code, rotate the old DB credential.
   *(scrub committed)*
1. **Storage abstraction** — `lib/storage.js`, Multer memory storage, `/uploads`
   redirect. *(initial implementation done; LocalStack test pending)*
2. **LocalStack locally** — install a WSL distro + Docker Engine (or Docker
   Desktop), then `awslocal s3 mb` and an upload smoke test.
3. **Azure VM** — RG, NSG, `B2ats_v2`/`B1s` in `germanywestcentral`, static IP,
   2 GB swap, Node 20, PM2, Nginx.
4. **Cosmos DB** — preflight free tier, create account + database, restore the
   2026-11-03 dump, verify counts (12/4/4/0/0).
5. **S3** — create/confirm buckets + IAM user, migrate the 65 images, verify.
6. **Cloudflare** — zone for `parsswim.dev`, proxied records to the VM, Origin CA,
   Full (strict).
7. **Cutover** — freeze writes, final `mongodump` to S3, deploy, verify `/` and
   `/api/health`, keep the droplet 48 h for rollback, then snapshot and destroy.
8. **Post** — nightly `mongodump` → S3, uptime monitor, budget review, month-10
   compute exit ramp.

## 13. Risks

- **Cosmos free tier already used** → Alternative A becomes paid; check first,
  fall back to self-hosted MongoDB.
- **Cosmos Mongo API differences** → TTL/sessions and `mongorestore` behaviour
  must be verified; current queries are simple CRUD.
- **1 GiB RAM** → Next.js builds can OOM; build off-VM, add swap, cap heaps.
- **`germanywestcentral` capacity/SKU** → verify `B2ats_v2`/`B1s` availability.
- **S3 public bucket abuse** → policy scoped to `uploads/*`, backups private.
- **Zarinpal callbacks** → must resolve through `parsswim.dev`; verify from Iran.
- **Only one 12-month compute window** → month-10 exit ramp is mandatory, but it
  is a compute-only move (data/storage stay put).

## 14. Open decisions

1. Confirm the Cosmos free tier is available in the subscription.
2. S3 region (`eu-west-2` suggested) and public-read versus presigned images.
3. Zarinpal: keep sandbox during migration or wire the production merchant id.
4. Cutover window and write-freeze duration.
5. Whether `parsswim.dev` DNS is already on Cloudflare or stays at its registrar.
