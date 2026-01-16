import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaThumbsUp, FaThumbsDown, FaTrash, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ScrollAnimation from '../components/ScrollAnimation';
import './PharmacyReviewsPage.css';

function PharmacyReviewsPage() {
  const { pharmacyId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPharmacy();
    fetchReviews();
    fetchStats();
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, [pharmacyId, sortBy]);

  const fetchPharmacy = async () => {
    try {
      const response = await axios.get(`/api/pharmacies/${pharmacyId}`);
      setPharmacy(response.data);
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/pharmacy/${pharmacyId}?sortBy=${sortBy}`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/reviews/stats/${pharmacyId}`);
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/reviews', {
        pharmacyId,
        rating,
        title,
        comment,
      });

      alert('Review submitted for moderation');
      setTitle('');
      setComment('');
      setRating(5);
      fetchReviews();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId, helpful) => {
    try {
      await axios.patch(`/api/reviews/${reviewId}/helpful`, { helpful });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Delete this review?')) {
      try {
        await axios.delete(`/api/reviews/${reviewId}`);
        fetchReviews();
        fetchStats();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const getRatingPercentage = (rating) => {
    return (stats.ratingDistribution?.[rating] || 0 / stats.totalReviews || 1) * 100;
  };

  return (
    <div className="pharmacy-reviews-page">
      {/* Hero Section */}
      <section className="reviews-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {pharmacy?.name} Reviews
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Help others make informed decisions
          </motion.p>
        </div>
      </section>

      <div className="container">
        <div className="reviews-grid">
          {/* Review Stats */}
          <section className="review-stats">
            <ScrollAnimation animation="fadeUp">
              <div className="stats-card">
                <h3>Overall Rating</h3>
                <div className="rating-display">
                  <div className="big-rating">
                    <div className="stars-large">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < Math.round(stats.averageRating || 0) ? 'filled' : ''}
                        />
                      ))}
                    </div>
                    <p className="rating-number">{(stats.averageRating || 0).toFixed(1)}/5.0</p>
                    <p className="review-count">Based on {stats.totalReviews || 0} reviews</p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="rating-distribution">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="distribution-row">
                      <span className="star-label">
                        {star}
                        <FaStar className="inline-star" />
                      </span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${getRatingPercentage(star)}%`
                          }}
                        ></div>
                      </div>
                      <span className="count">{stats.ratingDistribution?.[star] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          </section>

          {/* Reviews List & Submission */}
          <section className="reviews-main">
            {/* Submit Review Form */}
            {user && (
              <ScrollAnimation animation="fadeUp">
                <div className="review-form-card">
                  <h3>Share Your Experience</h3>
                  <form onSubmit={handleSubmitReview} className="review-form">
                    <div className="form-group">
                      <label>Rating</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map(star => (
                          <FaStar
                            key={star}
                            className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="title">Title *</label>
                      <input
                        id="title"
                        type="text"
                        placeholder="Summarize your experience"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="comment">Your Review</label>
                      <textarea
                        id="comment"
                        placeholder="Share details about your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={5}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !title}
                      className="btn-submit"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </ScrollAnimation>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
              <div className="reviews-header">
                <h3>Customer Reviews</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="helpfulCount">Most Helpful</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {loading ? (
                <div className="loading">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review this pharmacy!</p>
                </div>
              ) : (
                reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    className="review-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.User?.firstName?.charAt(0)}
                        </div>
                        <div className="reviewer-meta">
                          <p className="reviewer-name">
                            {review.User?.firstName} {review.User?.lastName}
                            {review.verifiedPurchase && (
                              <span className="verified-badge">✓ Verified Purchase</span>
                            )}
                            {review.isPharmacist && (
                              <span className="pharmacist-badge">💊 Pharmacist</span>
                            )}
                          </p>
                          <p className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {user?.id === review.userId && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteReview(review.id)}
                          title="Delete review"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="review-content">
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? 'filled' : ''}
                          />
                        ))}
                      </div>
                      <h4>{review.title}</h4>
                      {review.comment && <p>{review.comment}</p>}
                    </div>

                    <div className="review-footer">
                      <button
                        className="helpful-btn helpful"
                        onClick={() => handleHelpful(review.id, true)}
                      >
                        <FaThumbsUp /> Helpful ({review.helpfulCount})
                      </button>
                      <button
                        className="helpful-btn unhelpful"
                        onClick={() => handleHelpful(review.id, false)}
                      >
                        <FaThumbsDown /> Not Helpful ({review.unhelpfulCount})
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PharmacyReviewsPage;
