import React, { useState } from 'react';

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
        <h2>Contact Directory</h2>
      </div>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search contacts by office name, phone, email, or address..."
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
        />
      </div>
      <div className="grid">
        {filteredContacts.length ? filteredContacts.map((contact, idx) => (
          <div className="item-card" key={idx}>
            <h3>{contact.name}</h3>
            <p><strong>Phone:</strong> {contact.phone}</p>
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Address:</strong> {contact.address}</p>
          </div>
        )) : <p>No matching contacts found.</p>}
      </div>
    </div>
  );
}
