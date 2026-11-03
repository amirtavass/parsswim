# VioletWatch → ParsSwim: Lessons Learned

Operational playbook distilled from the complete `violetwatch.tech` migration
(legacy PHP/MySQL on DigitalOcean → Azure App Service + Azure SQL + Cloudflare,
November 2026). Reuse this for ParsSwim; the runtime is Node, but most of it is
platform-level.

## 1. Windows tooling baseline

- **.NET SDK is per-user** at `%USERPROFILE%\.dotnet` (only needed if a .NET
  component is added; ParsSwim is Node). Every shell must set:

  ```powershell
  $env:DOTNET_ROOT = "$env:USERPROFILE\.dotnet"
  $env:Path = "$env:DOTNET_ROOT;$env:DOTNET_ROOT\tools;$env:Path"
  $az = 'C:\Program Files (x86)\Microsoft SDKs\Azure\CLI2\wbin\az.cmd'
  ```

- **PowerShell 5.1** is the shell. It does not support `&&`; chain with
  `cmd1; if ($?) { cmd2 }`. Paths with spaces need `& "path"`.
- **npm 11 blocks dependency install scripts.** If a package needs one
  (esbuild in VioletWatch), run `npm approve-scripts <pkg>` or
  `npm install --foreground-scripts`. Do not blindly pass
  `--ignore-scripts` for native modules (`bcrypt` in ParsSwim needs a
  prebuilt/binary install; verify it works on Windows and Linux).
- **No winget and no Docker on this machine (verified 2026-11).**
  `docker`, `localstack` and `aws` CLI are all absent. **WSL 2 is installed**
  (`wsl --status` reports Default Version 2), which is the cheapest path to a
  Docker engine for LocalStack:
  - install an Ubuntu distro (`wsl --install -d Ubuntu`),
  - `sudo apt install docker.io` inside WSL, or
  - run LocalStack directly on a Linux VM.
  - LocalStack for AWS **requires Docker**; the 2026 CLI also **requires an
    auth token** even to start. The GitHub Student plan provides a free license
    (and a "ready-to-use cloud environment" in the LocalStack web app), not a
    Docker substitute.
- Do not assume a GUI; prefer scripted, reproducible commands.

## 2. UTF-8 / Persian (`fa`) text

- The PowerShell console renders Persian as mojibake even though the files are
  valid UTF-8. **Never copy console-recovered text back into a file.**
- Transform text only through Node scripts that read/write UTF-8:

  ```js
  const fs = require("fs");
  const s = fs.readFileSync(p, "utf8");
  fs.writeFileSync(p, s, "utf8");
  ```

- Validate: `s.includes("\uFFFD") === false` and a
  `/[\u0600-\u06FF]/` match for Persian content.
- Git on Windows warns `LF will be replaced by CRLF`; keep repository source
  files LF so Linux builds/deploys are predictable (`.gitattributes` or
  `git config --global core.autocrlf input`).

## 3. Packaging and Linux deploys

- **Never use `Compress-Archive` for a Linux target.** Build the archive with a
  `System.IO.Compression.ZipArchive` loop and normalise every entry name with
  `.Replace('\', '/')`. Verify `backslash_entries=0` before uploading.
- Azure App Service (Linux) needs `SCM_DO_BUILD_DURING_DEPLOYMENT=false` when
  the zip already contains pre-built output; otherwise Oryx tries to build it
  and Kudu returns **HTTP 400**.
- Set an explicit startup command (`dotnet X.dll`, or `npm start` for Node) and
  read the deploy result: `az webapp deploy ... -o json` must end with
  `"status": "RuntimeSuccessful"`.
- Keep credentials and generated output (`publish/`, `.next/`, `wwwroot/assets`)
  out of git; untrack them with `git rm -r --cached` once `.gitignore` covers
  them.

## 4. Azure for Students constraints

- **Region:** only a fixed list; UK was blocked. Everything was built in
  `germanywestcentral`. Check `az account list-locations` before planning.
- **Azure SQL free meter** is **Standard S0 (10 DTU)** (31 days/month), not
  GeneralPurpose serverless. Switching from `GP_S_Gen5_1` failed with
  `InvalidMaxSizeTierCombination` until `--max-size 250GB` was added. Serverless
  auto-pause is convenient in dev but does not match the student meter.
- **App Service F1 (Free) does not serve custom domains.** The binding is
  accepted and shows `Verified`, but the hostname never appears in
  `hostNameSslStates`/`enabledHostNames` and requests return
  `404 Site Not Found` (Microsoft docs: custom domains are disabled on
  Free/Shared). Remove the bindings so Azure only sees the default hostname.
