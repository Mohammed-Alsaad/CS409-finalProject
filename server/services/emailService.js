const nodemailer = require('nodemailer');

// Configure email transporter
// For production, use real SMTP credentials
// For development, you can use services like Gmail, SendGrid, or Mailtrap
let transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.log('⚠️  No SMTP credentials found. Email reminders will be logged to console only.');
  console.log('   To enable email, set SMTP_USER and SMTP_PASS in .env file');
  
  transporter = {
    sendMail: (options) => {
      console.log('\n📧 EMAIL REMINDER (Mock):');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text}\n`);
      return Promise.resolve({ messageId: 'mock-message-id' });
    }
  };
}

function sendReminderEmail(userEmail, userName, taskTitle, dueDate, daysUntilDue) {
  const subject = daysUntilDue === 0 
    ? `⚠️ Urgent: ${taskTitle} is due today!`
    : daysUntilDue === 1
    ? `Reminder: ${taskTitle} is due tomorrow`
    : `Reminder: ${taskTitle} is due in ${daysUntilDue} days`;

  const text = `
Hello ${userName},

This is a reminder about your home maintenance task:

Task: ${taskTitle}
Due Date: ${new Date(dueDate).toLocaleDateString()}
Days Until Due: ${daysUntilDue === 0 ? 'Today!' : daysUntilDue}

Don't forget to complete this task to keep your home in good condition!

Best regards,
Home Maintenance Planner
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Home Maintenance Reminder</h2>
      <p>Hello ${userName},</p>
      <p>This is a reminder about your home maintenance task:</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        <p><strong>Days Until Due:</strong> <span style="color: ${daysUntilDue === 0 ? '#e74c3c' : '#f39c12'}; font-weight: bold;">${daysUntilDue === 0 ? 'Today!' : daysUntilDue}</span></p>
      </div>
      <p>Don't forget to complete this task to keep your home in good condition!</p>
      <p style="color: #7f8c8d; margin-top: 30px;">Best regards,<br>Home Maintenance Planner</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@homemaintenance.com',
    to: userEmail,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions).catch(err => {
    console.error('Error sending email:', err);
  });
}

module.exports = { sendReminderEmail };

