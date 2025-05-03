import React, { useState, useEffect } from 'react';
import './Admin.css';

const Admin = ({ handleLogout }) => {
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    place: '',
    sublocation: '',
    image: '',
    timing: '',
    details: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('https://travel-app-l3x3.onrender.com/api/auth/packages');
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText} - ${errorText}`);
      }
      const data = await res.json();
      console.log('Fetched packages:', data);
      setPackages(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch packages: ${err.message}`);
      console.error('Fetch error:', err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editMode
      ? `https://travel-app-l3x3.onrender.com/api/auth/update-package/${editingId}`
      : 'https://travel-app-l3x3.onrender.com/api/auth/add-package';
    const method = editMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price) || 0,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText} - ${errorText}`);
      }
      const data = await res.json();
      setError(data.msg || 'Success');
      fetchPackages();
      setFormData({ name: '', price: '', place: '', sublocation: '', image: '', timing: '', details: '' });
      setEditMode(false);
      setEditingId(null);
    } catch (err) {
      setError(`Failed to ${editMode ? 'update' : 'add'} package: ${err.message}`);
      console.error(`${editMode ? 'Update' : 'Add'} error:`, err.message);
    }
  };

  const handleEdit = (pkg) => {
    setEditMode(true);
    setEditingId(pkg._id);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      place: pkg.place,
      sublocation: pkg.sublocation || '',
      image: pkg.image,
      timing: pkg.timing,
      details: pkg.details || '',
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        <h1 className="admin-title">Control Center</h1>
        {error && <p className="error-message">{error}</p>}
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2 className="form-title">{editMode ? 'Modify Package' : 'Create Package'}</h2>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder=" "
              required
            />
            <label>Package Name</label>
          </div>
          <div className="form-group">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder=" "
              required
            />
            <label>Price (Rs.)</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleInputChange}
              placeholder=" "
              required
            />
            <label>Place</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="sublocation"
              value={formData.sublocation}
              onChange={handleInputChange}
              placeholder=" "
            />
            <label>Sublocation</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="timing"
              value={formData.timing}
              onChange={handleInputChange}
              placeholder=" "
              required
            />
            <label>Timing</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder=" "
              required
            />
            <label>Image URL</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder=" "
            />
            <label>Details</label>
          </div>
          <div className="form-buttons">
            <button type="submit" className="auth-button">
              <span></span><span></span><span></span><span></span>
              {editMode ? 'Update Package' : 'Add Package'}
            </button>
            {editMode && (
              <button
                type="button"
                className="auth-button cancel-button"
                onClick={() => {
                  setEditMode(false);
                  setEditingId(null);
                  setFormData({ name: '', price: '', place: '', sublocation: '', image: '', timing: '', details: '' });
                }}
              >
                <span></span><span></span><span></span><span></span>Cancel
              </button>
            )}
          </div>
        </form>
        <h2 className="section-title">Package Inventory</h2>
        {packages.length === 0 ? (
          <p className="no-packages">No packages available.</p>
        ) : (
          <div className="package-list">
            {packages.map((pkg) => (
              <div key={pkg._id} className="package-item">
                <h3>{pkg.name}</h3>
                <p>Price: Rs.{pkg.price}</p>
                <p>Place: {pkg.place} {pkg.sublocation && `(${pkg.sublocation})`}</p>
                <p>Timing: {pkg.timing}</p>
                <img src={pkg.image} alt={pkg.name} className="package-image" />
                <p>Details: {pkg.details || 'No details provided'}</p>
                <button onClick={() => handleEdit(pkg)} className="auth-button">
                  <span></span><span></span><span></span><span></span>Edit
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={fetchPackages} className="auth-button refresh-button">
          <span></span><span></span><span></span><span></span>Refresh Inventory
        </button>
      </div>
    </div>
  );
};

export default Admin;
