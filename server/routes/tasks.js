const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks for user
router.get('/', (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  db.all(
    `SELECT t.*, 
     (SELECT COUNT(*) FROM task_history th WHERE th.task_id = t.id) as completion_count
     FROM tasks t 
     WHERE t.user_id = ? 
     ORDER BY t.next_due_date ASC`,
    [userId],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ tasks });
    }
  );
});

// Get task by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const taskId = req.params.id;

  db.get(
    'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
    [taskId, userId],
    (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ task });
    }
  );
});

// Create new task
router.post('/', (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const { title, description, category, frequency_days, next_due_date, priority } = req.body;

  if (!title || !next_due_date) {
    return res.status(400).json({ error: 'Title and next_due_date are required' });
  }

  db.run(
    `INSERT INTO tasks (user_id, title, description, category, frequency_days, next_due_date, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, description || null, category || null, frequency_days || null, next_due_date, priority || 'medium'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }
      res.status(201).json({
        task: {
          id: this.lastID,
          user_id: userId,
          title,
          description,
          category,
          frequency_days,
          next_due_date,
          priority,
          status: 'pending'
        }
      });
    }
  );
});

// Update task
router.put('/:id', (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, description, category, frequency_days, next_due_date, priority, status } = req.body;

  // First check if task belongs to user
  db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (frequency_days !== undefined) {
      updates.push('frequency_days = ?');
      values.push(frequency_days);
    }
    if (next_due_date !== undefined) {
      updates.push('next_due_date = ?');
      values.push(next_due_date);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(taskId);

    db.run(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update task' });
        }
        res.json({ message: 'Task updated successfully' });
      }
    );
  });
});

// Mark task as complete
router.post('/:id/complete', (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const taskId = req.params.id;
  const { notes } = req.body;

  // Get task details
  db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Add to history
    db.run(
      'INSERT INTO task_history (task_id, completed_date, notes) VALUES (?, ?, ?)',
      [taskId, today, notes || null],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to record completion' });
        }

        // Update task
        let nextDueDate = task.next_due_date;
        if (task.frequency_days) {
          const nextDate = new Date(today);
          nextDate.setDate(nextDate.getDate() + task.frequency_days);
          nextDueDate = nextDate.toISOString().split('T')[0];
        }

        db.run(
          'UPDATE tasks SET last_completed = ?, next_due_date = ?, status = ? WHERE id = ?',
          [today, nextDueDate, 'completed', taskId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update task' });
            }
            res.json({ message: 'Task marked as complete', next_due_date: nextDueDate });
          }
        );
      }
    );
  });
});

// Get task history
router.get('/:id/history', (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const taskId = req.params.id;

  // Verify task belongs to user
  db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.all(
      'SELECT * FROM task_history WHERE task_id = ? ORDER BY completed_date DESC',
      [taskId],
      (err, history) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ history });
      }
    );
  });
});

// Delete task
router.delete('/:id', (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const taskId = req.params.id;

  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

module.exports = router;

