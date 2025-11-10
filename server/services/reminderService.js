const cron = require('node-cron');
const { getDb } = require('../database/db');
const { sendReminderEmail } = require('./emailService');

// Run daily at 9 AM
function startReminderScheduler() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Checking for tasks due soon...');
    checkAndSendReminders();
  });
  console.log('Reminder scheduler started');
}

function checkAndSendReminders() {
  const db = getDb();
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const todayStr = today.toISOString().split('T')[0];
  const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

  // Get tasks due in the next 3 days that are still pending
  db.all(
    `SELECT t.*, u.email, u.name 
     FROM tasks t 
     JOIN users u ON t.user_id = u.id 
     WHERE t.next_due_date BETWEEN ? AND ? 
     AND t.status = 'pending'`,
    [todayStr, threeDaysStr],
    (err, tasks) => {
      if (err) {
        console.error('Error checking reminders:', err);
        return;
      }

      tasks.forEach(task => {
        const daysUntilDue = Math.ceil(
          (new Date(task.next_due_date) - today) / (1000 * 60 * 60 * 24)
        );
        
        sendReminderEmail(
          task.email,
          task.name,
          task.title,
          task.next_due_date,
          daysUntilDue
        );
      });

      console.log(`Sent ${tasks.length} reminder emails`);
    }
  );
}

module.exports = { startReminderScheduler, checkAndSendReminders };

