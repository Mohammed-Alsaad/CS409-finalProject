# Quick Deployment Guide

## 🚀 Deploy in 3 Steps

### Step 1: Deploy Backend (Choose One)

#### Option A: Railway (Easiest - Recommended)
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Add environment variables from your `.env` file
5. Your backend URL will be: `https://your-app.railway.app`

#### Option B: Render
1. Go to [render.com](https://render.com) and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Build: `npm install`, Start: `npm run server`
5. Add environment variables
6. Your backend URL: `https://your-app.onrender.com`

### Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save

### Step 3: Set Frontend API URL

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `REACT_APP_API_URL`
4. Value: Your backend URL + `/api` (e.g., `https://your-app.railway.app/api`)
5. Click **Add secret**

### Step 4: Push to Deploy

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

That's it! 🎉

- Frontend will deploy automatically to GitHub Pages
- Check the **Actions** tab to see deployment progress
- Your site will be at: `https://yourusername.github.io/repository-name`

## 📝 Important Notes

- **Backend must be deployed first** before frontend can work
- Update `REACT_APP_API_URL` secret with your actual backend URL
- The backend URL should end with `/api` (e.g., `https://your-app.railway.app/api`)

## 🔍 Troubleshooting

**Frontend can't connect to backend?**
- Check `REACT_APP_API_URL` secret is set correctly
- Verify backend is running and accessible
- Check browser console for errors

**Deployment failed?**
- Check the **Actions** tab for error messages
- Make sure GitHub Pages is enabled
- Verify all environment variables are set

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

