import React from 'react';
import './Marquee.css';

export default function Marquee({ announcements }) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {/* Render the items multiple times for seamless infinite scrolling */}
        {[...announcements, ...announcements, ...announcements].map((announcement, idx) => (
          <div key={`${announcement.id}-${idx}`} className="marquee-item">
            <i className="ti ti-bell-ringing"></i>
            {announcement.link ? (
              <a href={announcement.link} target="_blank" rel="noopener noreferrer">
                {announcement.text}
              </a>
            ) : (
              <span>{announcement.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
