#!/usr/bin/env bash
# ============================================================================
# ParsSwim — Azure Ubuntu 24.04 app host
# ============================================================================
# Installs only: Node.js 20, PM2, Nginx, Certbot.
# Also configures 2 GB swap, UFW (22/80/443), the app directory, and the
# Nginx reverse proxy for parsswim.dev.
#
# MongoDB is external (MongoDB Atlas M0) and is NOT installed on this VM.
# Docker is NOT installed on this VM.
#
# Usage (as root):
#   sudo bash scripts/setup-azure-vm.sh
#
# Overrides:
#   APP_USER=azureuser
#   APP_DIR=/var/www/parsswim
#   DOMAIN=parsswim.dev
#   WWW_DOMAIN=www.parsswim.dev
# ============================================================================

set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

APP_USER="${APP_USER:-azureuser}"
APP_DIR="${APP_DIR:-/var/www/parsswim}"
DOMAIN="${DOMAIN:-parsswim.dev}"
WWW_DOMAIN="${WWW_DOMAIN:-www.parsswim.dev}"

log()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m[warn] %s\033[0m\n' "$*"; }

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
  echo "User '$APP_USER' does not exist. Set APP_USER to the Azure admin user." >&2
  exit 1
fi

# --- System packages ---------------------------------------------------------
log "Updating system packages"
apt-get update
apt-get upgrade -y

log "Installing base packages"
apt-get install -y \
  curl ca-certificates gnupg git nginx certbot python3-certbot-nginx ufw

log "Installing Node.js 20"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

log "Installing PM2"
npm install -g pm2

# --- Swap (important on 1 GiB while building Next.js) ------------------------
log "Configuring 2 GB swap and swappiness"
if ! swapon --show | grep -q '/swapfile'; then
  if ! fallocate -l 2G /swapfile 2>/dev/null; then
    dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  fi
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
fi
if ! grep -q '^/swapfile ' /etc/fstab; then
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
echo 'vm.swappiness=10' > /etc/sysctl.d/99-parsswim.conf
sysctl --system >/dev/null

# --- Firewall ---------------------------------------------------------------
log "Configuring UFW"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# --- Application directory ---------------------------------------------------
log "Creating application directory"
mkdir -p "$APP_DIR"
chown -R "${APP_USER}:${APP_USER}" "$APP_DIR"

# --- Nginx -------------------------------------------------------------------
log "Writing Nginx reverse proxy configuration"
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

if [[ -f /etc/nginx/sites-available/parsswim ]] && grep -q 'listen 443 ssl' /etc/nginx/sites-available/parsswim; then
  warn "Nginx site already has SSL; leaving it untouched. Re-run Certbot if needed."
else
cat > /etc/nginx/sites-available/parsswim <<EOF
upstream parsswim_frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream parsswim_backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    client_max_body_size 10M;

    access_log /var/log/nginx/parsswim.access.log;
    error_log  /var/log/nginx/parsswim.error.log;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # /api/* -> Express :4000/* (strips the /api prefix)
    location /api/ {
        proxy_pass http://parsswim_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Cookie \$http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_read_timeout 60s;
    }

    # /uploads/* -> Express, which 302s to S3
    location /uploads/ {
        proxy_pass http://parsswim_backend/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    # Everything else -> Next.js :3000
    location / {
        proxy_pass http://parsswim_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/parsswim /etc/nginx/sites-enabled/parsswim
rm -f /etc/nginx/sites-enabled/default
fi
nginx -t
systemctl enable --now nginx
systemctl reload nginx

# --- Summary -----------------------------------------------------------------
log "Setup complete"
cat <<EOF

Installed:
  Node $(node -v) / npm $(npm -v)
  PM2 $(pm2 -v 2>/dev/null || echo "installed")
  Nginx $(nginx -v 2>&1)

External database:
  MongoDB Atlas M0 (configured through MONGODB_URL in backend/.env)
  No Docker or MongoDB runs on this VM.

Next steps (run as ${APP_USER}):
  1. Clone the repo into ${APP_DIR}
  2. Copy the production .env files (Atlas MONGODB_URL + AWS S3 keys)
  3. npm ci && npm run build (frontend); npm ci (backend)
  4. pm2 start ... && pm2 save && pm2 startup
  5. sudo certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN}
EOF
