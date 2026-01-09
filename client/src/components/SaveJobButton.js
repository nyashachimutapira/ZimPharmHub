import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SaveJobButton.css';

const SaveJobButton = ({ jobId, userId, size = 'medium', showText = true }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if job is saved on component mount
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!userId || !jobId) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await axios.get(`/api/saved-jobs/check/${jobId}`, {
          headers: { 'user-id': userId }
        });
        setIsSaved(response.data.isSaved);
      } catch (error) {
        console.error('Error checking if job is saved:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkIfSaved();
  }, [jobId, userId]);

  const handleSaveToggle = async () => {
    if (!userId) {
      // Show login prompt or redirect to login
      alert('Please log in to save jobs');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave the job
        const response = await axios.get(`/api/saved-jobs/check/${jobId}`, {
          headers: { 'user-id': userId }
        });

        if (response.data.savedJobId) {
          await axios.delete(`/api/saved-jobs/${response.data.savedJobId}`, {
            headers: { 'user-id': userId }
          });
        }

        setIsSaved(false);
        // Show success toast
        showToast('Job removed from saved jobs', 'success');
      } else {
        // Save the job
        await axios.post('/api/saved-jobs', {
          jobId,
          notes: '',
          emailReminderEnabled: false,
          reminderFrequency: 'weekly'
        }, {
          headers: { 'user-id': userId }
        });

        setIsSaved(true);
        // Show success toast
        showToast('Job saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error toggling job save:', error);
      showToast('Failed to save job. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type) => {
    // Dispatch toast event - assuming there's a toast system
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  };

  if (isChecking) {
    return (
      <button className={`save-job-button loading ${size}`} disabled>
        <div className="save-job-spinner"></div>
        {showText && <span>Loading...</span>}
      </button>
    );
  }

  return (
    <button
      className={`save-job-button ${isSaved ? 'saved' : 'unsaved'} ${size} ${isLoading ? 'loading' : ''}`}
      onClick={handleSaveToggle}
      disabled={isLoading}
      aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
      title={isSaved ? 'Remove from saved jobs' : 'Save job'}
    >
      <svg
        className={`save-job-icon ${isSaved ? 'saved' : ''}`}
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {isLoading && <div className="save-job-spinner"></div>}

      {showText && (
        <span className="save-job-text">
          {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default SaveJobButton;
