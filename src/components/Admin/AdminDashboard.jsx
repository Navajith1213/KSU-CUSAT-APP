import React, { useState } from 'react';
import {
  CalendarForm,
  ContactForm,
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
  boysPgs,
  setBoysPgs,
  girlsPgs,
  setGirlsPgs,
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


  // Re-define form states locally inside the Admin dashboard
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'academic' });
  const [newBoysPg, setNewBoysPg] = useState({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '' });
  const [newGirlsPg, setNewGirlsPg] = useState({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '' });
  const [newFoodSpot, setNewFoodSpot] = useState({ name: '', location: '', specialty: '', timing: '', gmapsLink: '' });
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '', cuisine: '', contact: '', gmapsLink: '' });
  const [newAmenity, setNewAmenity] = useState({ name: '', location: '', details: '', gmapsLink: '' });
  const [newClub, setNewClub] = useState({ name: '', location: '', contact: '', services: '', gmapsLink: '' });
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', address: '' });

  const resetFormByType = (type) => {
    if (type === 'calendar') setNewEvent({ title: '', date: '', type: 'academic' });
    if (type === 'boysPgs') setNewBoysPg({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '' });
    if (type === 'girlsPgs') setNewGirlsPg({ name: '', location: '', rent: '', food: '', contact: '', rooms: '', gmapsLink: '' });
    if (type === 'food') setNewFoodSpot({ name: '', location: '', specialty: '', timing: '', gmapsLink: '' });
    if (type === 'restaurants') setNewRestaurant({ name: '', location: '', cuisine: '', contact: '', gmapsLink: '' });
    if (type === 'amenities') setNewAmenity({ name: '', location: '', details: '', gmapsLink: '' });
    if (type === 'clubs') setNewClub({ name: '', location: '', contact: '', services: '', gmapsLink: '' });
    if (type === 'contacts') setNewContact({ name: '', phone: '', email: '', address: '' });
  };

  const addOrUpdateItem = (type) => {
    const config = {
      calendar: { value: newEvent, setValue: setNewEvent, list: academicEvents, setList: setAcademicEvents, required: ['title', 'date'] },
      boysPgs: { value: newBoysPg, setValue: setNewBoysPg, list: boysPgs, setList: setBoysPgs, required: ['name', 'location', 'contact'] },
      girlsPgs: { value: newGirlsPg, setValue: setNewGirlsPg, list: girlsPgs, setList: setGirlsPgs, required: ['name', 'location', 'contact'] },
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
    if (type === 'boysPgs') setNewBoysPg(item);
    if (type === 'girlsPgs') setNewGirlsPg(item);
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
          ['boysPgs', "Boys PG's"],
          ['girlsPgs', "Girls PG's"],
          ['food', 'Tea Spots'],
          ['restaurants', 'Restaurants'],
          ['amenities', 'Amenities'],
          ['clubs', 'Clubs']
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


    </div>
  );
}
