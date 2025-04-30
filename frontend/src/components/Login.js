import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password, confirmPassword } = formData;
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering ? { email, password, confirmPassword } : { email, password };

    try {
      const response = await axios.post(`http://localhost:5002${endpoint}`, payload);
      const { token, refreshToken, email: userEmail, isAdmin } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('email', userEmail);
      setIsAuthenticated(true);
      navigate(isAdmin ? '/admin' : '/home');
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to ${isRegistering ? 'register' : 'login'}: ${err.message}`);
      console.error(`${isRegistering ? 'Registration' : 'Login'} error:`, err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">{isRegistering ? 'Activate Membership' : 'Access TripTales'}</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="login-input"
              placeholder=" "
              required
            />
            <label>Email Address</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              placeholder=" "
              required
            />
            <label>Password</label>
          </div>
          {isRegistering && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="login-input"
                placeholder=" "
                required
              />
              <label>Confirm Password</label>
            </div>
          )}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Processing...' : isRegistering ? 'Activate' : 'Enter'}
            <span></span><span></span><span></span><span></span>
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <p className="toggle-text">
          {isRegistering ? (
            <>Already a member? <span className="toggle-link" onClick={() => setIsRegistering(false)}>Access Now</span></>
          ) : (
            <>New to TripTales? <span className="toggle-link" onClick={() => setIsRegistering(true)}>Activate Membership</span></>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;