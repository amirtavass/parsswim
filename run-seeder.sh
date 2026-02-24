#!/bin/bash
# ============================================================================
# Database Seeder Script
# Run this on your droplet after uploading the backend
# ============================================================================

cd /var/www/parsswim/backend

# Install dependencies if needed
npm install

# Run the seeder
node database-seeder.js

echo "✅ Database seeding complete!"
