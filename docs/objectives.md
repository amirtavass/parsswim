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
| Database | MongoDB Atlas `parsswim-cluster`, DB `parsswim` |
| Current infra | DigitalOcean droplet `161.35.174.84` running PM2 + Nginx; DNS hostname `parsswim.dev` |
| Repo | `https://github.com/amirtavass/arman-portfolio` (`main`) |
| Backups | DB dump + uploads extracted 2026-11-03, SHA-256 verified |

Related playbook: [violetwatch-lessons-learned.md](violetwatch-lessons-learned.md).

## Hard constraints (non-negotiable)

1. **DigitalOcean is retired.** Do not provision or keep DO resources. The
   ParsSwim droplet is to be retired after cutover.
2. **AWS credit is protected, not spent on compute.** The account has a new
   promotional tier: **$100 credit, 181 days remaining (2026-11-03)**. No
   EC2/EIP/NAT/ALB. AWS usage is limited to S3 (pennies/month) and optional
   backups, so credit expiry never forces a compute migration.
3. **Compute must be $0 for 12–24 months.** Use the untouched Azure for Students
   Linux VM (`B2ats_v2` preferred, `B1s` fallback). Vercel + Heroku is a
   fallback only.
4. **Live production must run at $0/month** after student entitlements; credits
   must not be required to keep the site up.
5. **Real AWS S3 in production, LocalStack locally.** The storage layer uses
   `@aws-sdk/client-s3`; it must run against LocalStack (Docker/WSL 2) and real
   S3 without code changes.
6. **Database is MongoDB Atlas M0 (512 MB, always free).** No paid Atlas tiers.
7. **Domain is `parsswim.dev` only.** The legacy `.ir` domain is expired and
   retired; do not plan registrar, nameserver, or DNS work for it.
8. **Do not modify the live server or break it during planning.** Discovery is
   read-only; cutover changes happen in an explicitly approved phase.

## Goals

- Keep `parsswim.dev` / `www.parsswim.dev` online over HTTPS on a $0/month
  architecture.
- Retire the DigitalOcean droplet without data loss (Atlas data + 65 images).
- Introduce a provider-agnostic S3 storage layer (real S3 in production,
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
2. `/` and the API health endpoint return 200; `database: connected`.
3. All 12 products, 4 classes, 4 users and 65 images are migrated and visible.
4. Login (student/admin), admin product CRUD and image upload work end-to-end.
5. Uploads are written to and read from S3 through the storage abstraction;
   LocalStack passes the same tests locally.
6. The DigitalOcean droplet is snapshotted, then destroyed.
7. Monthly run-rate is **$0** for compute/database/DNS; AWS S3 stays **< $1/mo**.
8. AWS credit usage stays negligible and no EC2 resource exists.

## Decision (2026-11-03 — definitive)

| Decision | Choice |
| --- | --- |
| Compute | **Azure for Students Linux VM** (`B2ats_v2` / `B1s`), Nginx + PM2 — $0 for 12 months |
| Compute fallback | Vercel (Next) + Heroku (Express) student credit — only if the Azure VM is unavailable |
| Production object storage | **Amazon S3** (`parsswim-uploads` public, `parsswim-backups` private) via `@aws-sdk/client-s3` |
| Local/CI object storage | **LocalStack** + Docker (WSL 2) |
| Database | MongoDB Atlas **M0** (512 MB, always free) |
| DNS / TLS | Cloudflare free, domain `parsswim.dev` only |
| AWS credit | reserved for S3/backups; no compute |
| Legacy `.ir` domain | expired and retired — no action |

Implication: the AWS credit is a storage/backup budget, not a hosting runway.
The only compute deadline is the 12-month Azure student entitlement, mitigated
by the month-10 exit to Azure App Service F1 (or the Vercel + Heroku split).

## Open questions

1. **Azure SKU/region:** is `B2ats_v2` (or `B1s`) available in `uksouth` /
   `westeurope` on the student subscription?
2. **S3 region/bucket:** confirm `eu-west-2` and whether `parsswim-uploads` may
   be public-read (restricted to `uploads/*`) or should use presigned URLs.
3. **Zarinpal:** keep sandbox during the migration or wire the production
   merchant id?
4. **Cutover window:** when to freeze writes and how long to keep the droplet as
   rollback (suggested 48 h)?
5. **DNS:** is `parsswim.dev` already delegated to Cloudflare, or does it stay at
   its current registrar?
