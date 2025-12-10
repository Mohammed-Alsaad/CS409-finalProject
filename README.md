# Home Maintenance Planner

A simple and intuitive home maintenance task tracking application that helps renters and homeowners keep track of their maintenance tasks with email reminders and easy-to-use tracking.

## Features

- **User Authentication**: Secure login and signup with JWT tokens
- **Task Management**: Add, edit, complete, and delete maintenance tasks
- **Smart Dashboard**: View all tasks with color-coded status (overdue, due today, upcoming, completed)
- **Calendar View**: See tasks organized by due date
- **Smart Suggestions**: Get personalized maintenance task suggestions based on your home type
- **Email Reminders**: Automatic email notifications before tasks are due (configurable)
- **Task History**: Track completed tasks and view completion history
- **Priority Levels**: Organize tasks by priority (low, medium, high)
- **Recurring Tasks**: Set up tasks that repeat automatically after completion

## Tech Stack

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** for authentication
- **Nodemailer** for email reminders
- **node-cron** for scheduled reminders

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **date-fns** for date formatting
- Modern CSS with gradient designs

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm run install-all
   ```
   This will install dependencies for both the server and client.

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Email Configuration (Optional - for email reminders)
   # If not set, reminders will be logged to console only
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@homemaintenance.com
   ```

   **Note**: For Gmail, you'll need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

4. **Run the application**:
   ```bash
   npm run dev
   ```
   This starts both the backend server (port 5000) and the React frontend (port 3000).

   Or run them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

1. **Create an Account**: Sign up with your email, name, and home type
2. **Add Tasks**: Click "Add Task" to create maintenance tasks manually
3. **Get Suggestions**: Click "Get Suggestions" to see recommended tasks based on your home type
4. **View Dashboard**: See all your tasks organized by status
5. **Complete Tasks**: Mark tasks as complete when finished
6. **Set Reminders**: Tasks with due dates will automatically trigger email reminders 3 days before they're due

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Tasks
- `GET /api/tasks` - Get all tasks for user (requires auth)
- `GET /api/tasks/:id` - Get task by ID (requires auth)
- `POST /api/tasks` - Create new task (requires auth)
- `PUT /api/tasks/:id` - Update task (requires auth)
- `POST /api/tasks/:id/complete` - Mark task as complete (requires auth)
- `GET /api/tasks/:id/history` - Get task completion history (requires auth)
- `DELETE /api/tasks/:id` - Delete task (requires auth)

### Suggestions
- `GET /api/suggestions` - Get smart suggestions (requires auth)

## Email Reminders

The application includes a scheduled reminder system that runs daily at 9 AM. It checks for tasks due in the next 3 days and sends email reminders.

**Note**: If SMTP credentials are not configured, reminders will be logged to the console instead of being sent via email.

## Database

The application uses **Supabase (PostgreSQL)** for persistent data storage. The database connection is configured via the `DATABASE_URL` environment variable.

### Setup
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings → Database
4. Add `DATABASE_URL` to your `.env` file

See `SUPABASE_SETUP.md` for detailed setup instructions.

### Tables
- **users**: User accounts and home information
- **tasks**: Maintenance tasks
- **task_history**: Completion history for tasks

All tables are automatically created on first run.

## Development

### Running Tests
```bash
cd client
npm test
```

### Building for Production
```bash
npm run build
```

This builds the React app for production to the `client/build` folder.

## Future Enhancements

- Weather-based task suggestions
- Mobile app version
- Integration with smart home devices
- Photo attachments for tasks
- Export task lists to PDF
- Multiple homes/properties support
- Team/family member sharing

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

