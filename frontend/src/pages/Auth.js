import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Admin() {
  const BACKEND_URL = "https://travel-app-bv82.onrender.com"; // ✅ New backend URL
  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState({
    name: '',
    price: '',
    place: '',
    sublocation: '',
    timing: '',
    image: '',
    latitude: '',
    longitude: '',
    details: '',
  });
  const [editPackage, setEditPackage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPackages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/auth');
        return;
      }
      const res = await axios.get(`${BACKEND_URL}/api/auth/packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && Array.isArray(res.data)) {
        setPackages(res.data);
      } else {
        setPackages([]);
      }
      setError(null);
    } catch (err) {
      setError(`Failed to fetch packages: ${err.response ? err.response.data.msg || err.response.statusText : err.message}`);
      console.error('Fetch error:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/auth');
        return;
      }
      const requiredFields = ['name', 'price', 'place', 'timing', 'image', 'latitude', 'longitude'];
      if (requiredFields.some(field => !newPackage[field] || newPackage[field] === '')) {
        setError('Please fill all required fields.');
        return;
      }
      const res = await axios.post(`${BACKEND_URL}/api/auth/packages`, newPackage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Add package response:', res.data);
      setNewPackage({
        name: '',
        price: '',
        place: '',
        sublocation: '',
        timing: '',
        image: '',
        latitude: '',
        longitude: '',
        details: '',
      });
      fetchPackages();
      setError(null);
      alert(res.data.msg || 'Package added successfully!');
    } catch (err) {
      setError(`Failed to add package: ${err.response ? err.response.data.msg || err.response.statusText : err.message}`);
      console.error('Add package error:', err.response ? err.response.data : err.message);
    }
  };

  const handleEditPackage = (pkg) => {
    setEditPackage({ ...pkg });
  };

  const handleSaveEditPackage = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/auth');
        return;
      }
      if (!editPackage._id) {
        setError('No package ID found for editing.');
        return;
      }
      const res = await axios.put(`${BACKEND_URL}/api/auth/packages/${editPackage._id}`, editPackage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Edit package response:', res.data);
      setEditPackage(null);
      fetchPackages();
      setError(null);
      alert(res.data.msg || 'Package updated successfully!');
    } catch (err) {
      setError(`Failed to update package: ${err.response ? err.response.data.msg || err.response.statusText : err.message}`);
      console.error('Edit package error:', err.response ? err.response.data : err.message);
    }
  };

  const handleDeletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/auth');
          return;
        }
        const res = await axios.delete(`${BACKEND_URL}/api/auth/packages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Delete package response:', res.data);
        fetchPackages();
        setError(null);
        alert(res.data.msg || 'Package deleted successfully!');
      } catch (err) {
        setError(`Failed to delete package: ${err.response ? err.response.data.msg || err.response.statusText : err.message}`);
        console.error('Delete package error:', err.response ? err.response.data : err.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setError(null);
    navigate('/auth');
  };

  return (
    <div className="admin-container" style={{ padding: '20px', color: '#03e9f4', background: '#050801', minHeight: '100vh' }}>
      <h1>Admin Panel</h1>
      {error && <p className="error-message">{error}</p>}
      <button className="auth-button" onClick={handleLogout} style={{ margin: '20px 0', background: '#ff4444' }}>
        <span></span><span></span><span></span><span></span>Logout
      </button>
      <div style={{ maxWidth: '500px', margin: '0 auto', marginBottom: '20px' }}>
        <h2>Add Package</h2>
        <form onSubmit={handleAddPackage}>
          {/* Add package input fields */}
          {/* Keep your input fields unchanged */}
        </form>
      </div>

      {editPackage && (
        <div style={{ maxWidth: '500px', margin: '20px auto', marginBottom: '20px' }}>
          <h2>Edit Package</h2>
          <form onSubmit={handleSaveEditPackage}>
            {/* Edit package input fields */}
            {/* Keep your input fields unchanged */}
          </form>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h2>Packages</h2>
        {packages.length === 0 ? (
          <p>{error || 'No packages available.'}</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {packages.map((pkg) => (
              <div key={pkg._id} style={{ width: '250px', padding: '10px', border: '1px solid #03e9f4', borderRadius: '10px', background: '#050801' }}>
                <img src={pkg.image} alt={pkg.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                <h4 style={{ color: '#03e9f4' }}>{pkg.name}</h4>
                <p style={{ color: '#03e9f4' }}>Price: Rs.{pkg.price}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="auth-button" onClick={() => handleEditPackage(pkg)} style={{ flex: 1 }}><span></span><span></span><span></span><span></span>Edit</button>
                  <button className="auth-button" onClick={() => handleDeletePackage(pkg._id)} style={{ flex: 1, background: '#ff4444' }}><span></span><span></span><span></span><span></span>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
