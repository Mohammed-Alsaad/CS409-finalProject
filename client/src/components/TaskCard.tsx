import React from 'react';
import { Task } from '../api/api';
import { format, differenceInDays } from 'date-fns';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  status: 'overdue' | 'due-today' | 'due-soon' | 'upcoming' | 'completed';
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, status, onEdit, onComplete, onDelete }) => {
  const dueDate = new Date(task.next_due_date);
  const daysUntil = differenceInDays(dueDate, new Date());

  const getStatusColor = () => {
    switch (status) {
      case 'overdue': return '#e74c3c';
      case 'due-today': return '#f39c12';
      case 'due-soon': return '#f1c40f';
      case 'completed': return '#27ae60';
      default: return '#3498db';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'overdue': return 'Overdue';
      case 'due-today': return 'Due Today';
      case 'due-soon': return `Due in ${daysUntil} days`;
      case 'completed': return 'Completed';
      default: return `Due in ${daysUntil} days`;
    }
  };

  return (
    <div className="task-card" style={{ borderTopColor: getStatusColor() }}>
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className="task-status" style={{ backgroundColor: getStatusColor() }}>
          {getStatusText()}
        </span>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.category && (
          <span className="task-category">{task.category}</span>
        )}
        <span className={`task-priority priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      <div className="task-due-date">
        <strong>Due:</strong> {format(dueDate, 'MMM dd, yyyy')}
      </div>

      {task.last_completed && (
        <div className="task-last-completed">
          Last completed: {format(new Date(task.last_completed), 'MMM dd, yyyy')}
        </div>
      )}

      <div className="task-actions">
        {task.status !== 'completed' && (
          <button onClick={onComplete} className="btn-complete">
            ✓ Complete
          </button>
        )}
        <button onClick={onEdit} className="btn-edit">
          Edit
        </button>
        <button onClick={onDelete} className="btn-delete">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;

