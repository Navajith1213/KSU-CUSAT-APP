import React from 'react';
import BorderGlow from './BorderGlow';

export default function HelpdeskDirectory({ helpdeskContacts }) {
  const processedContacts = helpdeskContacts || [];

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
    <div className="fade-in">
      <BorderGlow className="card">
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
          <p>No helpdesk contacts found.</p>
        )}
      </BorderGlow>
    </div>
  );
}
