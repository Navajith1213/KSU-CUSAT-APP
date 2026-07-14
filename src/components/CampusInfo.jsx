import React, { useState } from 'react';
import BorderGlow from './BorderGlow';
import { formatDate } from '../utils/helpers';

export default function CampusInfo({ academicEvents }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc'); // 'date-asc', 'date-desc', 'title-asc'

  const categories = [
    { id: 'all', label: 'All', icon: 'ti-calendar' },
    { id: 'academic', label: 'Academic', icon: 'ti-book' },
    { id: 'exam', label: 'Exams', icon: 'ti-school' },
    { id: 'holiday', label: 'Holidays', icon: 'ti-beach' },
    { id: 'arts', label: 'Arts', icon: 'ti-palette' },
    { id: 'sports', label: 'Sports', icon: 'ti-trophy' }
  ];

  const filteredEvents = selectedFilter === 'all'
    ? academicEvents
    : academicEvents.filter(event => (event.type || 'academic').toLowerCase() === selectedFilter);

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed months
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr); // Fallback
  };

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return parseDate(a.date).getTime() - parseDate(b.date).getTime();
    } else if (sortBy === 'date-desc') {
      return parseDate(b.date).getTime() - parseDate(a.date).getTime();
    } else if (sortBy === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  const getCategoryColor = (type) => {
    const t = (type || 'academic').toLowerCase();
    switch (t) {
      case 'academic': return '#3b82f6'; // Blue
      case 'exam': return '#ef4444'; // Red
      case 'holiday': return '#10b981'; // Green
      case 'arts': return '#a855f7'; // Purple
      case 'sports': return '#f59e0b'; // Amber
      default: return '#64748b'; // Slate
    }
  };

  const getCategoryIcon = (type) => {
    const t = (type || 'academic').toLowerCase();
    switch (t) {
      case 'academic': return 'ti-book';
      case 'exam': return 'ti-school';
      case 'holiday': return 'ti-beach';
      case 'arts': return 'ti-palette';
      case 'sports': return 'ti-trophy';
      default: return 'ti-calendar-event';
    }
  };

  const formatType = (type) => {
    const t = (type || 'academic').toLowerCase();
    if (t === 'arts') return 'Arts';
    if (t === 'sports') return 'Sports';
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  return (
    <div className="fade-in">
      <BorderGlow className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="ti ti-calendar-event" style={{ color: '#0284c7' }}></i>
              Academic & Event Calendar
            </h2>
            
            {/* Filter and Sort Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Filter Pill Tab Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedFilter(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: selectedFilter === cat.id ? '#0284c7' : 'var(--border-color)',
                      background: selectedFilter === cat.id ? '#0284c7' : 'transparent',
                      color: selectedFilter === cat.id ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  >
                    <i className={`ti ${cat.icon}`}></i>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sort Order Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary, #f8fafc)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="date-asc">Date (Upcoming First)</option>
                  <option value="date-desc">Date (Latest First)</option>
                  <option value="title-asc">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {sortedEvents.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {sortedEvents.map((event, idx) => (
                <div 
                  key={idx} 
                  className="event-item" 
                  style={{ 
                    borderLeft: `4px solid ${getCategoryColor(event.type)}`, 
                    marginBottom: 0,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: `${getCategoryColor(event.type)}12`,
                      color: getCategoryColor(event.type)
                    }}>
                      <i className={`ti ${getCategoryIcon(event.type)}`} style={{ fontSize: '20px' }}></i>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {event.title}
                      </p>
                      <p className="small-text" style={{ margin: 0, color: 'var(--text-muted)' }}>
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    background: `${getCategoryColor(event.type)}12`, 
                    color: getCategoryColor(event.type) 
                  }}>
                    {formatType(event.type)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              <i className="ti ti-calendar-off" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '8px', display: 'block' }}></i>
              <p style={{ margin: 0 }}>No upcoming events found for this category.</p>
            </div>
          )}
        </div>
      </BorderGlow>
    </div>
  );
}
