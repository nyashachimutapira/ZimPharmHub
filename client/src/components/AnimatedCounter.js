import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

function AnimatedCounter({
  end,
  start = 0,
  duration = 2,
  suffix = '',
  prefix = '',
  className = '',
  delay = 0,
  decimals = 0
}) {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  const counterVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`animated-counter ${className}`}
      variants={counterVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {prefix && <span className="counter-prefix">{prefix}</span>}
      {inView ? (
        <CountUp
          start={start}
          end={end}
          duration={duration}
          decimals={decimals}
          suffix={suffix}
          useEasing={true}
          useGrouping={true}
          separator=","
        />
      ) : (
        <span>{start.toLocaleString()}{suffix}</span>
      )}
    </motion.div>
  );
}

export default AnimatedCounter;
