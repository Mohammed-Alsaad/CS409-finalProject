# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD.

## Workflows

### `deploy-frontend.yml`
- **Purpose**: Automatically deploys the React frontend to GitHub Pages
- **Triggers**: 
  - Push to `main` or `master` branch
  - Manual workflow dispatch
- **What it does**:
  1. Builds the React app
  2. Deploys to GitHub Pages
- **Requirements**: 
  - GitHub Pages must be enabled in repository settings
  - Set `REACT_APP_API_URL` secret if backend is deployed

### `deploy-backend.yml`
- **Purpose**: Provides information about backend deployment
- **Note**: Backend cannot be deployed to GitHub Pages (requires Node.js hosting)

### `test.yml`
- **Purpose**: Runs tests on pull requests and pushes
- **What it does**:
  1. Tests that backend server starts
  2. Tests that frontend builds successfully

## Setup Instructions

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Select "GitHub Actions"

2. **Set Environment Variables** (if backend is deployed):
   - Go to Settings → Secrets and variables → Actions
   - Add secret: `REACT_APP_API_URL` with your backend URL

3. **Push to main branch**:
   - The workflow will automatically run and deploy

## Deployment Status

Check the **Actions** tab in your repository to see workflow status.

