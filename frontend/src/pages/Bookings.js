import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = "https://travel-app-bv82.onrender.com"; // ✅ Updated backend URL

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

  const fetchBookings = useCallback(async () => {
    let token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      navigate('/auth');
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Bookings fetched:', response.data);
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Fetch bookings error:', err.response ? err.response.data : err.message);
      if (err.response?.status === 403 && err.response?.data?.message.includes('Token expired')) {
        try {
          token = await refreshAccessToken();
          const retryResponse = await axios.get(`${BACKEND_URL}/api/bookings/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Retry bookings fetch:', retryResponse.data);
          setBookings(retryResponse.data);
          setError(null);
        } catch (refreshErr) {
          setError(refreshErr.message);
          navigate('/auth');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to fetch bookings.');
      }
    }
  }, [navigate]);

  const clearBookings = async () => {
    if (!window.confirm('Are you sure you want to clear all your booking history? This action cannot be undone.')) {
      return;
    }

    let token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      navigate('/auth');
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings([]);
      setError(null);
    } catch (err) {
      console.error('Error clearing bookings:', err.response ? err.response.data : err.message);
      if (err.response?.status === 403 && err.response?.data?.message.includes('Token expired')) {
        try {
          token = await refreshAccessToken();
          await axios.delete(`${BACKEND_URL}/api/bookings/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBookings([]);
          setError(null);
        } catch (refreshErr) {
          setError(refreshErr.message);
          navigate('/auth');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to clear bookings. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="bookings-page">
      <button className="clear-history-button" onClick={clearBookings}>
        Clear History
      </button>
      <h1 className="page-title">Your Bookings</h1>
      <p className="page-description">
        View all your past and upcoming travel bookings with TripTale.
      </p>
      <div className="bookings-container">
        {error && <p className="error-message">{error}</p>}
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking._id} className="booking-card">
              <Card.Img
                variant="top"
                className="card-img"
                src={booking.package.image || 'https://media1.thrillophilia.com/filestore/53njj9nki36qvob2ashdxrpcmd3r_1591171878_shutterstock_1075957706.jpg?w=360&dpr=2'}
                alt={booking.package.name}
              />
              <Card.Body>
                <Card.Title>{booking.package.name}</Card.Title>
                <Card.Text>
                  <p><strong>Location:</strong> {booking.package.place} {booking.package.sublocation && `(${booking.package.sublocation})`}</p>
                  <p><strong>Price:</strong> Rs.{booking.package.price}</p>
                  <p><strong>Travel Date:</strong> {new Date(booking.travelDate).toLocaleDateString()}</p>
                  <p><strong>Return Date:</strong> {new Date(booking.returnDate).toLocaleDateString()}</p>
                  <p><strong>Timing:</strong> {booking.package.timing || 'N/A'}</p>
                  <p><strong>Booked On:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                </Card.Text>
                <Button variant="primary" onClick={() => navigate(`/exploresouthindia`)}>
                  View Package
                </Button>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p className="no-bookings">No bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default Bookings;
