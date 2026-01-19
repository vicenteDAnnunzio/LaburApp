# 🚀 Quick Start Guide - ServiceFinder Backend

Get your development environment running in 5 minutes.

## ✅ Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Docker Desktop running
- [ ] Git installed

## 📦 Step 1: Install Dependencies

```bash
cd backend
npm install
```

Expected output: `added XXX packages`

## ⚙️ Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Open `.env` and verify/update:
```env
DATABASE_URL="postgresql://servicefinder:dev_password_123@localhost:5432/servicefinder_db?schema=public"
JWT_SECRET=change-this-to-a-random-string-min-32-chars
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` to a random string before production!

Generate a secure secret:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Manual
# Use any random 32+ character string
```

## 🐳 Step 3: Start PostgreSQL

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps
```

You should see:
```
NAME                 STATUS
servicefinder-db     Up X seconds
```

## 🗄️ Step 4: Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (create tables)
npm run prisma:migrate

# Seed with test data (optional)
npm run prisma:seed
```

Expected output:
```
✅ Database connected successfully
🌱 Seeding...
✅ Seed completed successfully
```

## 🚀 Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 4000
📝 Environment: development
🌐 Health check: http://localhost:4000/health
```

## ✅ Step 6: Verify Setup

Open your browser or use curl:

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T..."
}
```

## 🎉 Success!

Your backend is now running! 

**Current Status:** PHASE 1 Complete
- ✅ Database running
- ✅ Server running
- ✅ Health check working

**Next Steps:** Implement PHASE 2
See [docs/PHASE2_CHECKLIST.md](PHASE2_CHECKLIST.md) for implementation tasks.

---

## 🛠️ Useful Commands

### View Database
```bash
npm run prisma:studio
```
Opens Prisma Studio at `http://localhost:5555`

### View Server Logs
The dev server shows real-time logs. Watch for:
- ✅ Success messages (green)
- ⚠️ Warnings (yellow)
- ❌ Errors (red)

### View Database Logs
```bash
docker-compose logs -f postgres
```

### Reset Database
```bash
# ⚠️ This deletes all data!
npx prisma migrate reset
npm run prisma:seed
```

### Stop Everything
```bash
# Stop server: Ctrl+C in terminal

# Stop database:
docker-compose down

# Stop and remove data:
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Port 4000 already in use
```bash
# Option 1: Change port in .env
PORT=4001

# Option 2: Kill process on port 4000 (Windows)
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Database connection error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Prisma errors
```bash
# Regenerate client
npm run prisma:generate

# Reset database
npx prisma migrate reset
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. ✅ Read [README.md](../README.md) for full documentation
2. ✅ Review [docs/ARCHITECTURE.md](ARCHITECTURE.md) to understand the structure
3. ✅ Check [docs/api.md](api.md) for API endpoint specifications
4. ✅ Follow [docs/PHASE2_CHECKLIST.md](PHASE2_CHECKLIST.md) to implement features

---

## 🆘 Need Help?

- Check logs for error messages
- Review [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- Verify all prerequisites are met
- Make sure Docker Desktop is running
- Check `.env` configuration

---

**Time to complete:** ~5 minutes  
**Difficulty:** Beginner-friendly  
**Status:** PHASE 1 ✅
