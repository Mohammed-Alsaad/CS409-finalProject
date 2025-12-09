import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, Task } from '../api/api';
import { isPast, isToday, differenceInDays, format, isSameDay } from 'date-fns';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import SuggestionsModal from '../components/SuggestionsModal';
import CalendarView from '../components/CalendarView';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await tasksAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      await tasksAPI.complete(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(taskId);
        await loadTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    
    // Apply date filter if a date is selected
    if (selectedDate) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.next_due_date);
        return isSameDay(taskDate, selectedDate);
      });
    }
    
    // Apply status filter
    return filtered.filter(task => {
      const dueDate = new Date(task.next_due_date);
      if (filter === 'upcoming') {
        return !isPast(dueDate) && !isToday(dueDate) && task.status === 'pending';
      }
      if (filter === 'overdue') {
        return isPast(dueDate) && !isToday(dueDate) && task.status === 'pending';
      }
      if (filter === 'completed') {
        return task.status === 'completed';
      }
      return true;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('list');
    setFilter('all');
  };

  const handleCalendarTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const getTaskStatus = (task: Task) => {
    const dueDate = new Date(task.next_due_date);
    if (task.status === 'completed') return 'completed';
    if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
    if (isToday(dueDate)) return 'due-today';
    const daysUntil = differenceInDays(dueDate, new Date());
    if (daysUntil <= 3) return 'due-soon';
    return 'upcoming';
  };

  const filteredTasks = getFilteredTasks();
  const stats = {
    total: tasks.length,
    overdue: tasks.filter(t => isPast(new Date(t.next_due_date)) && !isToday(new Date(t.next_due_date)) && t.status === 'pending').length,
    dueToday: tasks.filter(t => isToday(new Date(t.next_due_date)) && t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Home Maintenance Planner</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={logout} className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <h3>Total Tasks</h3>
            <p>{stats.total}</p>
          </div>
          <div className="stat-card stat-overdue">
            <h3>Overdue</h3>
            <p>{stats.overdue}</p>
          </div>
          <div className="stat-card stat-due-today">
            <h3>Due Today</h3>
            <p>{stats.dueToday}</p>
          </div>
          <div className="stat-card stat-completed">
            <h3>Completed</h3>
            <p>{stats.completed}</p>
          </div>
        </div>

        <div className="dashboard-actions">
          <button onClick={() => { setSelectedTask(null); setShowTaskModal(true); }} className="btn-primary">
            + Add Task
          </button>
          <button onClick={() => setShowSuggestionsModal(true)} className="btn-secondary">
            💡 Get Suggestions
          </button>
          <div className="view-toggle">
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => { setViewMode('list'); setSelectedDate(null); }}
            >
              📋 List
            </button>
            <button
              className={viewMode === 'calendar' ? 'active' : ''}
              onClick={() => { setViewMode('calendar'); setSelectedDate(null); }}
            >
              📅 Calendar
            </button>
          </div>
        </div>

        {selectedDate && (
          <div className="selected-date-filter">
            <span>Showing tasks for: <strong>{format(selectedDate, 'MMMM dd, yyyy')}</strong></span>
            <button onClick={() => setSelectedDate(null)} className="btn-clear-filter">Clear</button>
          </div>
        )}

        {viewMode === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onTaskClick={handleCalendarTaskClick}
            onDateClick={handleDateClick}
          />
        )}

        {viewMode === 'list' && (
          <>
            <div className="filter-tabs">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All Tasks
              </button>
              <button
                className={filter === 'overdue' ? 'active' : ''}
                onClick={() => setFilter('overdue')}
              >
                Overdue
              </button>
              <button
                className={filter === 'upcoming' ? 'active' : ''}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>

            <div className="tasks-grid">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found. Add a new task or get suggestions!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                status={getTaskStatus(task)}
                onEdit={() => { setSelectedTask(task); setShowTaskModal(true); }}
                onComplete={() => handleTaskComplete(task.id)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))
          )}
            </div>
          </>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
          onSave={loadTasks}
        />
      )}

      {showSuggestionsModal && (
        <SuggestionsModal
          onClose={() => setShowSuggestionsModal(false)}
          onTaskAdded={loadTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;

