import React from 'react';
import BorderGlow from './BorderGlow';
import { formatDate } from '../utils/helpers';

export default function CampusInfo({ academicEvents }) {
  return (
    <div className="fade-in">
      <BorderGlow className="card">
        <h2>Academic Calendar</h2>
        {academicEvents.length > 0 ? (
          academicEvents.map((event, idx) => (
            <div key={idx} className="event-item">
              <div>
                <p>
                  <strong>{event.title}</strong>
                </p>
                <p className="small-text">
                  {formatDate(event.date)} | {event.type}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No upcoming academic events.</p>
        )}
      </BorderGlow>
    </div>
  );
}
