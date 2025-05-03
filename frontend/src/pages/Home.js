import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import WaterVideo from '../Assets/WaterVideo.mp4';
import Modal from 'react-modal';
import './Home.css';

Modal.setAppElement('#root');

const Home = ({ handleLogout }) => {
  const [destination, setDestination] = useState('');
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  const fetchPackages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        navigate('/auth');
        return;
      }
      const res = await fetch('https://travel-app-l3x3.onrender.com/api/auth/packages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch packages: ${err.message}`);
      console.error('Fetch error:', err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleFindPackages = () => {
    const query = destination.trim().toLowerCase();
    if (query) {
      const filteredPackages = packages.filter(pkg =>
        pkg.name?.toLowerCase().includes(query) ||
        pkg.place?.toLowerCase().includes(query) ||
        pkg.sublocation?.toLowerCase().includes(query)
      );
      setPackages(filteredPackages);
    } else {
      fetchPackages();
    }
  };

  const openModal = (pkg) => setSelectedPackage(pkg);
  const closeModal = () => setSelectedPackage(null);

  return (
    <>
      <section className='home'>
        <div className='overlay'></div>
        <video src={WaterVideo} muted autoPlay loop type="video/mp4" className='background-video'></video>
        <div className='home-content'>
          <h3 className='name'>TRIPTALES</h3>
          <h1 className='tagline'>EVERY JOURNEY HAS A STORY</h1>
          <br></br>
          <div className='textdiv'>
            <span className='smalltext' style={{ color: 'black' }}>Our Packages :</span>
            <h1 className='hometitle'>Search Your Holidays...</h1>
          </div>

          <div className='search-box'>
            <label htmlFor='city' className='search-label'>Search your destination:</label>
            <div className='search-bar'>
              <input
                type='text'
                id='city'
                placeholder='Enter name here...'
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <button onClick={handleFindPackages} className='find-packages-button'>
                Find Packages
              </button>
            </div>
          </div>

          {error && <p className='error-message'>{error}</p>}
          {packages.length === 0 && !error && <p style={{ color: '#03e9f4' }}>No packages available.</p>}

          {packages.length > 0 && (
            <div className='package-list-wrapper'>
              <h2 style={{ textAlign: 'center' }}>Available Packages:</h2>
              <div className='package-list-container'>
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className='package-card'
                    onClick={() => openModal(pkg)}
                  >
                    <img src={pkg.image} alt={pkg.name} className='package-image' />
                    <h4>{pkg.name}</h4>
                    <p>Price: Rs.{pkg.price}</p>
                    <p>Location: {pkg.place} {pkg.sublocation && `(${pkg.sublocation})`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={!!selectedPackage}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            background: '#050801',
            color: '#03e9f4',
            border: 'none',
            borderRadius: '10px',
            padding: '20px',
            zIndex: 9999,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9998,
          },
        }}
      >
        {selectedPackage && (
          <>
            <h2>{selectedPackage.name}</h2>
            <img src={selectedPackage.image} alt={selectedPackage.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px' }} />
            <p>Price: Rs.{selectedPackage.price}</p>
            <p>Location: {selectedPackage.place} {selectedPackage.sublocation && `(${selectedPackage.sublocation})`}</p>
            <p>Timing: {selectedPackage.timing}</p>
            <p>Details: {selectedPackage.details}</p>
            <button onClick={closeModal} className="auth-button" style={{ marginTop: '10px' }}>
              <span></span><span></span><span></span><span></span>Close
            </button>
          </>
        )}
      </Modal>
    </>
  );
};

export default Home;
