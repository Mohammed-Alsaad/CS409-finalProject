# Setup Instructions

Follow these steps to set up the Home Maintenance Planner application.

## Step 1: Install Dependencies

Install all required packages for both the backend and frontend:

```bash
npm run install-all
```

This command will:
- Install backend dependencies (Express, SQLite, etc.)
- Install frontend dependencies (React, TypeScript, etc.)

## Step 2: Create and Configure Environment Variables

Create a `.env` file in the root directory of the project with the following content:

```env
# Server Configuration
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-a-random-string

# Email Configuration (Optional - for email reminders)
# If not configured, reminders will be logged to console only
# For Gmail: Use an App Password (not your regular password)
# Generate one at: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=noreply@homemaintenance.com
```

**Quick way to create the file:**
- On Windows: Create a new file named `.env` in the project root (make sure it's not `.env.txt`)
- On Mac/Linux: Run `touch .env` in the project root
- Then copy the content above into the file

Now update it with your specific configuration:

### Required Configuration

1. **JWT_SECRET** (Required for security)
   - This is used to sign authentication tokens
   - **IMPORTANT**: Change this to a random, secure string
   - You can generate one using:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Or use any long random string (at least 32 characters recommended)

### Optional Configuration: Email Reminders

If you want to receive actual email reminders (instead of console logs), configure the SMTP settings:

#### For Gmail Users:

1. **Enable 2-Factor Authentication** on your Google account (if not already enabled)

2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. **Update `.env` file**:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  (the 16-character app password)
   ```

#### For Other Email Providers:

Update the SMTP settings in `.env`:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

**Custom SMTP (SendGrid, Mailgun, etc.):**
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### Note About Email
- If you don't configure email, the app will still work perfectly
- Reminders will be logged to the console instead of being sent via email
- You can always add email configuration later

## Step 3: Start the Application

### Development Mode (Recommended)

Start both the backend and frontend together:

```bash
npm run dev
```

This will:
- Start the backend server on http://localhost:5000
- Start the React frontend on http://localhost:3000
- Automatically reload when you make changes

### Alternative: Run Separately

If you prefer to run them in separate terminals:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Step 4: Access the Application

1. Open your web browser
2. Navigate to: http://localhost:3000
3. You should see the login page

## Step 5: Create Your Account

1. Click "Sign up" or navigate to the registration page
2. Fill in:
   - **Name**: Your full name
   - **Email**: Your email address
   - **Password**: Choose a secure password (minimum 6 characters)
   - **Home Type**: Select your home type (House, Apartment, Condo, or Townhouse)
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

## Step 6: Start Using the App

### Add Your First Task

1. Click the **"+ Add Task"** button
2. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Category (e.g., HVAC, Plumbing, Safety)
   - Priority (Low, Medium, High)
   - Next Due Date (required)
   - Repeat Every X days (optional, for recurring tasks)
3. Click "Create"

### Get Smart Suggestions

1. Click the **"💡 Get Suggestions"** button
2. Browse through recommended tasks based on your home type
3. Click **"+ Add Task"** on any suggestion to add it to your list

### Manage Tasks

- **Filter**: Use the filter tabs (All, Overdue, Upcoming, Completed)
- **Complete**: Click "✓ Complete" when you finish a task
- **Edit**: Click "Edit" to modify task details
- **Delete**: Click "Delete" to remove a task

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

1. Change the port in `.env`:
   ```env
   PORT=5001
   ```

2. Update the API URL in `client/src/api/api.ts`:
   ```typescript
   const API_URL = 'http://localhost:5001/api';
   ```

### Database Issues

If you encounter database errors:

1. Delete the database file: `server/database/maintenance.db`
2. Restart the server - it will recreate the database automatically

### Email Not Working

1. **Check your credentials**: Make sure SMTP_USER and SMTP_PASS are correct
2. **For Gmail**: Ensure you're using an App Password, not your regular password
3. **Check server logs**: Look for error messages in the terminal
4. **Test without email**: The app works fine without email - reminders will just be logged to console

### Module Not Found Errors

If you see "module not found" errors:

1. Make sure you ran `npm run install-all`
2. If that doesn't work, try:
   ```bash
   npm install
   cd client
   npm install
   ```

### React App Won't Start

1. Make sure you're using Node.js v14 or higher
2. Clear the cache and reinstall:
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   npm install
   ```

## Next Steps

- Explore the dashboard and add some tasks
- Try the smart suggestions feature
- Set up email reminders to get notified about upcoming tasks
- Customize tasks with categories and priorities

## Need Help?

- Check the `README.md` for detailed documentation
- Review the `QUICKSTART.md` for a quick reference
- Check server logs in the terminal for error messages

Enjoy managing your home maintenance tasks! 🏠✨

