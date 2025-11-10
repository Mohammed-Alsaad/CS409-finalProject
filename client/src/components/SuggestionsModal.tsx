import React, { useState, useEffect } from 'react';
import { suggestionsAPI, tasksAPI, Suggestion } from '../api/api';
import { format, addDays } from 'date-fns';
import './Modal.css';

interface SuggestionsModalProps {
  onClose: () => void;
  onTaskAdded: () => void;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ onClose, onTaskAdded }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTasks, setAddingTasks] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await suggestionsAPI.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (suggestion: Suggestion, index: number) => {
    setAddingTasks(new Set(addingTasks).add(index));
    try {
      const nextDueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      await tasksAPI.create({
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        frequency_days: suggestion.frequency_days,
        next_due_date: nextDueDate,
        priority: suggestion.priority as 'low' | 'medium' | 'high',
      });
      onTaskAdded();
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      const newSet = new Set(addingTasks);
      newSet.delete(index);
      setAddingTasks(newSet);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading suggestions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💡 Smart Suggestions</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p className="modal-description">
          Based on your home type, here are some recommended maintenance tasks:
        </p>

        <div className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              <div className="suggestion-content">
                <h3>{suggestion.title}</h3>
                <p>{suggestion.description}</p>
                <div className="suggestion-meta">
                  <span className="suggestion-category">{suggestion.category}</span>
                  <span className="suggestion-frequency">Every {suggestion.frequency_days} days</span>
                  <span className={`suggestion-priority priority-${suggestion.priority}`}>
                    {suggestion.priority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleAddTask(suggestion, index)}
                disabled={addingTasks.has(index)}
                className="btn-add-suggestion"
              >
                {addingTasks.has(index) ? 'Adding...' : '+ Add Task'}
              </button>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;

