import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    place: '',
    location: '',
    sublocation: '',
    timing: '',
    image: '',
    latitude: '',
    longitude: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://travel-app-l3x3.onrender.com/api/packages', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage('Package added successfully!');
      setFormData({
        name: '',
        price: '',
        place: '',
        location: '',
        sublocation: '',
        timing: '',
        image: '',
        latitude: '',
        longitude: ''
      });
      // Refresh packages on Home page
      window.location.href = '/home';
    } catch (err) {
      setMessage('Error adding package: ' + err.message);
      console.error('Error:', err.message);
    }
  };

  return (
    <div className="admin-container" style={{ padding: '20px', color: '#03e9f4', background: '#050801' }}>
      <h1>Admin Panel</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="mb-3">
          <label>Package Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <div className="mb-3">
          <label>Price (Rs.)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <div className="mb-3">
          <label>Place</label>
          <input type="text" name="place" value={formData.place} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <div className="mb-3">
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <div className="mb-3">
          <label>Sublocation</label>
          <input type="text" name="sublocation" value={formData.sublocation} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} />
        </div>
        <div className="mb-3">
          <label>Timing</label>
          <input type="text" name="timing" value={formData.timing} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <div className="mb-3">
          <label>Image URL</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <div className="mb-3">
          <label>Latitude</label>
          <input type="number" step="0.0001" name="latitude" value={formData.latitude} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <div className="mb-3">
          <label>Longitude</label>
          <input type="number" step="0.0001" name="longitude" value={formData.longitude} onChange={handleChange} className="form-control" style={{ backgroundColor: 'transparent', border: '1px solid #03e9f4', color: '#03e9f4' }} required />
        </div>
        <button type="submit" className="auth-button" style={{ marginTop: '20px' }}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Add Package
        </button>
        {message && <p style={{ color: message.includes('Error') ? '#ff4444' : '#03e9f4', marginTop: '10px' }}>{message}</p>}
      </form>
    </div>
  );
};

export default AdminPanel;
