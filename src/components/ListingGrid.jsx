import React from 'react';
import { sanitizeUrl } from '../utils/helpers';

const FIELD_LABELS = {
  location: 'Location',
  fees: 'Fees',
  food: 'Food / Mess',
  contact: 'Contact Info',
  wardenContact: "Warden's Number",
  secretaryContact: 'Mess/Hostel Secretaries Number',
  type: 'Hostel Type',
  rooms: 'Room Type',
  rent: 'Rent',
  specialty: 'Specialty',
  description: 'Description',
  timing: 'Timing',
  cuisine: 'Cuisine',
  priceRange: 'Price Range',
  details: 'Details',
  services: 'Services Provided',
  facilities: 'Facilities / Amenities'
};

export default function ListingGrid({ items, fields, requireGmapsForNavigation = false }) {
  return (
    <div className="grid">
      {items.length ? items.map((item, idx) => {
        const mapsQuery = encodeURIComponent(`${item.name || item.title} ${item.location || ''} CUSAT Kalamassery Kochi`);
        const hasGmaps = item.gmapsLink && item.gmapsLink.trim() !== '';
        const mapsUrl = hasGmaps ? sanitizeUrl(item.gmapsLink) : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
        
        const shouldShowNavigate = item.location && (!requireGmapsForNavigation || hasGmaps);
        
        const hasRates = item.rates && Array.isArray(item.rates) && item.rates.length > 0;

        return (
          <div className="item-card" key={idx}>
            <div>
              <h3>{item.name || item.title}</h3>
              <div className="card-details">
              {fields.map((field, i) => {
                // Skip rooms field if we already have structured rates
                if (field === 'rooms' && hasRates) {
                  return null;
                }

                // Render rates list under 'rent' field if structured rates exist
                if (field === 'rent' && hasRates) {
                  return (
                    <div key={i} style={{ margin: '12px 0 16px 0', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', backgroundColor: 'var(--bg-main)' }}>
                      <strong style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        <i className="ti ti-cash" style={{ color: '#0284c7' }}></i> Room Rates
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {item.rates.map((rate, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px', borderBottom: rIdx < item.rates.length - 1 ? '1px dashed #e2e8f0' : 'none', paddingBottom: rIdx < item.rates.length - 1 ? '6px' : '0' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{rate.type}</span>
                            <span style={{ fontWeight: '700', color: '#0284c7' }}>{rate.rent}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                let displayVal = field === 'description' ? (item.description || item.specialty) : item[field];
                if (field === 'type') {
                  displayVal = displayVal === 'Mens' ? "Men's Hostel" : (displayVal === 'Ladies' ? "Ladies' Hostel" : displayVal);
                }
                return displayVal ? (
                  <p key={i}><strong>{FIELD_LABELS[field] || (field.charAt(0).toUpperCase() + field.slice(1))}:</strong> {displayVal}</p>
                ) : null;
              })}
              </div>
            </div>
            {shouldShowNavigate && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="maps-btn slide-in-btn">
                <i className="ti ti-map-2"></i> <span className="btn-text">Navigate on Maps</span>
              </a>
            )}
          </div>
        );
      }) : <p>No matching results found.</p>}
    </div>
  );
}
