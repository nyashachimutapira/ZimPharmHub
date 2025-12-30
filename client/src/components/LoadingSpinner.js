import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ inline = false, size = 'medium' }) {
  const sizeClass = size === 'small' ? 'spinner-small' : size === 'large' ? 'spinner-large' : '';
  
  return (
    <div className={`spinner-container ${inline ? 'spinner-inline' : ''}`}>
      <div className={`spinner ${sizeClass}`}></div>
      {!inline && <p>Loading...</p>}
    </div>
  );
}

export default LoadingSpinner;
