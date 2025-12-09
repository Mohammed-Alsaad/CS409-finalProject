const cron = require('node-cron');
const { getDb } = require('../database/db');
const { sendReminderEmail } = require('./emailService');

// Run daily at 9 AM
function startReminderScheduler() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Checking for tasks due soon...');
    await checkAndSendReminders();
  });
  console.log('Reminder scheduler started');
}

async function checkAndSendReminders() {
  try {
    const db = getDb();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get maximum reminder days to check (default to 7 days ahead)
    const maxDaysAhead = 7;
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDaysAhead);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    // Get all pending tasks due within the next maxDaysAhead days
    const result = await db.query(
      `SELECT t.*, u.email, u.name 
       FROM tasks t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.next_due_date BETWEEN $1 AND $2 
       AND t.status = 'pending'`,
      [todayStr, maxDateStr]
    );

    let emailsSent = 0;

    for (const task of result.rows) {
      const daysUntilDue = Math.ceil(
        (new Date(task.next_due_date) - today) / (1000 * 60 * 60 * 24)
      );
      
      // Use task-specific reminder_days_before, default to 3 if not set
      const reminderDaysBefore = task.reminder_days_before || 3;
      
      // Only send reminder if we're at the right time (within reminder window)
      // Send reminder when daysUntilDue equals reminder_days_before
      if (daysUntilDue === reminderDaysBefore || daysUntilDue === 0) {
        await sendReminderEmail(
          task.email,
          task.name,
          task.title,
          task.next_due_date,
          daysUntilDue
        );
        emailsSent++;
      }
    }

    console.log(`Checked ${result.rows.length} tasks, sent ${emailsSent} reminder emails`);
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

module.exports = { startReminderScheduler, checkAndSendReminders };
