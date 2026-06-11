import React, { useState } from 'react';
import { sanitizeUrl } from '../utils/helpers';

export default function ContactList({ contacts }) {
  const [contactSearch, setContactSearch] = useState('');

  const contains = (value, search) => (value || '').toLowerCase().includes(search.toLowerCase());

  const filteredContacts = contacts.filter(item =>
    contains(item.name, contactSearch) ||
    contains(item.phone, contactSearch) ||
    contains(item.email, contactSearch) ||
    contains(item.address, contactSearch)
  );

  // Group contacts by section
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const section = contact.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(contact);
    return acc;
  }, {});

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

      {Object.keys(groupedContacts).length > 0 ? (
        Object.entries(groupedContacts).map(([sectionName, sectionContacts]) => (
          <div key={sectionName} style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--primary-color)',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '8px',
              marginBottom: '16px',
              marginTop: '16px'
            }}>
              {sectionName}
            </h3>
            <div className="grid">
              {sectionContacts.map((contact, idx) => {
                const mapsQuery = encodeURIComponent(`${contact.name} CUSAT Kalamassery Kochi`);
                const mapsUrl = contact.gmapsLink && contact.gmapsLink.trim() !== '' ? sanitizeUrl(contact.gmapsLink) : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

                return (
                  <div className="item-card" key={idx}>
                    <div>
                      <h4 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>{contact.name}</h4>
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
              })}
            </div>
          </div>
        ))
      ) : (
        <p>No matching contacts found.</p>
      )}
    </div>
  );
}
