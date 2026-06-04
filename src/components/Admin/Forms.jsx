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
  return (
    <div className="card">
      <h3>{isEdit ? 'Edit PG' : 'Add PG'}</h3>
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
          <label>Rent</label>
          <input value={value.rent} onChange={(e) => onChange({ ...value, rent: e.target.value })} />
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
