import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Toast.css';

function Toast({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            handleClose();
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);

      const timeout = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for exit animation
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const toastVariants = {
    initial: {
      opacity: 0,
      y: position.includes('top') ? -50 : 50,
      scale: 0.8
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast toast-${type} toast-${position} ${className}`}
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Icon */}
          <div className="toast-icon">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="toast-content">
            <div className="toast-message">{message}</div>
          </div>

          {/* Close button */}
          <button
            className="toast-close"
            onClick={handleClose}
            aria-label="Close notification"
          >
            ×
          </button>

          {/* Progress bar */}
          {duration > 0 && (
            <div className="toast-progress">
              <div
                className="toast-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Glow effect */}
          <div className="toast-glow" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
