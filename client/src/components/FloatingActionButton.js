import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FloatingActionButton.css';

function FloatingActionButton({
  icon,
  onClick,
  className = '',
  position = 'bottom-right',
  size = 'medium',
  variant = 'primary',
  tooltip = '',
  actions = [],
  animated = true
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    }
  };

  const fabVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  const actionVariants = {
    closed: { scale: 0, opacity: 0, y: 20 },
    open: (index) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    })
  };

  const containerVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 }
  };

  return (
    <div className={`fab-container fab-${position}`}>
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && actions.map((action, index) => (
          <motion.button
            key={action.id || index}
            className={`fab-action fab-${size} fab-${variant}`}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            variants={actionVariants}
            initial="closed"
            animate="open"
            exit="closed"
            custom={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {action.icon}
            {action.label && (
              <span className="fab-action-label">{action.label}</span>
            )}
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className={`fab-main fab-${size} fab-${variant} ${className} ${animated ? 'fab-animated' : ''}`}
        onClick={handleClick}
        variants={fabVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        animate={isOpen ? "open" : "idle"}
      >
        <motion.div variants={containerVariants}>
          {icon}
        </motion.div>

        {/* Ripple effect */}
        <div className="fab-ripple" />

        {/* Pulse effect for primary action */}
        {animated && actions.length === 0 && (
          <div className="fab-pulse" />
        )}
      </motion.button>

      {/* Tooltip */}
      {tooltip && (
        <div className="fab-tooltip">
          {tooltip}
        </div>
      )}
    </div>
  );
}

export default FloatingActionButton;
