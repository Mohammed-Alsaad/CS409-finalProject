const express = require('express');
const { sendReminderEmail } = require('../services/emailService');
require('dotenv').config();

const router = express.Router();

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({ 
        error: 'Email not configured. Please set SMTP_USER and SMTP_PASS in .env file' 
      });
    }

    // Send test email
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 2); // 2 days from now
    
    await sendReminderEmail(
      email,
      'Test User',
      'Test Maintenance Task',
      testDate.toISOString().split('T')[0],
      2
    );

    res.json({ 
      success: true, 
      message: `Test email sent successfully to ${email}! Please check your inbox (and spam folder).` 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
});

// Get email configuration status (without exposing credentials)
router.get('/email-status', (req, res) => {
  const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  
  res.json({
    configured: isConfigured,
    host: process.env.SMTP_HOST || 'not set',
    port: process.env.SMTP_PORT || 'not set',
    user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'not set',
    from: process.env.SMTP_FROM || 'not set'
  });
});

module.exports = router;

