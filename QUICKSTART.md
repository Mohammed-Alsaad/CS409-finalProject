# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start the Application
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

### 3. Create Your Account
1. Open http://localhost:3000 in your browser
2. Click "Sign up" to create an account
3. Enter your name, email, password, and home type
4. Start adding maintenance tasks!

## Optional: Enable Email Reminders

To receive actual email reminders (instead of console logs):

1. Create a `.env` file in the root directory
2. Add your email credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@homemaintenance.com
```

**For Gmail users**: You'll need to generate an [App Password](https://support.google.com/accounts/answer/185833) instead of using your regular password.

## Features to Try

1. **Add Tasks**: Click "Add Task" to create maintenance tasks
2. **Get Suggestions**: Click "Get Suggestions" to see recommended tasks based on your home type
3. **Filter Tasks**: Use the filter tabs to view overdue, upcoming, or completed tasks
4. **Complete Tasks**: Click "Complete" when you finish a task
5. **View History**: Tasks automatically track completion history

## Troubleshooting

**Port already in use?**
- Change the port in `.env`: `PORT=5001`
- Or change React port: `PORT=3001 npm start` in the client directory

**Database errors?**
- Delete `server/database/maintenance.db` and restart the server
- The database will be recreated automatically

**Email not working?**
- Check that SMTP credentials are correct in `.env`
- For Gmail, make sure you're using an App Password, not your regular password
- Without credentials, reminders will be logged to the console (check server logs)

