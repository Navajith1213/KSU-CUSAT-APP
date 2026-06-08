import React, { useState } from 'react';

export default function SocialSpeedDial() {
  const [isOpen, setIsOpen] = useState(false);

  const socials = [
    { name: 'Instagram', icon: 'ti ti-brand-instagram', color: '#e1306c', link: '#' },
    { name: 'Facebook', icon: 'ti ti-brand-facebook', color: '#1877f2', link: '#' },
    { name: 'X / Twitter', icon: 'ti ti-brand-x', color: '#000000', link: '#' },
    { name: 'WhatsApp', icon: 'ti ti-brand-whatsapp', color: '#25d366', link: '#' },
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
