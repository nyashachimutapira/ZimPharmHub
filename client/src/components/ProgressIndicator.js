import React from 'react';
import { motion } from 'framer-motion';
import './ProgressIndicator.css';

function ProgressIndicator({
  steps = [],
  currentStep = 0,
  className = '',
  variant = 'horizontal',
  showLabels = true,
  animated = true
}) {
  const progressPercentage = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  if (variant === 'vertical') {
    return (
      <div className={`progress-indicator progress-vertical ${className}`}>
        {steps.map((step, index) => (
          <div key={index} className="progress-step-vertical">
            <motion.div
              className={`progress-step-circle ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
              initial={animated ? { scale: 0 } : {}}
              animate={animated ? { scale: 1 } : {}}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
            >
              {index < currentStep ? (
                <span className="progress-check">✓</span>
              ) : (
                <span className="progress-number">{index + 1}</span>
              )}
            </motion.div>

            {showLabels && (
              <div className="progress-step-content">
                <div className={`progress-step-label ${index <= currentStep ? 'active' : ''}`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className={`progress-step-description ${index <= currentStep ? 'active' : ''}`}>
                    {step.description}
                  </div>
                )}
              </div>
            )}

            {index < steps.length - 1 && (
              <motion.div
                className={`progress-connector-vertical ${index < currentStep ? 'completed' : ''}`}
                initial={animated ? { height: 0 } : {}}
                animate={animated ? { height: index < currentStep ? '100%' : '0%' } : {}}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`progress-indicator progress-horizontal ${className}`}>
      {/* Progress Bar Background */}
      <div className="progress-bar-background">
        <motion.div
          className="progress-bar-fill"
          initial={animated ? { width: 0 } : {}}
          animate={animated ? { width: `${progressPercentage}%` } : {}}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>

      {/* Step Indicators */}
      <div className="progress-steps">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
            initial={animated ? { scale: 0, opacity: 0 } : {}}
            animate={animated ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
          >
            <div className="progress-step-circle">
              {index < currentStep ? (
                <span className="progress-check">✓</span>
              ) : (
                <span className="progress-number">{index + 1}</span>
              )}
            </div>

            {showLabels && (
              <div className="progress-step-label">
                {step.label}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Current Step Info */}
      {steps[currentStep] && (
        <motion.div
          className="progress-current-info"
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="progress-current-title">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="progress-current-description">
            {steps[currentStep].description || steps[currentStep].label}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ProgressIndicator;
