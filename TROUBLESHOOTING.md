# Troubleshooting White Screen on GitHub Pages

## Common Causes

### 1. API Connection Issues ✅ FIXED
- **Problem**: Frontend trying to connect to wrong API URL
- **Fix**: Updated `client/src/api/api.ts` to use Render backend URL
- **Status**: Fixed in latest commit

### 2. React Router Basename ✅ FIXED
- **Problem**: React Router not configured for GitHub Pages subdirectory
- **Fix**: Added `basename` prop to Router and updated `homepage` in package.json
- **Status**: Fixed in latest commit

### 3. Check Browser Console

Open browser DevTools (F12) and check for errors:

**Common errors:**
- `Failed to fetch` - Backend connection issue
- `Cannot read property of undefined` - JavaScript error
- `404 Not Found` - Asset loading issue

### 4. Verify Build Output

The build should show:
```
The project was built assuming it is hosted at /CS409-finalProject/.
```

If it shows something else, check `package.json` homepage field.

## Quick Fixes

### If still seeing white screen after push:

1. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito/private window

2. **Check GitHub Actions**:
   - Go to Actions tab
   - Verify latest deployment succeeded
   - Check for build errors

3. **Verify API is accessible**:
   ```bash
   curl https://home-maintenance-planner-api.onrender.com/api/health
   ```
   Should return: `{"status":"ok","message":"Home Maintenance Planner API is running"}`

4. **Check browser console**:
   - Open DevTools (F12)
   - Look for red errors
   - Check Network tab for failed requests

## Deployment Checklist

- [x] API URL updated to Render backend
- [x] React Router basename configured
- [x] Homepage set in package.json
- [ ] GitHub Actions secret `REACT_APP_API_URL` set (optional, uses hardcoded fallback)
- [ ] Latest commit pushed to main branch
- [ ] GitHub Actions deployment completed

## Still Not Working?

1. **Check the actual deployed files**:
   - Visit: `https://mohammed-alsaad.github.io/CS409-finalProject/static/js/main.*.js`
   - Should load JavaScript file (not 404)

2. **Verify index.html**:
   - Visit: `https://mohammed-alsaad.github.io/CS409-finalProject/`
   - View page source
   - Check if script tags point to correct paths

3. **Test API directly**:
   - Open browser console
   - Run: `fetch('https://home-maintenance-planner-api.onrender.com/api/health').then(r => r.json()).then(console.log)`
   - Should return health check response

4. **Check Render backend logs**:
   - Go to Render dashboard
   - Check if backend is running
   - Look for any error messages

## Expected Behavior

After fixes:
1. Page loads (not white screen)
2. Shows login page (if not logged in)
3. Can register/login
4. Can access dashboard
5. Can create/view tasks

If any step fails, check browser console for specific error messages.

