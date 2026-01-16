import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaComment, FaShare, FaArrowLeft, FaEdit, FaTrash, FaThumbsUp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './ForumPostDetailPage.css';

function ForumPostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/forum/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/forum/${id}` } });
      return;
    }

    setLiking(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId');
      
      await axios.post(`/api/forum/${id}/like`, {}, {
        headers: {
          'user-id': userId,
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchPost(); // Refresh post data
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/forum/${id}` } });
      return;
    }

    setPostingComment(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId');
      
      await axios.post(`/api/forum/${id}/comment`, {
        content: comment
      }, {
        headers: {
          'user-id': userId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setComment('');
      fetchPost(); // Refresh post data
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/forum/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.content?.substring(0, 100),
          url: url
        });
      } catch (error) {
        // User cancelled or error occurred
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const second = lastName?.charAt(0) || '';
    return (first + second).toUpperCase();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLiked = post?.likes?.some(likeId => 
    likeId?.toString() === (user?.id || localStorage.getItem('userId') || sessionStorage.getItem('userId'))
  );

  if (loading) {
    return (
      <div className="forum-post-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="forum-post-detail-page">
        <div className="container">
          <div className="error-state">
            <p>Post not found</p>
            <Link to="/forum" className="btn btn-primary">Back to Forum</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-post-detail-page">
      <div className="container">
        <Link to="/forum" className="back-link">
          <FaArrowLeft /> Back to Forum
        </Link>

        <article className="post-detail">
          {/* Post Header */}
          <div className="post-header">
            <div className="post-author">
              <div className="author-avatar-large">
                {post.author?.profilePicture ? (
                  <img src={post.author.profilePicture} alt={post.author.firstName} />
                ) : (
                  <span>{getInitials(post.author?.firstName, post.author?.lastName)}</span>
                )}
              </div>
              <div className="author-info">
                <h3 className="author-name">
                  {post.author?.firstName} {post.author?.lastName}
                </h3>
                <span className="post-date">{formatDate(post.createdAt)}</span>
                {post.category && (
                  <span className="category-badge">{post.category}</span>
                )}
              </div>
            </div>
            {(post.isPinned || post.isFeatured) && (
              <div className="post-badges">
                {post.isPinned && <span className="badge pinned">📌 Pinned</span>}
                {post.isFeatured && <span className="badge featured">⭐ Featured</span>}
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="post-body">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-content">
              <p>{post.content}</p>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="post-actions">
            <button
              className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={liking}
            >
              <FaHeart /> <span>{post.likes?.length || 0}</span>
            </button>
            <button className="action-btn comment-btn" disabled>
              <FaComment /> <span>{post.comments?.length || 0}</span>
            </button>
            <button className="action-btn share-btn" onClick={handleShare}>
              <FaShare /> Share
            </button>
            {isAuthenticated && user?.id === post.author?._id && (
              <div className="post-owner-actions">
                <button className="action-btn edit-btn">
                  <FaEdit /> Edit
                </button>
                <button className="action-btn delete-btn">
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Post Stats */}
          <div className="post-stats">
            <span>👁️ {post.views || 0} views</span>
            <span>💬 {post.comments?.length || 0} comments</span>
            <span>❤️ {post.likes?.length || 0} likes</span>
          </div>
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h2>Comments ({post.comments?.length || 0})</h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form className="comment-form" onSubmit={handleComment}>
              <div className="comment-input-group">
                <div className="comment-avatar">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="You" />
                  ) : (
                    <span>{getInitials(user?.firstName, user?.lastName)}</span>
                  )}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows="3"
                  className="comment-textarea"
                />
              </div>
              <div className="comment-form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!comment.trim() || postingComment}
                >
                  {postingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Please <Link to="/login">login</Link> to comment on this post.</p>
            </div>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <div key={comment._id || index} className="comment-item">
                  <div className="comment-avatar">
                    {comment.author?.profilePicture ? (
                      <img src={comment.author.profilePicture} alt={comment.author.firstName} />
                    ) : (
                      <span>{getInitials(comment.author?.firstName, comment.author?.lastName)}</span>
                    )}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt || comment.created_at)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                    <div className="comment-actions">
                      <button className="comment-action-btn">
                        <FaThumbsUp /> Like
                      </button>
                      <button className="comment-action-btn">
                        Reply
                      </button>
                      {isAuthenticated && user?.id === comment.author?._id && (
                        <button className="comment-action-btn delete">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForumPostDetailPage;

