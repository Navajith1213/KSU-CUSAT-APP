import React, { useState } from 'react';
import BorderGlow from './BorderGlow';
import { formatDate } from '../utils/helpers';

export default function CampusInfo({ academicEvents, helpdeskContacts }) {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'helpdesk'

  // Process helpdesk contacts
  const processedContacts = helpdeskContacts || [];

  // Group contacts by category
  const unitMembers = processedContacts.filter(c => c.category === 'unit_member');
  const helpdeskTeams = processedContacts.filter(c => c.category === 'helpdesk_team');
  const convenors = processedContacts.filter(c => c.category === 'convenor');

  const renderContactCard = (contact) => (
    <div key={contact.id} className="item-card" style={{ marginBottom: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{contact.name}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', flex: 1 }}>{contact.role_or_dept}</p>
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className="submit-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', fontSize: '14px', textDecoration: 'none' }}>
          <i className="ti ti-phone" style={{ marginRight: '8px' }}></i>
          {contact.phone}
        </a>
      )}
    </div>
  );

  return (
    <BorderGlow className="card">
      <div className="admin-tabs" style={{ marginBottom: '24px' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} 
          onClick={() => setActiveTab('calendar')}
        >
          Academic Calendar
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'helpdesk' ? 'active' : ''}`} 
          onClick={() => setActiveTab('helpdesk')}
        >
          Helpdesk Directory
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="fade-in">
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
        </div>
      )}

      {activeTab === 'helpdesk' && (
        <div className="fade-in">
          <h2>Helpdesk Directory</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
            Reach out to our dedicated KSU representatives and department helpdesk teams for assistance.
          </p>

          {unitMembers.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '16px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
                KSU Unit Members
              </h3>
              <div className="grid">
                {unitMembers.map(renderContactCard)}
              </div>
            </div>
          )}

          {helpdeskTeams.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '16px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
                Department Helpdesk Teams
              </h3>
              <div className="grid">
                {helpdeskTeams.map(renderContactCard)}
              </div>
            </div>
          )}

          {convenors.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '16px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
                Department Convenors
              </h3>
              <div className="grid">
                {convenors.map(renderContactCard)}
              </div>
            </div>
          )}

          {processedContacts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
              <i className="ti ti-address-book" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
              <p>Contact directories are currently being updated.</p>
            </div>
          )}
        </div>
      )}
    </BorderGlow>
  );
}
