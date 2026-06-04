import React from 'react';
import { sanitizeUrl } from '../utils/gitUtils';

const FIELD_LABELS = {
  location: 'Location',
  fees: 'Fees',
  food: 'Food / Mess',
  contact: 'Contact Info',
  rooms: 'Room Type',
  rent: 'Rent',
  specialty: 'Specialty',
  timing: 'Timing',
  cuisine: 'Cuisine',
  details: 'Details',
  services: 'Services Provided'
};

export default function ListingGrid({ items, fields }) {
  return (
    <div className="grid">
      {items.length ? items.map((item, idx) => {
        const mapsQuery = encodeURIComponent(`${item.name || item.title} ${item.location || ''} CUSAT Kalamassery Kochi`);
        const mapsUrl = item.gmapsLink && item.gmapsLink.trim() !== '' ? sanitizeUrl(item.gmapsLink) : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
        return (
          <div className="item-card" key={idx}>
            <div>
              <h3>{item.name || item.title}</h3>
              {fields.map((field, i) => item[field] ? (
                <p key={i}><strong>{FIELD_LABELS[field] || (field.charAt(0).toUpperCase() + field.slice(1))}:</strong> {item[field]}</p>
              ) : null)}
            </div>
            {item.location && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="maps-btn">
                <i className="ti ti-map-2"></i> Navigate on Maps
              </a>
            )}
          </div>
        );
      }) : <p>No matching results found.</p>}
    </div>
  );
}
