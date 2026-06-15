import React, { useState } from 'react';

export default function SocialSpeedDial({ isOpen: propIsOpen, setIsOpen: propSetIsOpen }) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen;
  const setIsOpen = propSetIsOpen !== undefined ? propSetIsOpen : setLocalIsOpen;

  const socials = [
    { name: 'Instagram', icon: 'ti ti-brand-instagram', color: '#e1306c', link: 'https://www.instagram.com/ksu_cusat/' },
    { name: 'WhatsApp', icon: 'ti ti-brand-whatsapp', color: '#25d366', link: 'https://whatsapp.com/channel/0029VaAiqPx4yltG70aUFP0X' },
  ];

  return (
    <div className="speed-dial-wrapper">
      <div className={`speed-dial-actions ${isOpen ? 'open' : ''}`}>
        {socials.map((social, idx) => (
          <a
            key={social.name}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="speed-dial-btn"
            style={{ 
              backgroundColor: social.color,
              transitionDelay: `${(socials.length - idx) * 0.05}s`
            }}
            title={social.name}
          >
            <i className={social.icon}></i>
          </a>
        ))}
      </div>
      <button 
        className={`speed-dial-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Social Media"
      >
        {isOpen ? <i className="ti ti-x"></i> : <i className="ti ti-share"></i>}
      </button>
    </div>
  );
}
