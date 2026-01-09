import React from 'react';
import './SkeletonLoader.css';

function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`skeleton-card ${className}`}>
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text skeleton-text-short"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className={`skeleton-list ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="skeleton-list-item">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-list-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className={`skeleton-table ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="skeleton-table-row">
                <div className="skeleton-table-cell"></div>
                <div className="skeleton-table-cell"></div>
                <div className="skeleton-table-cell"></div>
                <div className="skeleton-table-cell skeleton-table-cell-short"></div>
              </div>
            ))}
          </div>
        );
      case 'text':
        return (
          <div className={`skeleton-text-block ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className={`skeleton-text ${index === count - 1 ? 'skeleton-text-short' : ''}`}></div>
            ))}
          </div>
        );
      default:
        return <div className={`skeleton-default ${className}`}></div>;
    }
  };

  return renderSkeleton();
}

export default SkeletonLoader;
