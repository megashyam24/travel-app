import React, { useState, useEffect, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ExplorePackage.css';

const ExploreSouthIndia = ({ handleLogout }) => {
  const [show, setShow] = useState(false);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [travelDate, setTravelDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const navigate = useNavigate();
  const BACKEND_URL = "https://travel-app-bv82.onrender.com"; // ✅ Updated backend URL

  const handleClose = () => {
    setShow(false);
    setSelectedPackage(null);
    setBookingStatus(null);
    setError(null);
    setTravelDate('');
    setReturnDate('');
  };

  const handleShow = (pkg) => {
    setSelectedPackage(pkg);
    setShow(true);
  };

  const handleBookNow = () => {
    if (selectedPackage) {
      if (!travelDate || !returnDate) {
        setError('Please select both travel and return dates.');
        setBookingStatus('error');
        return;
      }
      if (new Date(returnDate) < new Date(travelDate)) {
        setError('Return date must be after travel date.');
        setBookingStatus('error');
        return;
      }
      const confirmBooking = window.confirm(`Are you sure you want to book "${selectedPackage.name}" for travel on ${new Date(travelDate).toLocaleDateString()} to ${new Date(returnDate).toLocaleDateString()}?`);
      if (confirmBooking) {
        bookPackage(selectedPackage._id);
      }
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found. Please log in again.');
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/refresh`, { refreshToken });
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      console.log('New access token obtained:', newToken.substring(0, 10) + '...');
      return newToken;
    } catch (err) {
      console.error('Token refresh failed:', err.response ? err.response.data : err.message);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw new Error('Session expired. Please log in again.');
    }
  };

  const bookPackage = async (packageId) => {
    let token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setBookingStatus('error');
      navigate('/auth');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/bookings`, { 
        packageId,
        travelDate,
        returnDate 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Booking response:', response.data);
      setBookingStatus('success');
      setError(null);
    } catch (err) {
      console.error('Booking error:', err.response ? err.response.data : err.message);
      if (err.response?.status === 403 && err.response?.data?.message.includes('Token expired')) {
        try {
          token = await refreshAccessToken();
          const retryResponse = await axios.post(`${BACKEND_URL}/api/bookings`, { 
            packageId,
            travelDate,
            returnDate 
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Retry booking response:', retryResponse.data);
          setBookingStatus('success');
          setError(null);
        } catch (refreshErr) {
          setBookingStatus('error');
          setError(refreshErr.message);
          navigate('/auth');
        }
      } else {
        setBookingStatus('error');
        setError(err.response?.data?.message || 'Failed to book package. Please try again.');
      }
    }
  };

  const fetchPackages = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/packages`);
      if (res.data && Array.isArray(res.data)) {
        const southIndiaPackages = res.data.filter(pkg =>
          pkg.place.toLowerCase().includes('south') ||
          pkg.place.toLowerCase().includes('india') ||
          (pkg.sublocation && (pkg.sublocation.toLowerCase().includes('south') || pkg.sublocation.toLowerCase().includes('india')))
        );

        const packagesWithRatings = (southIndiaPackages.length ? southIndiaPackages : res.data).map((pkg, index) => ({
          ...pkg,
          rating: [92, 95, 88, 91, 97, 93, 89, 94, 90, 96][index % 10],
        }));

        setPackages(packagesWithRatings);
        setError(null);
      } else {
        setPackages([]);
        setError('No packages found');
      }
    } catch (err) {
      console.error('Fetch error:', err.response ? err.response.data : err.message);
      setError('Failed to fetch packages');
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <div className="explore-south-india-page">
      <div className="bg-img">
        <h1 className="page-title">Explore Our Packages</h1>
        <p className="page-description" style={{ color: '#FFFFFF' }}>
          Every destination tells a story, from serene beaches to towering mountains, bustling cities to quiet countryside escapes. Whether you're chasing adventure, seeking peace, or diving into rich cultures and histories, our travel packages promise unforgettable memories. Let your dream journey begin today.
        </p>
      </div>

      <div className="packages-container">
        {packages.length > 0 ? (
          packages.map((pkg) => (
            <Card
              key={pkg._id}
              className="card"
              style={{ width: '280px', margin: '15px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => handleShow(pkg)}
            >
              <Card.Img
                variant="top"
                className="card-img"
                src={pkg.image || 'https://media1.thrillophilia.com/filestore/53njj9nki36qvob2ashdxrpcmd3r_1591171878_shutterstock_1075957706.jpg?w=360&dpr=2'}
                alt={pkg.name}
              />
              <Card.Body>
                <Card.Title className="card-title">
                  <img src="https://cdn.pixabay.com/photo/2022/01/11/12/16/rating-6930474_1280.png" className="rating-img" alt="Rating" />
                  <h5 className="rating-text">{pkg.rating} Ratings</h5>
                </Card.Title>
                <Card.Text className="card-text">
                  {pkg.name || 'South India Temple Tour'}
                  <h5 className="new-price">Rs.{pkg.price || 24500}</h5>
                </Card.Text>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p className="error-message">{error || 'No South India packages available.'}</p>
        )}
      </div>

      <Modal show={show} onHide={handleClose} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>{selectedPackage?.name || 'Package Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPackage && (
            <>
              <img
                src={selectedPackage.image || 'https://media1.thrillophilia.com/filestore/53njj9nki36qvob2ashdxrpcmd3r_1591171878_shutterstock_1075957706.jpg?w=360&dpr=2'}
                alt={selectedPackage.name}
                className="modal-image"
              />
              <p><strong>Price:</strong> Rs.{selectedPackage.price || 24500}</p>
              <p><strong>Location:</strong> {selectedPackage.place} {selectedPackage.sublocation && `(${selectedPackage.sublocation})`}</p>
              <p><strong>Timing:</strong> {selectedPackage.timing || 'N/A'}</p>
              <p><strong>Rating:</strong> {selectedPackage.rating} Ratings</p>
              <p><strong>Details:</strong> {selectedPackage.details || 'No additional details available.'}</p>
              <div className="date-inputs">
                <div>
                  <label htmlFor="travelDate">Travel Date:</label>
                  <input
                    type="date"
                    id="travelDate"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="returnDate">Return Date:</label>
                  <input
                    type="date"
                    id="returnDate"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={travelDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              {bookingStatus === 'success' && (
                <p style={{ color: 'green' }}>Booking successful! A confirmation email has been sent to your registered email address.</p>
              )}
              {bookingStatus === 'error' && (
                <p style={{ color: 'red' }}>{error || 'Failed to book package. Please try again.'}</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleBookNow}>
            Book Now
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExploreSouthIndia;
