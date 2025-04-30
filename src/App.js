import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Admin from './pages/Admin';
import ExploreSouthIndia from './pages/ExploreSouthIndia';
import Bookings from './Bookings';
import Contact from './pages/Contact';

import Login from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    navigate('/auth');
  };

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/auth" replace />;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isAdmin = payload.isAdmin || false;

      if (isAdmin && location.pathname !== '/admin') {
        return <Navigate to="/admin" replace />;
      } else if (!isAdmin && location.pathname === '/admin') {
        return <Navigate to="/home" replace />;
      }
      return children;
    } catch (e) {
      console.error('Token parsing error in PrivateRoute:', e.message);
      return <Navigate to="/auth" replace />;
    }
  };

  return (
    <div className="App">
      {isAuthenticated && <Navigation handleLogout={handleLogout} />}
      <Routes>
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/home" element={<PrivateRoute><Home handleLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/about" element={<PrivateRoute><About handleLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin handleLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/exploresouthindia" element={<PrivateRoute><ExploreSouthIndia handleLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><Bookings handleLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/contact" element={<PrivateRoute><Contact handleLogout={handleLogout} /></PrivateRoute>} />
      </Routes>
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;