- **F1 has no managed certificates.** Use Cloudflare in front (Flexible or
  Full) and **do not call `UseHttpsRedirection()`**, otherwise Flexible SSL
  loops (307/308). Direct `https://*.azurewebsites.net` still works.
- **Custom domain workaround (F1, $0):** a free Cloudflare Worker on
  `example.com/*` + `www.example.com/*` that rewrites `Host` to the
  `*.azurewebsites.net` hostname. Strip `host`, `x-forwarded-host` and
  `x-original-host`, because App Service may treat proxy host headers as the
  effective hostname. (Cloudflare Origin Rules with Host rewrite are
  Enterprise-only; Workers are free within 100k requests/day.)
- **Persistent storage:** files written under `wwwroot` are wiped by a
  `--clean true` deploy. Set `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true` and use
  `/home/site/uploads/...`; seed/copy initial files on startup and serve them
  with a `PhysicalFileProvider` mounted at the public path.
- `ARRAffinity` cookies are scoped to `*.azurewebsites.net` and are dropped when
  served through a custom domain. Harmless with a single instance; matters if
  you ever scale out.
- F1 quota: 60 CPU minutes/day, 1 GB RAM, no Always On (cold starts). Fine for a
  low-traffic portfolio/shop, risky for sustained traffic.

## 5. Cloudflare and DNS cutover

- Standard order: delete the old apex `A` (droplet), add the `asuid` and
  `asuid.www` TXT verification records, add `@`/`www` CNAMEs to the App Service
  hostname, wait for propagation, bind the hostnames, then enable the proxy.
- Cloudflare flattens the apex CNAME, so `@` works without an A record.
- **Verify from the edge, not just the ISP resolver:**

  ```powershell
  curl.exe -s -o NUL -w "%{http_code}" --resolve example.com:443:104.21.x.x https://example.com/health
  ```

- **ISP DNS caching ruins cutovers.** `ipconfig /flushdns` clears Windows only;
  Virgin Media (`194.168.4.100/8`) kept the dead droplet IP with a ~7.4 h TTL
  and every request timed out. Confirm with `Resolve-DnsName -Server 1.1.1.1`,
  then set the adapter DNS to `1.1.1.1` / `1.0.0.1` or wait out the TTL. Also
  clear the browser's DNS cache (`chrome://net-internals/#dns`).
- ParsSwim now uses `parsswim.dev` only; DNS/TLS work happens at that domain's
  registrar/Cloudflare. The legacy `.ir` domain is expired and out of scope.
- Keep `SSL/TLS` mode consistent: Flexible works only if the origin does not
  force HTTPS; Full (strict) needs a certificate on the origin (not possible on
  F1 without a custom cert).

## 6. Secrets and repository hygiene

- All real secrets live outside the repo
  (`C:\Users\Pc Dayan\.azure\violet-mysql.env` for VioletWatch) and are injected
  as App Settings. `.env*` must be ignored; never print values to the console or
  docs.
- **Public repos leak history.** A live-looking database URL/password in
  `.env.example` (ParsSwim had one; scrubbed 2026-11-03) must be rotated and
  scrubbed; assume it is compromised.
- When local and remote diverge, prefer **merge** over force-push; resolve
  `.gitignore` as a union and keep remote history.
- Rotate production admin credentials through the application's API, verify the
  old credential returns 401 and the new one 200, and store the new value only
  in the secrets file.
- Ignore/history-ready `.gitignore` blocks used in VioletWatch:
  `publish/`, `api/wwwroot/{assets,css,fonts,pictures,index.html,admin.html}`,
  `api/appsettings.Development.json`, `api/seed/products.json`, `.env.*`,
  `*.pem/key/crt/p12/pfx/jks`, `id_*`, `*.sql` dumps.

## 7. Post-deployment verification checklist

Reuse for ParsSwim after every deploy and after cutover:

1. `/health` (or `/`) returns 200 with `database: connected`.
2. Data endpoint returns the expected count and intact Persian/English text.
3. Static assets (images, fonts, CSS) return 200 from the **new** origin.
4. Login works; an unauthenticated write returns 401.
5. Custom domain tested through the Cloudflare edge IP and through the default
   resolver.
6. No secrets or build artifacts in the pushed tree.

## 8. Mapping to ParsSwim

- Same Windows/encoding/zip/Cloudflare/secret playbook; no .NET/MSBuild steps.
- Node 20 on the droplet vs Node 24 locally: pin the engine per environment.
- LocalStack needs Docker: use WSL 2 + Docker Engine (free) or a Linux VM; the
  Student plan supplies the license/auth token. Plan the S3 code path so it
  works identically against LocalStack, real S3, MinIO or Cloudflare R2.
- Azure F1 + Cloudflare Worker is proven and $0/month; it is the safest
  production target for a Next.js + Express stack of this size.
