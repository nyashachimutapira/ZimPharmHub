import React, { useState, useEffect } from 'react';
import './Typewriter.css';

function Typewriter({
  texts = [],
  typeSpeed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = '',
  cursor = true
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    const currentFullText = texts[currentTextIndex];

    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (!isDeleting) {
        // Typing
        if (currentText.length < currentFullText.length) {
          setCurrentText(currentFullText.slice(0, currentText.length + 1));
        } else {
          // Finished typing, pause before deleting
          setTimeout(() => setIsPaused(true), pauseTime);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, typeSpeed, deleteSpeed, pauseTime]);

  return (
    <span className={`typewriter ${className}`}>
      {currentText}
      {cursor && <span className="typewriter-cursor">|</span>}
    </span>
  );
}

export default Typewriter;
