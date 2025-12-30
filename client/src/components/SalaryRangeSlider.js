import React, { useState, useEffect } from 'react';
import './SalaryRangeSlider.css';

function SalaryRangeSlider({ onSalaryChange, initialMin = 0, initialMax = 100000 }) {
  const [minSalary, setMinSalary] = useState(initialMin);
  const [maxSalary, setMaxSalary] = useState(initialMax);
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 100000 });
  const [loading, setLoading] = useState(true);

  // Fetch salary range from backend
  useEffect(() => {
    const fetchSalaryRange = async () => {
      try {
        const response = await fetch('/api/advancedSearch/filters/options');
        const data = await response.json();
        if (data.success && data.salaryRange) {
          setSalaryRange({
            min: data.salaryRange.min || 0,
            max: data.salaryRange.max || 100000,
          });
          setMinSalary(initialMin || data.salaryRange.min || 0);
          setMaxSalary(initialMax || data.salaryRange.max || 100000);
        }
      } catch (error) {
        console.error('Error fetching salary range:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryRange();
  }, [initialMin, initialMax]);

  // Notify parent of salary changes
  useEffect(() => {
    onSalaryChange({ min: minSalary, max: maxSalary });
  }, [minSalary, maxSalary, onSalaryChange]);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value);
    if (value <= maxSalary) {
      setMinSalary(value);
    }
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= minSalary) {
      setMaxSalary(value);
    }
  };

  const handleMinInputChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value <= maxSalary && value >= salaryRange.min) {
      setMinSalary(value);
    }
  };

  const handleMaxInputChange = (e) => {
    const value = parseInt(e.target.value) || salaryRange.max;
    if (value >= minSalary && value <= salaryRange.max) {
      setMaxSalary(value);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSliderBackground = () => {
    const minPercent = ((minSalary - salaryRange.min) / (salaryRange.max - salaryRange.min)) * 100;
    const maxPercent = ((maxSalary - salaryRange.min) / (salaryRange.max - salaryRange.min)) * 100;
    return `linear-gradient(to right, #ccc ${minPercent}%, #3498db ${minPercent}%, #3498db ${maxPercent}%, #ccc ${maxPercent}%)`;
  };

  if (loading) {
    return <div className="salary-range-slider loading">Loading salary range...</div>;
  }

  return (
    <div className="salary-range-slider">
      <div className="salary-header">
        <h4>Salary Range</h4>
        <div className="salary-display">
          {formatCurrency(minSalary)} - {formatCurrency(maxSalary)}
        </div>
      </div>

      <div className="slider-container">
        <input
          type="range"
          min={salaryRange.min}
          max={salaryRange.max}
          value={minSalary}
          onChange={handleMinChange}
          className="slider-input min-slider"
        />
        <input
          type="range"
          min={salaryRange.min}
          max={salaryRange.max}
          value={maxSalary}
          onChange={handleMaxChange}
          className="slider-input max-slider"
        />
        <div className="slider-track" style={{ background: getSliderBackground() }} />
      </div>

      <div className="salary-inputs">
        <div className="input-group">
          <label>Minimum</label>
          <input
            type="number"
            value={minSalary}
            onChange={handleMinInputChange}
            min={salaryRange.min}
            max={maxSalary}
            className="salary-input"
            placeholder="Min"
          />
        </div>
        <div className="input-separator">to</div>
        <div className="input-group">
          <label>Maximum</label>
          <input
            type="number"
            value={maxSalary}
            onChange={handleMaxInputChange}
            min={minSalary}
            max={salaryRange.max}
            className="salary-input"
            placeholder="Max"
          />
        </div>
      </div>

      <div className="salary-info">
        <small>Min: {formatCurrency(salaryRange.min)} | Max: {formatCurrency(salaryRange.max)}</small>
      </div>
    </div>
  );
}

export default SalaryRangeSlider;
