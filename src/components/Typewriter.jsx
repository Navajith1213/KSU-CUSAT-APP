import React, { useState, useEffect } from 'react';

export default function Typewriter({ text, speed = 50, cursor = '|' }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const typingInterval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span>
      {displayedText}
      <span style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}>{cursor}</span>
    </span>
  );
}
