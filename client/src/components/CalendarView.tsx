import React, { useState } from 'react';
import { Task } from '../api/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import './CalendarView.css';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      const taskDate = new Date(task.next_due_date);
      return isSameDay(taskDate, date);
    });
  };

  const getTaskStatus = (task: Task): string => {
    const dueDate = new Date(task.next_due_date);
    if (task.status === 'completed') return 'completed';
    if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
    if (isToday(dueDate)) return 'due-today';
    return 'upcoming';
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={previousMonth} className="calendar-nav-btn">‹</button>
        <h2 className="calendar-month-year">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className="calendar-nav-btn">›</button>
        <button onClick={goToToday} className="calendar-today-btn">Today</button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}

        {daysInMonth.map((day, idx) => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div
              key={idx}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <div className="calendar-day-number">{format(day, 'd')}</div>
              <div className="calendar-day-tasks">
                {dayTasks.slice(0, 3).map(task => {
                  const status = getTaskStatus(task);
                  return (
                    <div
                      key={task.id}
                      className={`calendar-task-dot ${status}`}
                      title={task.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                    >
                      <span className="calendar-task-title">{task.title}</span>
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="calendar-more-tasks">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot overdue"></span>
          <span>Overdue</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot due-today"></span>
          <span>Due Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot upcoming"></span>
          <span>Upcoming</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot completed"></span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

