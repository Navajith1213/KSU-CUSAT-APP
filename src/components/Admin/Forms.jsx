import React from 'react';

export function HelpdeskForm({ value, onChange, onSubmit, onCancel, isEdit, contacts = [] }) {
  // Sort department list alphabetically
  const departments = [...contacts]
    .map(c => c.name)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Helpdesk Contact' : 'Add Helpdesk Contact'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Category *</label>
          <select value={value.category || 'unit_member'} onChange={(e) => onChange({ ...value, category: e.target.value })}>
            <option value="unit_member">KSU Unit Member</option>
            <option value="helpdesk_team">Department Helpdesk Team</option>
            <option value="convenor">Department Convenor</option>
          </select>
        </div>
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name || ''} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="John Doe or Helpdesk Team A" />
        </div>
        
        {value.category === 'unit_member' ? (
          <div className="form-group">
            <label>Role *</label>
            <input 
              value={value.role_or_dept || ''} 
              onChange={(e) => onChange({ ...value, role_or_dept: e.target.value })} 
              placeholder="Unit President or Vice President" 
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Department *</label>
            <select 
              value={value.role_or_dept || ''} 
              onChange={(e) => onChange({ ...value, role_or_dept: e.target.value })}
            >
              <option value="" disabled>Select Department</option>
              {departments.map((deptName, idx) => (
                <option key={idx} value={deptName}>{deptName}</option>
              ))}
              <option value="Other">Other / Not Listed</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Phone Number *</label>
          <input value={value.phone || ''} onChange={(e) => onChange({ ...value, phone: e.target.value })} placeholder="+91 9876543210" />
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Contact' : 'Add Contact'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function CalendarForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Academic Event' : 'Add Academic Event'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Event Title *</label>
          <input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Date (dd/mm/yyyy) *</label>
          <input 
            type="text" 
            value={value.date || ''} 
            onChange={(e) => onChange({ ...value, date: e.target.value })} 
            placeholder="e.g. 15/08/2026"
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value })}>
            <option value="academic">Academic</option>
            <option value="exam">Exam</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Event' : 'Add Event'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function ContactForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Department Contact' : 'Add Department Contact'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Campus Section / Category *</label>
          <select 
            value={value.section || 'Main Campus'} 
            onChange={(e) => onChange({ ...value, section: e.target.value })} 
          >
            <option value="Main Campus">Main Campus</option>
            <option value="SOE">SOE</option>
            <option value="Lakeside">Lakeside</option>
            <option value="CUCEK">CUCEK</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Department / Office Name *</label>
          <input 
            value={value.name || ''} 
            onChange={(e) => onChange({ ...value, name: e.target.value })} 
            placeholder="e.g. Department of Computer Science"
          />
        </div>
        <div className="form-group">
          <label>Department Office Number *</label>
          <input 
            value={value.phone || ''} 
            onChange={(e) => onChange({ ...value, phone: e.target.value })} 
            placeholder="e.g. +91-484-2576800"
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            value={value.email || ''} 
            onChange={(e) => onChange({ ...value, email: e.target.value })} 
            placeholder="e.g. cs@cusat.ac.in"
          />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input 
            value={value.gmapsLink || ''} 
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })} 
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div className="form-group">
          <label>Website URL</label>
          <input 
            value={value.website || ''} 
            onChange={(e) => onChange({ ...value, website: e.target.value })} 
            placeholder="e.g. https://cucekuptodate.app/dashboard"
          />
        </div>
        <div className="form-group full-width">
          <label>Short Brief on Department</label>
          <textarea 
            value={value.address || ''} 
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="e.g. Offers academic programs, research activities, and student workshops in computer science and technology."
          ></textarea>
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Contact' : 'Add Contact'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function HostelForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Hostel' : 'Add Hostel'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name || ''} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Hostel Type *</label>
          <select value={value.type || 'Mens'} onChange={(e) => onChange({ ...value, type: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <option value="Mens">Men's Hostel</option>
            <option value="Ladies">Ladies' Hostel</option>
          </select>
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input value={value.location || ''} onChange={(e) => onChange({ ...value, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Fees</label>
          <input value={value.fees || ''} onChange={(e) => onChange({ ...value, fees: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Food</label>
          <input value={value.food || ''} onChange={(e) => onChange({ ...value, food: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Warden's Number</label>
          <input value={value.wardenContact || ''} onChange={(e) => onChange({ ...value, wardenContact: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Mess/Hostel Secretaries Number</label>
          <input value={value.secretaryContact || ''} onChange={(e) => onChange({ ...value, secretaryContact: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Rooms</label>
          <input value={value.rooms || ''} onChange={(e) => onChange({ ...value, rooms: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input
            value={value.gmapsLink || ''}
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Hostel' : 'Add Hostel'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function PGForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  const [newRoomType, setNewRoomType] = React.useState('');
  const [newRoomRent, setNewRoomRent] = React.useState('');

  const addRate = () => {
    if (!newRoomType.trim() || !newRoomRent.trim()) {
      alert('Please fill out both Room Type and Rent.');
      return;
    }
    const currentRates = value.rates || [];
    onChange({
      ...value,
      rates: [...currentRates, { type: newRoomType.trim(), rent: newRoomRent.trim() }]
    });
    setNewRoomType('');
    setNewRoomRent('');
  };

  const removeRate = (indexToRemove) => {
    const currentRates = value.rates || [];
    onChange({
      ...value,
      rates: currentRates.filter((_, idx) => idx !== indexToRemove)
    });
  };

  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit PG' : 'Add PG'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name || ''} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input value={value.location || ''} onChange={(e) => onChange({ ...value, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Food</label>
          <input value={value.food || ''} onChange={(e) => onChange({ ...value, food: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact *</label>
          <input value={value.contact || ''} onChange={(e) => onChange({ ...value, contact: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input
            value={value.gmapsLink || ''}
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        
        {/* Legacy fields for backward compatibility */}
        <div className="form-group">
          <label>Legacy Rent (only if no room rates added)</label>
          <input 
            value={value.rent || ''} 
            onChange={(e) => onChange({ ...value, rent: e.target.value })} 
            placeholder="e.g. ₹5000/month"
          />
        </div>
        <div className="form-group">
          <label>Legacy Rooms (only if no room rates added)</label>
          <input 
            value={value.rooms || ''} 
            onChange={(e) => onChange({ ...value, rooms: e.target.value })} 
            placeholder="e.g. Single / Double"
          />
        </div>

        {/* Dynamic Room Rates Section */}
        <div className="form-group full-width" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', background: 'var(--bg-main)' }}>
          <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-cash" style={{ color: '#0284c7' }}></i> Room Rates & Options
          </h4>
          
          {/* List of current rates */}
          {value.rates && value.rates.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {value.rates.map((rate, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{rate.type}</strong>: <span style={{ color: '#0284c7', fontWeight: '600' }}>{rate.rent}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeRate(idx)} 
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Remove rate"
                  >
                    <i className="ti ti-trash" style={{ fontSize: '16px' }}></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', fontStyle: 'italic' }}>
              No specific room rates added yet. Enter rate options below to specify different prices for different room types.
            </p>
          )}

          {/* Add rate form controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Room Type / Sharing</label>
              <input 
                type="text" 
                value={newRoomType} 
                onChange={(e) => setNewRoomType(e.target.value)} 
                placeholder="e.g. Single, Double Sharing, AC" 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Rent Amount</label>
              <input 
                type="text" 
                value={newRoomRent} 
                onChange={(e) => setNewRoomRent(e.target.value)} 
                placeholder="e.g. ₹6000/month" 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>
            <button 
              type="button" 
              onClick={addRate}
              className="btn-secondary"
              style={{ padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              Add Option
            </button>
          </div>
        </div>

        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update PG' : 'Add PG'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function FoodSpotForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Tea Spot' : 'Add Tea Spot'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input 
            value={value.description || value.specialty || ''} 
            onChange={(e) => onChange({ ...value, description: e.target.value, specialty: e.target.value })} 
            placeholder="e.g. Famous for fresh juices, hot snacks, and varieties of tea." 
          />
        </div>
        <div className="form-group">
          <label>Timing</label>
          <input value={value.timing || ''} onChange={(e) => onChange({ ...value, timing: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input
            value={value.gmapsLink || ''}
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Tea Spot' : 'Add Tea Spot'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function RestaurantForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Restaurant' : 'Add Restaurant'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Cuisine</label>
          <input value={value.cuisine} onChange={(e) => onChange({ ...value, cuisine: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact</label>
          <input value={value.contact} onChange={(e) => onChange({ ...value, contact: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input
            value={value.gmapsLink || ''}
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div className="form-group">
          <label>Price Range</label>
          <input
            value={value.priceRange || ''}
            onChange={(e) => onChange({ ...value, priceRange: e.target.value })}
            placeholder="e.g. ₹150 - ₹300, Moderate, Budget-friendly"
          />
        </div>
        <div className="form-group full-width">
          <label>Description</label>
          <textarea
            value={value.description || ''}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            placeholder="Describe the restaurant, specialties, seating, etc."
          ></textarea>
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Restaurant' : 'Add Restaurant'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function AmenityForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Amenity' : 'Add Amenity'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Category *</label>
          <input 
            value={value.category || ''} 
            onChange={(e) => onChange({ ...value, category: e.target.value })} 
            placeholder="e.g. ATM, Pharmacy, Stationery, Laundry"
            required
          />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input
            value={value.gmapsLink || ''}
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div className="form-group full-width">
          <label>Details</label>
          <textarea value={value.details} onChange={(e) => onChange({ ...value, details: e.target.value })}></textarea>
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Amenity' : 'Add Amenity'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function ClubForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Club' : 'Add Club'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact</label>
          <input value={value.contact} onChange={(e) => onChange({ ...value, contact: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input value={value.description || ''} onChange={(e) => onChange({ ...value, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input
            value={value.gmapsLink || ''}
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Club' : 'Add Club'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}

export function TurfForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
        {isEdit ? 'Edit Turf/Arena' : 'Add New Turf/Arena'}
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name || ''} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input value={value.location || ''} onChange={(e) => onChange({ ...value, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Facilities (e.g., 5s, 7s, Badminton)</label>
          <input value={value.facilities || ''} onChange={(e) => onChange({ ...value, facilities: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Rent (e.g., ₹1000/hr)</label>
          <input value={value.rent || ''} onChange={(e) => onChange({ ...value, rent: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Timing (e.g., 6 AM - 11 PM)</label>
          <input value={value.timing || ''} onChange={(e) => onChange({ ...value, timing: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input value={value.contact || ''} onChange={(e) => onChange({ ...value, contact: e.target.value })} />
        </div>
        <div className="form-group full-width">
          <label>Google Maps Link</label>
          <input 
            value={value.gmapsLink || ''} 
            onChange={(e) => onChange({ ...value, gmapsLink: e.target.value })} 
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Turf' : 'Add Turf'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}


export function AnnouncementForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="admin-flat-card">
      <h3>{isEdit ? 'Edit Announcement' : 'Add Announcement'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Announcement Text *</label>
          <input 
            value={value.text || ''} 
            onChange={(e) => onChange({ ...value, text: e.target.value })} 
            placeholder="e.g. University closed tomorrow due to heavy rain"
          />
        </div>
        <div className="form-group">
          <label>Optional Link (URL)</label>
          <input 
            value={value.link || ''} 
            onChange={(e) => onChange({ ...value, link: e.target.value })} 
            placeholder="https://..."
          />
        </div>
        <div className="form-group full-width row-actions">
          <button className="btn-primary" onClick={onSubmit}>
            {isEdit ? 'Update Announcement' : 'Add Announcement'}
          </button>
          {isEdit && <button className="btn-light" onClick={onCancel}>Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}
