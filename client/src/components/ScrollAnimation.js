import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function ScrollAnimation({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = '',
  once = true,
  ...props
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: once
  });

  const animations = {
    fadeUp: {
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    fadeDown: {
      hidden: { opacity: 0, y: -50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    fadeLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    fadeRight: {
      hidden: { opacity: 0, x: -50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: { duration, delay, ease: 'easeOut' }
      }
    },
    slideUp: {
      hidden: { y: 100, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    },
    bounce: {
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.68, -0.55, 0.265, 1.55]
        }
      }
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [controls, inView, once]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={animations[animation]}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default ScrollAnimation;
