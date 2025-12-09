import React, { useState, useEffect } from 'react';
import { Task, tasksAPI } from '../api/api';
import { format } from 'date-fns';
import './Modal.css';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    frequency_days: '',
    reminder_days_before: '3',
    next_due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category || '',
        frequency_days: task.frequency_days?.toString() || '',
        reminder_days_before: task.reminder_days_before?.toString() || '3',
        next_due_date: task.next_due_date ? format(new Date(task.next_due_date), 'yyyy-MM-dd') : '',
        priority: task.priority,
      });
    } else {
      // Set default date to today
      setFormData({
        title: '',
        description: '',
        category: '',
        frequency_days: '',
        reminder_days_before: '3',
        next_due_date: format(new Date(), 'yyyy-MM-dd'),
        priority: 'medium',
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        frequency_days: formData.frequency_days ? parseInt(formData.frequency_days) : undefined,
        reminder_days_before: formData.reminder_days_before ? parseInt(formData.reminder_days_before) : 3,
      };

      if (task) {
        await tasksAPI.update(task.id, taskData);
      } else {
        await tasksAPI.create(taskData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Replace air filter"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add details about this task..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., HVAC, Plumbing"
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Next Due Date *</label>
              <input
                type="date"
                name="next_due_date"
                value={formData.next_due_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Repeat Every (days)</label>
              <input
                type="number"
                name="frequency_days"
                value={formData.frequency_days}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 90"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Reminder (days before due)</label>
            <select 
              name="reminder_days_before" 
              value={formData.reminder_days_before} 
              onChange={handleChange}
            >
              <option value="0">On due date</option>
              <option value="1">1 day before</option>
              <option value="2">2 days before</option>
              <option value="3">3 days before (default)</option>
              <option value="5">5 days before</option>
              <option value="7">1 week before</option>
              <option value="14">2 weeks before</option>
            </select>
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              You'll receive an email reminder this many days before the task is due
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-save">
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

