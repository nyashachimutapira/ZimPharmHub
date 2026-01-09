import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Button.css';

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  onClick,
  disabled = false,
  loading = false,
  icon,
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: disabled ? 1 : 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: disabled ? 1 : 0.98,
      transition: { duration: 0.1 }
    }
  };

  const glowVariants = {
    idle: { opacity: 0, scale: 1 },
    hover: {
      opacity: 0.3,
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.button
      className={`btn btn-${variant} btn-${size} ${className} ${disabled ? 'btn-disabled' : ''} ${loading ? 'btn-loading' : ''}`}
      onClick={handleClick}
      disabled={disabled || loading}
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {/* Glow effect */}
      <motion.div
        className="btn-glow"
        variants={glowVariants}
        initial="idle"
        whileHover="hover"
      />

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="btn-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}

      {/* Content */}
      <span className="btn-content">
        {loading && <div className="btn-spinner" />}
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
}

export default Button;
