import React, { useState } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CreatePostModal.css';

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General Discussion');
  const [tags, setTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'General Discussion',
    'Job Tips',
    'Product Discussion',
    'Practice Management',
    'News'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }
    if (!content.trim()) {
      setErrors({ content: 'Content is required' });
      return;
    }
    if (title.length < 5) {
      setErrors({ title: 'Title must be at least 5 characters' });
      return;
    }
    if (content.length < 20) {
      setErrors({ content: 'Content must be at least 20 characters' });
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/forum' } });
      return;
    }

    setPosting(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId');
      
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5); // Limit to 5 tags

      const response = await axios.post('/api/forum', {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tagsArray
      }, {
        headers: {
          'user-id': userId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Reset form
      setTitle('');
      setContent('');
      setCategory('General Discussion');
      setTags('');
      setErrors({});

      // Close modal and refresh posts
      onClose();
      if (onPostCreated) {
        onPostCreated();
      } else {
        // Navigate to the new post
        navigate(`/forum/${response.data._id || response.data.id}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create post. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    if (!posting) {
      setTitle('');
      setContent('');
      setCategory('General Discussion');
      setTags('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button 
            className="modal-close" 
            onClick={handleClose}
            disabled={posting}
          >
            <FaTimes />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="post-title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className={errors.title ? 'has-error' : ''}
              disabled={posting}
              maxLength={255}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
            <span className="field-hint">{title.length}/255 characters</span>
          </div>

          <div className="form-group">
            <label htmlFor="post-category">
              Category <span className="required">*</span>
            </label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={errors.category ? 'has-error' : ''}
              disabled={posting}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <span className="error-message">{errors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="post-content">
              Content <span className="required">*</span>
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or experiences..."
              rows="8"
              className={errors.content ? 'has-error' : ''}
              disabled={posting}
            />
            {errors.content && (
              <span className="error-message">{errors.content}</span>
            )}
            <span className="field-hint">{content.length} characters (minimum 20)</span>
          </div>

          <div className="form-group">
            <label htmlFor="post-tags">
              Tags <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              id="post-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate tags with commas (e.g., pharmacy, job, tips)"
              className={errors.tags ? 'has-error' : ''}
              disabled={posting}
            />
            {errors.tags && (
              <span className="error-message">{errors.tags}</span>
            )}
            <span className="field-hint">Add up to 5 tags to help others find your post</span>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={posting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={posting || !title.trim() || !content.trim()}
            >
              {posting ? (
                <>
                  <FaSpinner className="spinner" /> Posting...
                </>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;

