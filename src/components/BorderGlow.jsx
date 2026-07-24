import React from 'react';
import './BorderGlow.css';

const BorderGlow = ({
  children,
  className = '',
  backgroundColor = 'var(--bg-main)',
  borderRadius = 28,
  glowRadius = 40,
  style = {}
}) => {
  return (
    <div
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        ...style
      }}
    >
      <div className="border-glow-inner">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
