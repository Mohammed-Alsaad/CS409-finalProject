const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const { sendCompletionEmail } = require('../services/emailService');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks for user
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const result = await db.query(
      `SELECT t.*, 
       (SELECT COUNT(*) FROM task_history th WHERE th.task_id = t.id) as completion_count
       FROM tasks t 
       WHERE t.user_id = $1 
       ORDER BY t.next_due_date ASC`,
      [userId]
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const taskId = req.params.id;

    const result = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { title, description, category, frequency_days, reminder_days_before, next_due_date, priority } = req.body;

    if (!title || !next_due_date) {
      return res.status(400).json({ error: 'Title and next_due_date are required' });
    }

    const result = await db.query(
      `INSERT INTO tasks (user_id, title, description, category, frequency_days, reminder_days_before, next_due_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, description || null, category || null, frequency_days || null, reminder_days_before || 3, next_due_date, priority || 'medium']
    );

    res.status(201).json({
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, category, frequency_days, reminder_days_before, next_due_date, priority, status } = req.body;

    // First check if task belongs to user
    const checkResult = await db.query('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (frequency_days !== undefined) {
      updates.push(`frequency_days = $${paramIndex++}`);
      values.push(frequency_days);
    }
    if (reminder_days_before !== undefined) {
      updates.push(`reminder_days_before = $${paramIndex++}`);
      values.push(reminder_days_before);
    }
    if (next_due_date !== undefined) {
      updates.push(`next_due_date = $${paramIndex++}`);
      values.push(next_due_date);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(taskId);
    const whereParam = `$${paramIndex}`;

    await db.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ${whereParam}`,
      values
    );

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Mark task as complete
router.post('/:id/complete', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const taskId = req.params.id;
    const { notes } = req.body;

    // Get task details with user info
    const taskResult = await db.query(
      `SELECT t.*, u.email, u.name 
       FROM tasks t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1 AND t.user_id = $2`,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];
    const today = new Date().toISOString().split('T')[0];

    // Add to history
    await db.query(
      'INSERT INTO task_history (task_id, completed_date, notes) VALUES ($1, $2, $3)',
      [taskId, today, notes || null]
    );

    // Update task
    let nextDueDate = task.next_due_date;
    const isRecurring = !!task.frequency_days;
    if (task.frequency_days) {
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + task.frequency_days);
      nextDueDate = nextDate.toISOString().split('T')[0];
    }

    await db.query(
      'UPDATE tasks SET last_completed = $1, next_due_date = $2, status = $3 WHERE id = $4',
      [today, nextDueDate, 'completed', taskId]
    );

    // Send completion confirmation email
    sendCompletionEmail(
      task.email,
      task.name,
      task.title,
      today,
      isRecurring ? nextDueDate : null,
      isRecurring
    );

    res.json({ message: 'Task marked as complete', next_due_date: nextDueDate });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Get task history
router.get('/:id/history', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const taskId = req.params.id;

    // Verify task belongs to user
    const checkResult = await db.query('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const result = await db.query(
      'SELECT * FROM task_history WHERE task_id = $1 ORDER BY completed_date DESC',
      [taskId]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const taskId = req.params.id;

    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
