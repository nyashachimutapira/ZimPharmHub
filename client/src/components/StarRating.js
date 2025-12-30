import React from 'react';
import { FaStar } from 'react-icons/fa';
import './StarRating.css';

function StarRating({ rating = 0, onRate, readOnly = false }) {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
          onClick={() => !readOnly && onRate && onRate(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          disabled={readOnly}
        >
          <FaStar />
        </button>
      ))}
      {!readOnly && <span className="rating-text">{hoverRating || rating}/5</span>}
    </div>
  );
}

export default StarRating;
