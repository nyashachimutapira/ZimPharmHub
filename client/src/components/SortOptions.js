import React, { useState } from 'react';
import { FaSort } from 'react-icons/fa';
import './SortOptions.css';

function SortOptions({ onSortChange, currentSort = 'relevance', currentOrder = 'desc' }) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'date', label: 'Newest First' },
    { value: 'salary', label: 'Highest Salary' },
  ];

  const handleSort = (sortBy) => {
    onSortChange({ sortBy, sortOrder: currentOrder });
    setIsOpen(false);
  };

  const handleOrderChange = () => {
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    onSortChange({ sortBy: currentSort, sortOrder: newOrder });
  };

  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Most Relevant';
  const orderLabel = currentOrder === 'asc' ? 'Ascending' : 'Descending';

  return (
    <div className="sort-options">
      <div className="sort-container">
        <button
          className="sort-button"
          onClick={() => setIsOpen(!isOpen)}
          title={`Sorted by ${currentLabel}`}
        >
          <FaSort className="sort-icon" />
          <span>Sort: {currentLabel}</span>
        </button>

        {isOpen && (
          <div className="sort-dropdown">
            {sortOptions.map(option => (
              <button
                key={option.value}
                className={`sort-option ${currentSort === option.value ? 'active' : ''}`}
                onClick={() => handleSort(option.value)}
              >
                <span className="option-label">{option.label}</span>
                {currentSort === option.value && (
                  <span className="checkmark">✓</span>
                )}
              </button>
            ))}
            <div className="sort-divider" />
            <button
              className="sort-order-btn"
              onClick={handleOrderChange}
              title={`Change to ${orderLabel}`}
            >
              <span>Order: {orderLabel}</span>
              <span className="order-icon">{currentOrder === 'asc' ? '↑' : '↓'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default SortOptions;
