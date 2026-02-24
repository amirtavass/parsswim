#!/bin/bash
# ============================================================================
# ParsSwim Deployment Setup Script for DigitalOcean Ubuntu 24.04 LTS
# ============================================================================
# Run this script on your DigitalOcean droplet after SSH connection
# sudo bash setup-droplet.sh
# ============================================================================

set -e  # Exit on any error

echo "🚀 Starting ParsSwim Deployment Setup..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 1. UPDATE SYSTEM
# ============================================================================
echo -e "${YELLOW}[1/11] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# ============================================================================
# 2. INSTALL NODEJS & NPM
# ============================================================================
echo -e "${YELLOW}[2/11] Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
node --version
npm --version

# ============================================================================
# 3. INSTALL MONGODB
# ============================================================================
echo -e "${YELLOW}[3/11] Installing MongoDB...${NC}"
# Add MongoDB repository
apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
mongod --version

# ============================================================================
# 4. CONFIGURE MONGODB SECURITY
# ============================================================================
echo -e "${YELLOW}[4/11] Configuring MongoDB security...${NC}"

# Prompt for MongoDB admin password
read -sp "Enter MongoDB root admin password (min 12 chars): " MONGO_ADMIN_PASS
echo ""
read -sp "Enter MongoDB app user password (min 12 chars): " MONGO_APP_PASS
echo ""

# Wait for MongoDB to be ready
sleep 3

# Create admin user and app user
mongosh <<EOF
use admin
db.createUser({
  user: "admin",
  pwd: "${MONGO_ADMIN_PASS}",
  roles: ["root"]
})

use parsswim
db.createUser({
  user: "parsswim_user",
  pwd: "${MONGO_APP_PASS}",
  roles: ["readWrite", "dbOwner"]
})
EOF

# ============================================================================
# 5. INSTALL NGINX
# ============================================================================
echo -e "${YELLOW}[5/11] Installing Nginx...${NC}"
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
nginx -v

# ============================================================================
# 6. INSTALL CERTBOT FOR SSL
# ============================================================================
echo -e "${YELLOW}[6/11] Installing Certbot for SSL certificates...${NC}"
apt-get install -y certbot python3-certbot-nginx
echo "✅ Certbot installed (will configure SSL later with domain)"

# ============================================================================
# 7. CREATE APPLICATION DIRECTORIES
# ============================================================================
echo -e "${YELLOW}[7/11] Creating application directories...${NC}"
mkdir -p /var/www/parsswim
mkdir -p /var/www/parsswim/backend
mkdir -p /var/www/parsswim/frontend
mkdir -p /var/log/parsswim

chown -R root:root /var/www/parsswim
chmod -R 755 /var/www/parsswim
chmod -R 755 /var/log/parsswim

# ============================================================================
# 8. INSTALL PM2 FOR PROCESS MANAGEMENT
# ============================================================================
echo -e "${YELLOW}[8/11] Installing PM2...${NC}"
npm install -g pm2
pm2 startup
pm2 save
pm2 --version

# ============================================================================
# 9. INSTALL GIT & CLONE/SETUP FIREWALL
# ============================================================================
echo -e "${YELLOW}[9/11] Setting up UFW firewall...${NC}"
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 4000/tcp  # Backend
echo "yes" | ufw enable

# ============================================================================
# 10. CREATE INITIAL NGINX CONFIG
# ============================================================================
echo -e "${YELLOW}[10/11] Configuring Nginx reverse proxy...${NC}"
cat > /etc/nginx/sites-available/parsswim <<'NGINX_CONFIG'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name parsswim.ir www.parsswim.ir;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server Block (will be updated by certbot)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name parsswim.ir www.parsswim.ir;

    # Placeholder - certbot will update these
    ssl_certificate /etc/letsencrypt/live/parsswim.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parsswim.ir/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/parsswim/access.log;
    error_log /var/log/parsswim/error.log;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
        proxy_cookie_path / "/";
        proxy_pass_header Set-Cookie;
    }

    # Backend health check
    location /health {
        proxy_pass http://localhost:4000/health;
    }
}
NGINX_CONFIG

# Enable the site
ln -sf /etc/nginx/sites-available/parsswim /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t && systemctl reload nginx

# ============================================================================
# 11. DISPLAY SUMMARY
# ============================================================================
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Save MongoDB credentials securely:"
echo "   - Admin user: admin / ${MONGO_ADMIN_PASS}"
echo "   - App user: parsswim_user / ${MONGO_APP_PASS}"
echo ""
echo "2. SSH into the droplet and upload your application:"
echo "   - Backend → /var/www/parsswim/backend"
echo "   - Frontend → /var/www/parsswim/frontend"
echo ""
echo "3. Configure .env files with MongoDB credentials"
echo ""
echo "4. Install dependencies and start apps with PM2"
echo ""
echo "5. Set up SSL with:"
echo "   sudo certbot --nginx -d parsswim.ir -d www.parsswim.ir -m amirtavass62@gmail.com"
echo ""
echo "6. Point your domain DNS to: ${HOSTNAME} (IP: 161.35.174.84)"
echo ""
echo -e "${GREEN}Status:${NC}"
echo "- MongoDB: $(systemctl is-active mongod)"
echo "- Nginx: $(systemctl is-active nginx)"
echo "- Firewall: $(ufw status | grep Status)"
