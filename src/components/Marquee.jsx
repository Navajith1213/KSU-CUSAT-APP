import React from 'react';
import './Marquee.css';

export default function Marquee({ announcements, onNavigate }) {
  if (!announcements || announcements.length === 0) return null;

  const handleLinkClick = (e, link) => {
    if (link && link.startsWith('#') && onNavigate) {
      e.preventDefault();
      onNavigate(link.substring(1));
    }
  };

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {/* Render the items multiple times for seamless infinite scrolling */}
        {[...announcements, ...announcements, ...announcements, ...announcements, ...announcements, ...announcements, ...announcements, ...announcements, ...announcements, ...announcements].map((announcement, idx) => {
          const isInternal = announcement.link && announcement.link.startsWith('#');
          return (
            <div key={`${announcement.id}-${idx}`} className="marquee-item">
              <i className="ti ti-bell-ringing"></i>
              {announcement.link ? (
                <a 
                  href={announcement.link} 
                  target={isInternal ? "_self" : "_blank"} 
                  rel="noopener noreferrer"
                  onClick={(e) => isInternal && handleLinkClick(e, announcement.link)}
                  style={{ cursor: 'pointer' }}
                >
                  {announcement.text}
                </a>
              ) : (
                <span>{announcement.text}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
