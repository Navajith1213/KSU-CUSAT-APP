import React, { useState } from 'react';
import {
  CalendarForm,
  ContactForm,
  HostelForm,
  PGForm,
  FoodSpotForm,
  RestaurantForm,
  AmenityForm,
  ClubForm
} from './Forms';
import { supabase, hasSupabaseConfig } from '../../utils/supabaseClient';

export default function AdminDashboard({
  academicEvents,
  setAcademicEvents,
  contacts,
  setContacts,
  hostels,
  setHostels,
  pgs,
  setPgs,
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

  // Student queries list state
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  const fetchAllComplaints = async () => {
    setLoadingQueries(true);
    if (!hasSupabaseConfig) {
      const allQueries = JSON.parse(localStorage.getItem('mock_all_queries') || '[]');
      setAdminComplaints(allQueries);
      setLoadingQueries(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAdminComplaints(data || []);
    } catch (err) {
      console.error('Error fetching complaints from Supabase:', err.message);
    } finally {
      setLoadingQueries(false);
    }
  };

  React.useEffect(() => {
    if (adminSection === 'queries') {
      fetchAllComplaints();
    }
  }, [adminSection]);

  const updateComplaintStatus = async (idx, complaintItem, newStatus) => {
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase
          .from('complaints')
          .update({ status: newStatus })
          .eq('id', complaintItem.id);
        if (error) throw error;
        alert('Status updated successfully!');
        fetchAllComplaints();
      } catch (err) {
        alert(`Failed to update status: ${err.message}`);
      }
    } else {
      // Mock update to local storage
      const allQueries = JSON.parse(localStorage.getItem('mock_all_queries') || '[]');
      const updatedQueries = allQueries.map((item, i) => {
        if (i === idx) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      localStorage.setItem('mock_all_queries', JSON.stringify(updatedQueries));

      const studentEmail = complaintItem.student_email;
      const studentQueries = JSON.parse(localStorage.getItem(`mock_queries_${studentEmail}`) || '[]');
      const updatedStudentQueries = studentQueries.map((item) => {
        if (item.subject === complaintItem.subject && item.created_at === complaintItem.created_at) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      localStorage.setItem(`mock_queries_${studentEmail}`, JSON.stringify(updatedStudentQueries));

      alert('Status updated successfully (Demo Mode)!');
      fetchAllComplaints();
    }
  };

  // Re-define form states locally inside the Admin dashboard
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'academic' });
  const [newHostel, setNewHostel] = useState({ name: '', location: '', fees: '', food: '', contact: '', rooms: '', gmapsLink: '' });
  const [newPG, setNewPG] = useState({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '' });
  const [newFoodSpot, setNewFoodSpot] = useState({ name: '', location: '', specialty: '', timing: '', gmapsLink: '' });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '', cuisine: '', contact: '', gmapsLink: '' });
  const [newAmenity, setNewAmenity] = useState({ name: '', location: '', details: '', gmapsLink: '' });
  const [newClub, setNewClub] = useState({ name: '', location: '', contact: '', services: '', gmapsLink: '' });
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', address: '' });

  const resetFormByType = (type) => {
    if (type === 'calendar') setNewEvent({ title: '', date: '', type: 'academic' });
    if (type === 'hostels') setNewHostel({ name: '', location: '', fees: '', food: '', contact: '', rooms: '', gmapsLink: '' });
    if (type === 'pgs') setNewPG({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '' });
    if (type === 'food') setNewFoodSpot({ name: '', location: '', specialty: '', timing: '', gmapsLink: '' });
    if (type === 'restaurants') setNewRestaurant({ name: '', location: '', cuisine: '', contact: '', gmapsLink: '' });
    if (type === 'amenities') setNewAmenity({ name: '', location: '', details: '', gmapsLink: '' });
    if (type === 'clubs') setNewClub({ name: '', location: '', contact: '', services: '', gmapsLink: '' });
    if (type === 'contacts') setNewContact({ name: '', phone: '', email: '', address: '' });
  };

  const addOrUpdateItem = (type) => {
    const config = {
      calendar: { value: newEvent, setValue: setNewEvent, list: academicEvents, setList: setAcademicEvents, required: ['title', 'date'] },
      hostels: { value: newHostel, setValue: setNewHostel, list: hostels, setList: setHostels, required: ['name', 'location', 'contact'] },
      pgs: { value: newPG, setValue: setNewPG, list: pgs, setList: setPgs, required: ['name', 'location', 'contact'] },
      food: { value: newFoodSpot, setValue: setNewFoodSpot, list: foodSpots, setList: setFoodSpots, required: ['name', 'location'] },
      restaurants: { value: newRestaurant, setValue: setNewRestaurant, list: restaurants, setList: setRestaurants, required: ['name', 'location'] },
      amenities: { value: newAmenity, setValue: setNewAmenity, list: amenities, setList: setAmenities, required: ['name', 'location'] },
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
    if (type === 'hostels') setNewHostel(item);
    if (type === 'pgs') setNewPG(item);
    if (type === 'food') setNewFoodSpot(item);
    if (type === 'restaurants') setNewRestaurant(item);
    if (type === 'amenities') setNewAmenity(item);
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
          ['hostels', 'Hostels'],
          ['pgs', 'PGs'],
          ['food', 'Tea Spots'],
          ['restaurants', 'Restaurants'],
          ['amenities', 'Amenities'],
          ['clubs', 'Clubs'],
          ['queries', 'Student Queries']
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
                <p className="small-text">{item.date} | {item.type}</p>
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

      {adminSection === 'pgs' && (
        <div>
          <PGForm
            value={newPG}
            onChange={setNewPG}
            onSubmit={() => addOrUpdateItem('pgs')}
            onCancel={() => cancelEdit('pgs')}
            isEdit={editIndex !== null}
          />
          <br />
          {pgs.map((item, idx) => (
            <div className="event-item" key={idx}>
              <span>{item.name}</span>
              <div className="row-actions">
                <button className="btn-edit" onClick={() => handleEdit('pgs', idx, item)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(setPgs, pgs, idx)}>Delete</button>
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

      {adminSection === 'queries' && (
        <div className="card">
          <h3>Student Filed Queries & Complaints</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
            Read queries filed by students and update their resolution status below.
          </p>
          
          {loadingQueries ? (
            <p>Loading complaints...</p>
          ) : adminComplaints.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {adminComplaints.map((item, idx) => (
                <div key={idx} className="event-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#0d9488', backgroundColor: '#f0fdfa', padding: '3px 8px', borderRadius: '12px' }}>
                      {item.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Status:</span>
                      <select
                        value={item.status}
                        onChange={(e) => updateComplaintStatus(idx, item, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: 'white' }}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Letter Given">Letter Given</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{item.subject}</h4>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{item.description}</p>
                  <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: '6px', marginTop: '4px', fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Filed by: <strong>{item.student_name}</strong> ({item.student_email})</span>
                    <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', padding: '24px', textAlign: 'center' }}>No complaints filed yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
