import React from 'react';
import { motion } from 'framer-motion';
import './GlassCard.css';

function GlassCard({
  children,
  className = '',
  blur = 'blur(10px)',
  background = 'rgba(255, 255, 255, 0.1)',
  border = '1px solid rgba(255, 255, 255, 0.2)',
  hover = true,
  padding = '2rem',
  borderRadius = '16px',
  ...props
}) {
  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: {
      scale: hover ? 1.02 : 1,
      y: hover ? -4 : 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const glowVariants = {
    idle: { opacity: 0 },
    hover: {
      opacity: 0.5,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`glass-card ${className}`}
      style={{
        backdropFilter: blur,
        background,
        border,
        padding,
        borderRadius
      }}
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      {...props}
    >
      {/* Glow effect */}
      <motion.div
        className="glass-card-glow"
        variants={glowVariants}
        initial="idle"
        whileHover="hover"
      />

      {/* Content */}
      <div className="glass-card-content">
        {children}
      </div>
    </motion.div>
  );
}

export default GlassCard;
