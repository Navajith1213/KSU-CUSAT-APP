import React from 'react';

export function CalendarForm({ value, onChange, onSubmit, onCancel, isEdit }) {
  return (
    <div className="card">
      <h3>{isEdit ? 'Edit Academic Event' : 'Add Academic Event'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Event Title *</label>
          <input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} />
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
    <div className="card">
      <h3>{isEdit ? 'Edit Contact' : 'Add Contact'}</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
        </div>
        <div className="form-group full-width">
          <label>Address</label>
          <textarea value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })}></textarea>
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
    <div className="card">
      <h3>{isEdit ? 'Edit Hostel' : 'Add Hostel'}</h3>
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
          <label>Fees</label>
          <input value={value.fees} onChange={(e) => onChange({ ...value, fees: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Food</label>
          <input value={value.food} onChange={(e) => onChange({ ...value, food: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact *</label>
          <input value={value.contact} onChange={(e) => onChange({ ...value, contact: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Rooms</label>
          <input value={value.rooms} onChange={(e) => onChange({ ...value, rooms: e.target.value })} />
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
    <div className="card">
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
        <div className="form-group full-width" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-cash" style={{ color: '#0d9488' }}></i> Room Rates & Options
          </h4>
          
          {/* List of current rates */}
          {value.rates && value.rates.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {value.rates.map((rate, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#334155' }}>{rate.type}</strong>: <span style={{ color: '#0d9488', fontWeight: '600' }}>{rate.rent}</span>
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
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', fontStyle: 'italic' }}>
              No specific room rates added yet. Enter rate options below to specify different prices for different room types.
            </p>
          )}

          {/* Add rate form controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Room Type / Sharing</label>
              <input 
                type="text" 
                value={newRoomType} 
                onChange={(e) => setNewRoomType(e.target.value)} 
                placeholder="e.g. Single, Double Sharing, AC" 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Rent Amount</label>
              <input 
                type="text" 
                value={newRoomRent} 
                onChange={(e) => setNewRoomRent(e.target.value)} 
                placeholder="e.g. ₹6000/month" 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button 
              type="button" 
              onClick={addRate}
              className="btn-secondary"
              style={{ padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
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
    <div className="card">
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
          <label>Specialty</label>
          <input value={value.specialty} onChange={(e) => onChange({ ...value, specialty: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Timing</label>
          <input value={value.timing} onChange={(e) => onChange({ ...value, timing: e.target.value })} />
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
    <div className="card">
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
    <div className="card">
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
    <div className="card">
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
          <label>Services Provided</label>
          <input value={value.services} onChange={(e) => onChange({ ...value, services: e.target.value })} />
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
