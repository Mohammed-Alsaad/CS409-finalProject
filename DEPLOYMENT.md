# Deployment Guide

This guide explains how to deploy the Home Maintenance Planner application.

## Architecture

- **Frontend**: React app (can be deployed to GitHub Pages)
- **Backend**: Node.js/Express API (requires a Node.js hosting service)

## Frontend Deployment (GitHub Pages)

The frontend is automatically deployed to GitHub Pages when you push to the `main` or `master` branch.

### Setup Steps

1. **Enable GitHub Pages in your repository**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Set the API URL** (if your backend is deployed):
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `REACT_APP_API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend.railway.app/api`)
   - Click **Add secret**

3. **Push to main branch**:
   ```bash
   git push origin main
   ```

4. **Check deployment**:
   - Go to **Actions** tab in your repository
   - You should see the workflow running
   - Once complete, your site will be available at: `https://yourusername.github.io/repository-name`

### Manual Deployment

If you want to deploy manually:

```bash
cd client
npm install
REACT_APP_API_URL=https://your-backend-url.com/api npm run build
# Then upload the build folder to your hosting service
```

## Backend Deployment

GitHub Pages only serves static files, so the backend must be deployed to a Node.js hosting service. Here are recommended options:

### Option 1: Railway (Recommended - Easy & Free Tier)

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create a new project**:
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Choose your repository

3. **Configure the service**:
   - Railway will auto-detect Node.js
   - Set the **Root Directory** to `/` (project root)
   - Set the **Start Command** to: `npm run server`
   - Or create a `Procfile` with: `web: npm run server`

4. **Add environment variables**:
   - Go to **Variables** tab
   - Add all variables from your `.env` file:
     - `PORT` (Railway will set this automatically, but you can override)
     - `JWT_SECRET`
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

5. **Deploy**:
   - Railway will automatically deploy on every push
   - Your backend URL will be something like: `https://your-app.railway.app`

6. **Update frontend API URL**:
   - Update the `REACT_APP_API_URL` secret in GitHub Actions with your Railway URL

### Option 2: Render

1. **Sign up**: Go to [render.com](https://render.com) and sign up

2. **Create a new Web Service**:
   - Click **New** → **Web Service**
   - Connect your GitHub repository
   - Configure:
     - **Name**: home-maintenance-planner-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm run server`
     - **Root Directory**: `/` (leave empty)

3. **Add environment variables**:
   - Go to **Environment** tab
   - Add all variables from your `.env` file

4. **Deploy**:
   - Render will automatically deploy
   - Your backend URL will be: `https://your-app.onrender.com`

### Option 3: Fly.io

1. **Install Fly CLI**:
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Sign up and login**:
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Create a fly.toml** (already created in project):
   ```bash
   fly launch
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

### Option 4: Heroku

1. **Install Heroku CLI**: Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set SMTP_HOST=smtp.gmail.com
   # ... add all other variables
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

## Environment Variables for Backend

Make sure to set these in your hosting service:

```env
PORT=5000  # (usually auto-set by hosting service)
JWT_SECRET=your-super-secret-jwt-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@homemaintenance.com
```

## Database Considerations

The app uses SQLite, which works for development but has limitations in production:

- **SQLite files are ephemeral** on most hosting services (they get deleted on restart)
- **For production**, consider migrating to:
  - PostgreSQL (recommended)
  - MySQL
  - MongoDB

### Quick PostgreSQL Migration (Optional)

If you want to use PostgreSQL on Railway:

1. Add a PostgreSQL service in Railway
2. Get the connection string
3. Update `server/database/db.js` to use PostgreSQL instead of SQLite
4. Install: `npm install pg`

## CORS Configuration

Make sure your backend allows requests from your frontend domain. The current setup uses:

```javascript
app.use(cors());
```

This allows all origins. For production, you might want to restrict it:

```javascript
app.use(cors({
  origin: ['https://yourusername.github.io', 'http://localhost:3000']
}));
```

## Testing the Deployment

1. **Frontend**: Visit your GitHub Pages URL
2. **Backend**: Test the API:
   ```bash
   curl https://your-backend-url.com/api/health
   ```
3. **Full test**: Try logging in and creating a task

## Troubleshooting

### Frontend can't connect to backend

- Check that `REACT_APP_API_URL` is set correctly
- Verify CORS is configured on the backend
- Check browser console for errors

### Backend not starting

- Check environment variables are set
- Verify the start command is correct
- Check logs in your hosting service dashboard

### Database errors

- SQLite files might be getting deleted
- Consider migrating to PostgreSQL for production

## Continuous Deployment

Both frontend and backend will automatically deploy when you push to the main branch:

- **Frontend**: GitHub Actions → GitHub Pages
- **Backend**: Depends on your hosting service (Railway/Render auto-deploy)

## Cost Estimates

- **GitHub Pages**: Free
- **Railway**: Free tier (500 hours/month), then $5/month
- **Render**: Free tier available, then $7/month
- **Fly.io**: Free tier available
- **Heroku**: No free tier (paid plans start at $5/month)

## Next Steps

1. Deploy backend to Railway/Render
2. Update frontend API URL secret
3. Enable GitHub Pages
4. Push to main branch
5. Test the full application

Your app will be live! 🚀

