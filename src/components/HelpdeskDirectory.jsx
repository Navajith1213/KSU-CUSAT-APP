import React, { useState } from 'react';
import BorderGlow from './BorderGlow';

export default function HelpdeskDirectory({ helpdeskContacts }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const processedContacts = helpdeskContacts || [];

  const unitMembers = processedContacts.filter(c => c.category === 'unit_member');

  const containsQuery = (text, query) => (text || '').toLowerCase().includes(query.toLowerCase());

  // Filter unit members by name or role
  const filteredUnitMembers = unitMembers.filter(c =>
    containsQuery(c.name, searchQuery) || containsQuery(c.role_or_dept, searchQuery)
  );

  // Group helpdesk teams and convenors by department
  const departmentGroups = {};
  processedContacts.forEach(c => {
    if (c.category === 'helpdesk_team' || c.category === 'convenor') {
      const dept = c.role_or_dept || 'Other / General';
      if (!departmentGroups[dept]) {
        departmentGroups[dept] = [];
      }
      departmentGroups[dept].push(c);
    }
  });

  // Filter and sort departments
  const sortedDepartments = Object.keys(departmentGroups)
    .sort((a, b) => a.localeCompare(b))
    .map(deptName => {
      const contactsInDept = departmentGroups[deptName];
      const deptMatches = containsQuery(deptName, searchQuery);
      const filteredContacts = contactsInDept.filter(c =>
        deptMatches || containsQuery(c.name, searchQuery)
      );

      return {
        name: deptName,
        contacts: filteredContacts
      };
    })
    .filter(dept => dept.contacts.length > 0);

  const renderContactCard = (contact) => {
    let subtitle = contact.role_or_dept;
    if (contact.category === 'convenor') {
      subtitle = 'Department Convenor';
    } else if (contact.category === 'helpdesk_team') {
      subtitle = 'Helpdesk Team';
    }

    return (
      <div key={contact.id} className="item-card" style={{ marginBottom: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{contact.name}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', flex: 1 }}>{subtitle}</p>
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="submit-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', fontSize: '14px', textDecoration: 'none' }}>
            <i className="ti ti-phone" style={{ marginRight: '8px' }}></i>
            {contact.phone}
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <BorderGlow className="card">
        <h2>Helpdesk Directory</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
          Reach out to our dedicated KSU representatives and department helpdesk teams for assistance.
        </p>

        {/* Search Bar */}
        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search by department name or person's name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* KSU Unit Members Section */}
        {filteredUnitMembers.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '16px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
              KSU Unit Members
            </h3>
            <div className="grid">
              {filteredUnitMembers.map(renderContactCard)}
            </div>
          </div>
        )}

        {/* Department-wise Sections */}
        {sortedDepartments.length > 0 && (
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
              Departments Helpdesk & Convenors
            </h3>
            
            {sortedDepartments.map(dept => (
              <div key={dept.name} style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {dept.name}
                </h4>
                <div className="grid">
                  {dept.contacts.map(renderContactCard)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredUnitMembers.length === 0 && sortedDepartments.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
            No matching helpdesk contacts or departments found.
          </p>
        )}
      </BorderGlow>
    </div>
  );
}
