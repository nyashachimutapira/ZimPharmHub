import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaEye, FaSpinner, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from '../components/CreatePostModal';
import './ForumPage.css';

function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/forum');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/forum' } });
      return;
    }
    setShowCreateModal(true);
  };

  const handlePostCreated = () => {
    fetchPosts(); // Refresh posts list
  };

  const handleLike = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/forum' } });
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId');
      
      await axios.post(`/api/forum/${postId}/like`, {}, {
        headers: {
          'user-id': userId,
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchPosts(); // Refresh posts to update like count
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const second = lastName?.charAt(0) || '';
    return (first + second).toUpperCase();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLiked = (post) => {
    if (!isAuthenticated || !post.likes) return false;
    const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId');
    return post.likes.some(likeId => likeId?.toString() === userId);
  };

  return (
    <div className="forum-page">
      <div className="container">
        <div className="forum-header">
          <div>
            <h1>Community Forum</h1>
            <p className="forum-subtitle">Connect, share, and learn with pharmacy professionals</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreatePost}>
            + Create Post
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <FaSpinner className="spinner" />
            <p>Loading discussions...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <FaComment className="empty-icon" />
            <h3>No posts yet</h3>
            <p>Be the first to start a discussion!</p>
            <button className="btn btn-primary" onClick={handleCreatePost}>
              Create First Post
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <Link 
                key={post._id || post.id} 
                to={`/forum/${post._id || post.id}`}
                className="forum-post-link"
              >
                <div className={`forum-post ${post.isPinned ? 'pinned' : ''} ${post.isFeatured ? 'featured' : ''}`}>
                  {(post.isPinned || post.isFeatured) && (
                    <div className="post-badges">
                      {post.isPinned && <span className="badge pinned">📌 Pinned</span>}
                      {post.isFeatured && <span className="badge featured">⭐ Featured</span>}
                    </div>
                  )}
                  
                  <div className="post-author">
                    <div className="author-avatar">
                      {post.author?.profilePicture ? (
                        <img src={post.author.profilePicture} alt={post.author.firstName} />
                      ) : (
                        <span>{getInitials(post.author?.firstName, post.author?.lastName)}</span>
                      )}
                    </div>
                    <div className="author-info">
                      <p className="author-name">
                        {post.author?.firstName} {post.author?.lastName}
                      </p>
                      <div className="post-meta">
                        <span className="post-date">{formatDate(post.createdAt)}</span>
                        {post.category && (
                          <span className="category-badge">{post.category}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p className="post-preview">
                      {post.content.length > 200 
                        ? `${post.content.substring(0, 200)}...` 
                        : post.content}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="post-footer">
                    <div className="post-stats">
                      <span className="stat-item">
                        <FaEye /> {post.views || 0}
                      </span>
                      <span className="stat-item">
                        <FaComment /> {post.comments?.length || 0}
                      </span>
                      <span className="stat-item">
                        <FaHeart /> {post.likes?.length || 0}
                      </span>
                    </div>
                    <button
                      className={`like-btn ${isLiked(post) ? 'liked' : ''}`}
                      onClick={(e) => handleLike(post._id || post.id, e)}
                      title={isLiked(post) ? 'Unlike' : 'Like'}
                    >
                      <FaHeart />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

export default ForumPage;
