import React, { useState, useEffect } from 'react';
import {
  CalendarForm,
  ContactForm,
  PGForm,
  HostelForm,
  FoodSpotForm,
  RestaurantForm,
  AmenityForm,
  ClubForm
} from './Forms';
import { supabase, hasSupabaseConfig } from '../../utils/supabaseClient';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export default function AdminDashboard({
  academicEvents,
  setAcademicEvents,
  contacts,
  setContacts,
  boysPgs,
  setBoysPgs,
  girlsPgs,
  setGirlsPgs,
  hostels,
  setHostels,
  foodSpots,
  setFoodSpots,
  restaurants,
  setRestaurants,
  amenities,
  setAmenities,
  clubs,
  setClubs,
  setUnsavedChanges,
  publishToGitHub,
  isPublishing
}) {
  const [adminSection, setAdminSection] = useState('calendar');
  const [editIndex, setEditIndex] = useState(null);

  // Department Admins State
  const [deptAdmins, setDeptAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDept, setNewAdminDept] = useState('');
  const [isAdminsLoading, setIsAdminsLoading] = useState(false);

  useEffect(() => {
    if (adminSection === 'dept_admins') {
      fetchDeptAdmins();
    }
  }, [adminSection]);

  const fetchDeptAdmins = async () => {
    if (!hasSupabaseConfig) return;
    setIsAdminsLoading(true);
    try {
      const { data, error } = await supabase.from('department_admins').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDeptAdmins(data || []);
    } catch (err) {
      console.error("Error fetching dept admins:", err);
    } finally {
      setIsAdminsLoading(false);
    }
  };

  const handleAddDeptAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminDept.trim()) return;
    try {
      const { data, error } = await supabase.from('department_admins').insert([{
        email: newAdminEmail.trim().toLowerCase(),
        department: newAdminDept.trim()
      }]).select();
      if (error) throw error;
      setDeptAdmins([data[0], ...deptAdmins]);
      setNewAdminEmail('');
      setNewAdminDept('');
      alert("Department Admin added successfully!");
    } catch (err) {
      alert("Error adding admin: " + err.message);
    }
  };

  const handleDeleteDeptAdmin = async (id) => {
    if (!window.confirm("Remove this Department Admin?")) return;
    try {
      const { error } = await supabase.from('department_admins').delete().eq('id', id);
      if (error) throw error;
      setDeptAdmins(deptAdmins.filter(a => a.id !== id));
    } catch (err) {
      alert("Error deleting admin: " + err.message);
    }
  };


  // Re-define form states locally inside the Admin dashboard
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'academic' });
  const [newBoysPg, setNewBoysPg] = useState({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '', rates: [] });
  const [newGirlsPg, setNewGirlsPg] = useState({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '', rates: [] });
  const [newHostel, setNewHostel] = useState({ name: '', type: 'Mens', location: '', fees: '', food: '', contact: '', wardenContact: '', secretaryContact: '', rooms: '', gmapsLink: '' });
  const [newFoodSpot, setNewFoodSpot] = useState({ name: '', location: '', description: '', specialty: '', timing: '', gmapsLink: '' });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '', cuisine: '', contact: '', gmapsLink: '' });
  const [newAmenity, setNewAmenity] = useState({ name: '', location: '', details: '', category: '', gmapsLink: '' });
  const [newClub, setNewClub] = useState({ name: '', location: '', contact: '', description: '', gmapsLink: '' });
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', address: '', gmapsLink: '' });
 
  const resetFormByType = (type) => {
    if (type === 'calendar') setNewEvent({ title: '', date: '', type: 'academic' });
    if (type === 'boysPgs') setNewBoysPg({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '', rates: [] });
    if (type === 'girlsPgs') setNewGirlsPg({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '', rates: [] });
    if (type === 'hostels') setNewHostel({ name: '', type: 'Mens', location: '', fees: '', food: '', contact: '', wardenContact: '', secretaryContact: '', rooms: '', gmapsLink: '' });
    if (type === 'food') setNewFoodSpot({ name: '', location: '', description: '', specialty: '', timing: '', gmapsLink: '' });
    if (type === 'restaurants') setNewRestaurant({ name: '', location: '', cuisine: '', contact: '', gmapsLink: '' });
    if (type === 'amenities') setNewAmenity({ name: '', location: '', details: '', category: '', gmapsLink: '' });
    if (type === 'clubs') setNewClub({ name: '', location: '', contact: '', description: '', gmapsLink: '' });
    if (type === 'contacts') setNewContact({ name: '', phone: '', email: '', address: '', gmapsLink: '' });
  };

  const addOrUpdateItem = (type) => {
    const config = {
      calendar: { value: newEvent, setValue: setNewEvent, list: academicEvents, setList: setAcademicEvents, required: ['title', 'date'] },
      boysPgs: { value: newBoysPg, setValue: setNewBoysPg, list: boysPgs, setList: setBoysPgs, required: ['name', 'location', 'contact'] },
      girlsPgs: { value: newGirlsPg, setValue: setNewGirlsPg, list: girlsPgs, setList: setGirlsPgs, required: ['name', 'location', 'contact'] },
      hostels: { value: newHostel, setValue: setNewHostel, list: hostels, setList: setHostels, required: ['name', 'location', 'contact'] },
      food: { value: newFoodSpot, setValue: setNewFoodSpot, list: foodSpots, setList: setFoodSpots, required: ['name', 'location'] },
      restaurants: { value: newRestaurant, setValue: setNewRestaurant, list: restaurants, setList: setRestaurants, required: ['name', 'location'] },
      amenities: { value: newAmenity, setValue: setNewAmenity, list: amenities, setList: setAmenities, required: ['name', 'location', 'category'] },
      clubs: { value: newClub, setValue: setNewClub, list: clubs, setList: setClubs, required: ['name', 'location'] },
      contacts: { value: newContact, setValue: setNewContact, list: contacts, setList: setContacts, required: ['name', 'phone'] }
    };

    const current = config[type];
    const hasAll = current.required.every(field => current.value[field] && current.value[field].toString().trim() !== '');

    if (!hasAll) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editIndex !== null) {
      const updated = current.list.map((item, idx) => idx === editIndex ? current.value : item);
      current.setList(updated);
    } else {
      current.setList([...current.list, current.value]);
    }

    resetFormByType(type);
    setEditIndex(null);
    setUnsavedChanges(true);
  };

  const handleEdit = (type, index, item) => {
    setAdminSection(type);
    setEditIndex(index);
    if (type === 'calendar') setNewEvent(item);
    if (type === 'boysPgs') setNewBoysPg(item);
    if (type === 'girlsPgs') setNewGirlsPg(item);
    if (type === 'hostels') setNewHostel(item);
    if (type === 'food') setNewFoodSpot({
      name: item.name || '',
      location: item.location || '',
      description: item.description || item.specialty || '',
      specialty: item.description || item.specialty || '',
      timing: item.timing || '',
      gmapsLink: item.gmapsLink || ''
    });
    if (type === 'restaurants') setNewRestaurant(item);
    if (type === 'amenities') setNewAmenity({
      name: item.name || '',
      location: item.location || '',
      details: item.details || '',
      category: item.category || '',
      gmapsLink: item.gmapsLink || ''
    });
    if (type === 'clubs') setNewClub(item);
    if (type === 'contacts') setNewContact(item);
  };

  const handleDelete = (setter, list, index) => {
    setter(list.filter((_, i) => i !== index));
    setUnsavedChanges(true);
    if (editIndex === index) setEditIndex(null);
  };

  const cancelEdit = (type) => {
    setEditIndex(null);
    resetFormByType(type);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <h2>Admin Control Dashboard</h2>
        <button className="btn-secondary" onClick={publishToGitHub} disabled={isPublishing}>
          <i className="ti ti-cloud-upload" style={{ marginRight: '6px' }}></i> 
          {isPublishing ? 'Publishing...' : 'Save & Publish to GitHub'}
        </button>
      </div>

      <div className="admin-tabs">
        {[
          ['calendar', 'Calendar'],
          ['contacts', 'Contacts'],
          ['boysPgs', "Boys PG's"],
          ['girlsPgs', "Girls PG's"],
          ['hostels', 'College Hostels'],
          ['food', 'Tea Spots'],
          ['restaurants', 'Restaurants'],
          ['amenities', 'Amenities'],
          ['clubs', 'Clubs'],
          ['dept_admins', 'Dept Admins']
        ].map(([id, label]) => (
          <button
            key={id}
            className={`admin-tab-btn ${adminSection === id ? 'active' : ''}`}
            onClick={() => { setAdminSection(id); setEditIndex(null); resetFormByType(id); }}
          >
            {label}
          </button>
        ))}
      </div>

      {adminSection === 'calendar' && (
        <div>
          <CalendarForm
            value={newEvent}
            onChange={setNewEvent}
            onSubmit={() => addOrUpdateItem('calendar')}
            onCancel={() => cancelEdit('calendar')}
            isEdit={editIndex !== null}
          />
          <br />
          {academicEvents.map((item, idx) => (
            <div className="event-item" key={idx}>
              <div>
                <strong>{item.title}</strong>
                <p className="small-text">{formatDate(item.date)} | {item.type}</p>
              </div>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('calendar', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setAcademicEvents, academicEvents, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'contacts' && (
        <div>
          <ContactForm
            value={newContact}
            onChange={setNewContact}
            onSubmit={() => addOrUpdateItem('contacts')}
            onCancel={() => cancelEdit('contacts')}
            isEdit={editIndex !== null}
          />
          <br />
          {contacts.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('contacts', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setContacts, contacts, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'boysPgs' && (
        <div>
          <PGForm
            value={newBoysPg}
            onChange={setNewBoysPg}
            onSubmit={() => addOrUpdateItem('boysPgs')}
            onCancel={() => cancelEdit('boysPgs')}
            isEdit={editIndex !== null}
          />
          <br />
          {boysPgs.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('boysPgs', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setBoysPgs, boysPgs, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'girlsPgs' && (
        <div>
          <PGForm
            value={newGirlsPg}
            onChange={setNewGirlsPg}
            onSubmit={() => addOrUpdateItem('girlsPgs')}
            onCancel={() => cancelEdit('girlsPgs')}
            isEdit={editIndex !== null}
          />
          <br />
          {girlsPgs.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('girlsPgs', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setGirlsPgs, girlsPgs, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'hostels' && (
        <div>
          <HostelForm
            value={newHostel}
            onChange={setNewHostel}
            onSubmit={() => addOrUpdateItem('hostels')}
            onCancel={() => cancelEdit('hostels')}
            isEdit={editIndex !== null}
          />
          <br />
          {hostels.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('hostels', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setHostels, hostels, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'food' && (
        <div>
          <FoodSpotForm
            value={newFoodSpot}
            onChange={setNewFoodSpot}
            onSubmit={() => addOrUpdateItem('food')}
            onCancel={() => cancelEdit('food')}
            isEdit={editIndex !== null}
          />
          <br />
          {foodSpots.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('food', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setFoodSpots, foodSpots, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'restaurants' && (
        <div>
          <RestaurantForm
            value={newRestaurant}
            onChange={setNewRestaurant}
            onSubmit={() => addOrUpdateItem('restaurants')}
            onCancel={() => cancelEdit('restaurants')}
            isEdit={editIndex !== null}
          />
          <br />
          {restaurants.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('restaurants', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setRestaurants, restaurants, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'amenities' && (
        <div>
          <AmenityForm
            value={newAmenity}
            onChange={setNewAmenity}
            onSubmit={() => addOrUpdateItem('amenities')}
            onCancel={() => cancelEdit('amenities')}
            isEdit={editIndex !== null}
          />
          <br />
          {amenities.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('amenities', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setAmenities, amenities, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'clubs' && (
        <div>
          <ClubForm
            value={newClub}
            onChange={setNewClub}
            onSubmit={() => addOrUpdateItem('clubs')}
            onCancel={() => cancelEdit('clubs')}
            isEdit={editIndex !== null}
          />
          <br />
          {clubs.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('clubs', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setClubs, clubs, idx)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminSection === 'dept_admins' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Add Department Admin</h3>
            <p className="small-text" style={{ marginBottom: '16px' }}>Assign a student to manage a specific department's resources.</p>
            <form onSubmit={handleAddDeptAdmin} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="email" 
                placeholder="Student Email" 
                value={newAdminEmail} 
                onChange={e => setNewAdminEmail(e.target.value)} 
                required 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <input 
                type="text" 
                placeholder="Department Name" 
                value={newAdminDept} 
                onChange={e => setNewAdminDept(e.target.value)} 
                required 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button type="submit" className="btn-primary">Add Admin</button>
            </form>
          </div>

          <h3>Current Department Admins</h3>
          {isAdminsLoading ? <p>Loading...</p> : deptAdmins.length === 0 ? <p>No department admins assigned.</p> : (
            deptAdmins.map(admin => (
              <div className="event-item" key={admin.id}>
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{admin.email}</strong>
                  <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 'bold' }}>{admin.department}</span>
                </div>
                <button className="btn-danger" onClick={() => handleDeleteDeptAdmin(admin.id)}>Remove</button>
              </div>
            ))
          )}
        </div>
      )}


    </div>
  );
}
