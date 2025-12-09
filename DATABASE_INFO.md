# Database Hosting Information

## Current Database Setup

**Database Type:** SQLite (file-based database)  
**Database File Location:** `server/database/maintenance.db`  
**Hosted On:** Render.com filesystem (same server as your backend)

### Current Path
```
/home-maintenance-planner-api/server/database/maintenance.db
```

## ⚠️ Critical Limitations on Render Free Tier

### 1. **Ephemeral Storage**
- SQLite database files are stored on Render's **ephemeral filesystem**
- **Data is lost** when:
  - Service restarts
  - Service spins down (after 15 min inactivity on free tier)
  - Service is redeployed
  - Render performs maintenance

### 2. **No Persistence**
- Your database is **NOT persistent** on the free tier
- Every restart = fresh database
- Users and tasks will be **deleted** on restart

### 3. **Free Tier Behavior**
- Service spins down after 15 minutes of inactivity
- First request wakes it up (takes 30-50 seconds)
- Database is recreated empty on wake-up

## Current Status

✅ **Works for:** Development, testing, demos  
❌ **NOT suitable for:** Production with real users

## Solutions for Production

### Option 1: Render PostgreSQL (Recommended)

**Pros:**
- Persistent data
- Free tier available (90 days)
- Easy to set up
- Automatic backups

**Steps:**
1. In Render dashboard, click **New** → **PostgreSQL**
2. Create database
3. Get connection string
4. Update `server/database/db.js` to use PostgreSQL
5. Install: `npm install pg`

**Cost:** Free for 90 days, then $7/month

### Option 2: Railway PostgreSQL

**Pros:**
- Persistent data
- 500 free hours/month
- Easy setup

**Steps:**
1. Add PostgreSQL service in Railway
2. Get connection string
3. Update database configuration

**Cost:** Free tier available

### Option 3: Supabase (Free PostgreSQL)

**Pros:**
- Completely free tier
- Generous limits
- Built-in dashboard
- Easy to use

**Steps:**
1. Sign up at supabase.com
2. Create project
3. Get connection string
4. Update database configuration

**Cost:** Free (with limits)

## Quick Check: Is Your Data Persisting?

To verify if your database is persisting:

1. **Create a test user** via the app
2. **Wait 20 minutes** (let service spin down)
3. **Make a request** (wake up service)
4. **Try to login** with test user

**If login fails:** Database was reset = data not persisting  
**If login works:** Data is persisting (for now, but still risky)

## Migration to PostgreSQL

If you want to migrate to PostgreSQL, I can help you:
1. Update `server/database/db.js` to use PostgreSQL
2. Add connection pooling
3. Update environment variables
4. Test the migration

## Current Recommendation

For a **production app**:
- ✅ Use PostgreSQL (Render, Railway, or Supabase)
- ❌ Don't use SQLite on ephemeral filesystem

For **development/demo**:
- ✅ Current SQLite setup is fine
- ⚠️ Just know data will reset on restarts

## Database Location Summary

| Component | Location | Persistent? |
|-----------|----------|-------------|
| **Database File** | Render filesystem (`/server/database/maintenance.db`) | ❌ No (ephemeral) |
| **Backend Code** | Render server | ✅ Yes |
| **Data** | SQLite file on Render | ❌ Lost on restart |

**Bottom Line:** Your database is on Render, but it's **not persistent** on the free tier. Data will be lost when the service restarts.



