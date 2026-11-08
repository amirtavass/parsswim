# ParsSwim Migration — Objectives

## Context

| Item | Value |
| --- | --- |
| Project | ParsSwim (`parsswim.dev`) — swimming instructor platform + shop |
| Local path | `C:\Users\Pc Dayan\Desktop\PROJECTS\Projects\parsSwim` |
| Stack | Next.js 15 (React 18) + Express 4 (Node) + MongoDB (Mongoose 7) |
| Auth/session | Passport local + JWT, `express-session` backed by Mongo |
| Payments | Zarinpal (currently sandbox merchant id) |
| Files | 65 Multer disk uploads (7,893,221 bytes) |
| Database (current) | MongoDB Atlas `parsswim-cluster`, DB `parsswim` |
| Database (target) | **MongoDB Atlas M0 free tier (Ireland)** |
| Storage (target) | **AWS S3 `eu-north-1`** (primary) or **Cloudflare R2** (fallback), both via the S3 API |
| Current infra | DigitalOcean droplet `161.35.174.84` running PM2 + Nginx; DNS hostname `parsswim.dev` |
| New infra | Azure for Students VM in **Ireland (`northeurope`)** running Next.js + Express + Nginx + PM2 |
| Repo | `https://github.com/amirtavass/arman-portfolio` (`main`) |
| Backups | DB dump + uploads extracted 2026-11-03, SHA-256 verified |

Related playbook: [violetwatch-lessons-learned.md](violetwatch-lessons-learned.md).

## Hard constraints (non-negotiable)

1. **DigitalOcean is retired.** Do not provision or keep DO resources. The
   ParsSwim droplet is to be retired after cutover.
2. **All Azure resources live in Ireland (`northeurope`), as provisioned.**
3. **Single $0 compute server.** Next.js, Express, Nginx, and PM2 run on one
   Azure for Students VM (`B2ats_v2`, 1 GiB). MongoDB is external on the **Atlas
   M0 free tier**, so the VM's RAM stays free for Node.
4. **AWS is storage only, never compute.** The AWS account is an
   Academy/education sandbox: EC2 is unavailable (`describe-instance-type-offerings`
   returns empty), but S3 works. No EC2/EIP/NAT/ALB.
5. **Live production must run at ~$0/month** within the 12-month student
   entitlement; credits must not be required to keep the site up. AWS S3 stays at
   pennies per month and Atlas M0 is free.
6. **Storage uses the S3 API.** `@aws-sdk/client-s3` points at AWS S3, Cloudflare
   R2, or LocalStack through canonical `S3_*` env vars; no code changes between
   them.
7. **Production storage needs long-lived credentials.** The sandbox CLI currently
   uses temporary STS session credentials, so an IAM access key (or an R2 API
   token fallback) is mandatory before launch.
8. **Domain is `parsswim.dev` only.** The legacy `.ir` domain is expired and
   retired; do not plan registrar, nameserver, or DNS work for it.
9. **Do not modify the live server or break it during planning.** Discovery is
   read-only; cutover changes happen in an explicitly approved phase.

## Goals

- Keep `parsswim.dev` / `www.parsswim.dev` online over HTTPS on a ~$0/month
  architecture.
- Retire the DigitalOcean droplet without data loss (DB + 65 images).
- Move the database from the old Atlas cluster to the new **Atlas M0** cluster with
  verified counts.
- Introduce a provider-agnostic S3 storage layer (AWS S3 production, R2 fallback,
  LocalStack in dev/CI).
- Preserve existing behaviour: classes, products, cart, dashboard, admin CRUD,
  Zarinpal sandbox flow, Persian/English UI.
- Produce a repeatable cutover runbook with verification and rollback.

## Non-goals (this phase)

- No feature redesign or framework migration.
- No AWS compute of any kind.
- No changes to the live droplet, DNS, or database until explicitly approved.
- No payment-provider production onboarding (Zarinpal stays sandbox for now).
- No paid tiers of any provider.

## Success criteria

1. `https://parsswim.dev` and `https://www.parsswim.dev` serve the app over HTTPS.
2. `/` and the API health endpoint return 200; `database: connected` (Atlas).
3. All 12 products, 4 classes, 4 users and 65 images are migrated and visible.
4. Login (student/admin), admin product CRUD and image upload work end-to-end.
5. Uploads are written to and read from AWS S3 (or R2) through the storage
   abstraction; LocalStack passes the same tests locally.
6. The DigitalOcean droplet is snapshotted, then destroyed; the old Atlas cluster
   is retired after the new M0 cluster is verified.
7. Monthly run-rate is **~$0** for compute/database/DNS, with AWS S3 **< $1**.
8. No AWS compute resource exists; the AWS credit is not spent on EC2.

## Decision (2026-11-05 — Phase 2 revised)

| Decision | Choice |
| --- | --- |
| Azure region | **Ireland (`northeurope`)**, as provisioned |
| Compute | **Azure for Students Linux VM** (`B2ats_v2`), Nginx + PM2 — $0 for 12 months |
| Database | **MongoDB Atlas M0 free tier (Ireland)** — external, no DB on the VM |
| Production object storage | **AWS S3 `eu-north-1`** (`parsswim-uploads` public, `parsswim-backups-amir` private) via `@aws-sdk/client-s3` |
| Storage fallback | **Cloudflare R2** if the AWS IAM access-key check fails; same code, env-only switch |
| Local/CI object storage | **LocalStack** + Docker (WSL 2) |
| DNS / TLS | Cloudflare free, domain `parsswim.dev` only |
| AWS | **S3 only** — EC2 unavailable in the sandbox; no compute |
| Legacy `.ir` domain | expired and retired — no action |

Implication: AWS is the storage layer, Azure is the compute layer, and Atlas M0 is
the database layer. No Docker or MongoDB runs on the Azure VM, leaving its 1 GiB
for Node. The only deadline is the 12-month Azure student entitlement, mitigated
by the month-10 exit to Azure App Service F1 (or the Vercel + Heroku split).
Atlas M0 remains free.

## Open questions

1. **Atlas access list:** confirm both the local public IP (for `mongorestore`)
   and the Azure VM public IP are added in Atlas → Network Access.
2. **Public base URL:** AWS virtual-hosted URL is chosen:
   `https://parsswim-uploads.s3.eu-north-1.amazonaws.com`.
3. **DNS:** Cloudflare zone is already delegated; switch the A records after the
   VM passes local verification.
4. **Zarinpal:** keep sandbox during the migration or wire the production
   merchant id?
5. **Cutover window:** when to freeze writes and how long to keep the droplet as
   rollback (suggested 48 h)?
