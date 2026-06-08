import React, { useState } from 'react';
import { sanitizeUrl } from '../utils/gitUtils';

export default function ContactList({ contacts }) {
  const [contactSearch, setContactSearch] = useState('');

  const contains = (value, search) => (value || '').toLowerCase().includes(search.toLowerCase());

  const filteredContacts = contacts.filter(item =>
    contains(item.name, contactSearch) ||
    contains(item.phone, contactSearch) ||
    contains(item.email, contactSearch) ||
    contains(item.address, contactSearch)
  );

  return (
    <div className="card">
      <div className="module-header">
        <h2>Campus Contact & Department Directory</h2>
      </div>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by department name, phone, email, or location..."
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
        />
      </div>
      <div className="grid">
        {filteredContacts.length ? filteredContacts.map((contact, idx) => {
          const mapsQuery = encodeURIComponent(`${contact.name} CUSAT Kalamassery Kochi`);
          const mapsUrl = contact.gmapsLink && contact.gmapsLink.trim() !== '' ? sanitizeUrl(contact.gmapsLink) : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

          return (
            <div className="item-card" key={idx}>
              <div>
                <h3>{contact.name}</h3>
                {contact.address && (
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.5' }}>
                    {contact.address}
                  </p>
                )}
                {contact.phone && <p><strong>Office Phone:</strong> {contact.phone}</p>}
                {contact.email && <p><strong>Email Address:</strong> {contact.email}</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="maps-btn" style={{ flex: 1, minWidth: '140px', textAlign: 'center' }}>
                  <i className="ti ti-map-2"></i> View on Maps
                </a>
                
                {contact.website && (
                  <a href={contact.website} target="_blank" rel="noopener noreferrer" className="maps-btn" style={{ flex: 1, minWidth: '140px', textAlign: 'center', background: '#0ea5e9' }}>
                    <i className="ti ti-external-link"></i> Visit Website
                  </a>
                )}

                {contact.name === 'CUCEK' && !contact.website && (
                  <a href="https://cucekuptodate.app/dashboard" target="_blank" rel="noopener noreferrer" className="maps-btn" style={{ flex: 1, minWidth: '140px', textAlign: 'center', background: '#0ea5e9' }}>
                    <i className="ti ti-external-link"></i> CUCEK Website
                  </a>
                )}
              </div>
            </div>
          );
        }) : <p>No matching contacts found.</p>}
      </div>
    </div>
  );
}
