import React, { useState, useEffect } from 'react';

export default function ScrollToTop({ isSpeedDialOpen }) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = window.scrollY / totalHeight;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
      
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Run initial scroll check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // SVG parameters
  const size = 48;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <button
      className={`scroll-to-top ${isVisible ? 'visible' : ''} ${isSpeedDialOpen ? 'speed-dial-open' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg
        height={size}
        width={size}
        className="scroll-progress-svg"
      >
        <circle
          className="scroll-progress-bg"
          stroke="var(--border-color, rgba(255, 255, 255, 0.1))"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          className="scroll-progress-bar"
          stroke="url(#scroll-gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={radius}
          cx={center}
          cy={center}
        />
        <defs>
          <linearGradient id="scroll-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="scroll-to-top-icon">
        <i className="ti ti-chevron-up"></i>
      </div>
    </button>
  );
}
