import React, { useState } from 'react';
import { sanitizeUrl } from '../utils/helpers';
import BorderGlow from './BorderGlow';

export default function ContactList({ contacts }) {
  const [contactSearch, setContactSearch] = useState('');

  const contains = (value, search) => (value || '').toLowerCase().includes(search.toLowerCase());

  const filteredContacts = contacts.filter(item =>
    contains(item.name, contactSearch) ||
    contains(item.section || 'Main Campus', contactSearch)
  );

  // Group contacts by section
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const section = contact.section || 'Main Campus';
    if (!acc[section]) acc[section] = [];
    acc[section].push(contact);
    return acc;
  }, {});

  return (
    <BorderGlow className="card">
      <div className="module-header">
        <h2>Campus Departments Directory</h2>
      </div>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by department name or campus section..."
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

                const isElectrical = contact.name.toLowerCase().includes('electrical');
                const content = (
                  <div className="item-card" style={{ height: '100%', boxSizing: 'border-box' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>{contact.name}</h4>
                      {contact.address && (
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.5' }}>
                          {contact.address}
                        </p>
                      )}
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

                return (
                  <div key={idx} style={{ height: '100%' }}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <p>No matching departments found.</p>
      )}
    </BorderGlow>
  );
}
