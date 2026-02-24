# Local Development & Testing Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally (or Docker)
- npm installed

---

## Step 1: Start MongoDB Locally

### Option A: Using MongoDB Community Edition (Windows)

```powershell
# Make sure MongoDB service is running
# Windows: Services app → MongoDB Server → Start

# Or from terminal
mongod
```

### Option B: Using Docker (Recommended)

```powershell
docker run -d -p 27017:27017 --name parsswim-mongo mongo:latest
```

### Option C: Using MongoDB Atlas (Cloud)

- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update `MONGODB_URL` in `.env.local`

---

## Step 2: Seed Database with Test Data

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run the seeder
node database-seeder.js
```

### Expected Output:

```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
🔄 Clearing existing data...
✅ Existing data cleared
🔄 Adding sample users...
✅ Added 3 users
🔄 Adding sample classes...
✅ Added 3 classes
🔄 Adding sample products...
✅ Added 5 products
🎉 Database seeded successfully!
📊 Total users: 3
📊 Total classes: 3
📊 Total products: 5

🔑 Test Credentials:
══════════════════════════════════════════════════
👤 Student: testuser / password123
👤 Alternate: john_swimmer / john123456
🔐 Admin: testadmin / admin123456
══════════════════════════════════════════════════
```

---

## Step 3: Start Backend API

```powershell
# In backend/ directory
npm run dev
```

### Expected Output:

```
🚀 Starting ParsSwim API Server...
✅ Connected to MongoDB
✅ Server running on http://localhost:4000
```

---

## Step 4: Start Frontend (New Terminal)

```powershell
# In project root directory
npm install

npm run dev
```

### Expected Output:

```
▲ Next.js 14.2.3
  - Local: http://localhost:3000
```

---

## Step 5: Test Login Flow

1. Open browser: http://localhost:3000
2. Click "Login" or navigate to login page
3. Enter credentials:
   - **Username:** `testuser`
   - **Password:** `password123`
4. Click Login button
5. Should redirect to `/dashboard`

### If Login Fails:

- Check browser console (F12) for errors
- Check that backend is running on port 4000
- Check MongoDB is running
- Verify `.env.local` file exists in both `backend/` and root

---

## Troubleshooting

### "Cannot GET /api/auth/login" (404)

- ✅ Backend not running, start it: `npm run dev` in `backend/` folder

### "Failed to connect to MongoDB"

- ✅ MongoDB not running, start MongoDB service/Docker container
- ✅ Check `MONGODB_URL` in `backend/.env.local`

### "Validation error" (400 Bad Request)

- ✅ Ensure request has `name` and `password` fields
- ✅ Password must be at least 5 characters

### CORS Error

- ✅ Check backend `server.js` CORS configuration
- ✅ Ensure `http://localhost:3000` is in allowedOrigins

### Cookies Not Being Set

- ✅ Check `withCredentials: true` in `app/lib/api.js` ✓ (already set)
- ✅ Ensure `secure: false` for localhost cookies

---

## Next Steps After Local Testing

Once login is working:

1. ✅ Navigate to admin dashboard (if admin user)
2. ✅ Add classes and products through admin interface
3. ✅ Test checkout flow
4. ✅ Test user registration
5. ✅ Then deploy to DigitalOcean

---

## Database Reset

If you need to reset the database:

```powershell
# Clear all data and reseed
node database-seeder.js
```

---

## Ports Reference

| Service            | Port  | URL                       |
| ------------------ | ----- | ------------------------- |
| Frontend (Next.js) | 3000  | http://localhost:3000     |
| Backend (Express)  | 4000  | http://localhost:4000     |
| MongoDB            | 27017 | mongodb://localhost:27017 |
