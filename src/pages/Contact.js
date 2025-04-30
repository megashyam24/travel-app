import React, { useState } from 'react';
import './Contact.css';
import contactImage from '../Assets/contact.jpg'; // Correct import

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const namePattern = /^[a-zA-Z\s]+$/;

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const validateData = () => {
    let valid = true;

    if (name.trim() === '') {
      setErrors((errors) => ({ ...errors, name: 'Enter your name here!' }));
      valid = false;
    } else if (!namePattern.test(name)) {
      setErrors((errors) => ({ ...errors, name: 'Enter a valid name' }));
      valid = false;
    } else {
      setErrors((errors) => ({ ...errors, name: '' }));
    }

    if (email.trim() === '') {
      setErrors((errors) => ({ ...errors, email: 'Enter email address!' }));
      valid = false;
    } else if (!emailPattern.test(email)) {
      setErrors((errors) => ({ ...errors, email: 'This is not a valid email format' }));
      valid = false;
    } else {
      setErrors((errors) => ({ ...errors, email: '' }));
    }

    if (message.trim() === '') {
      setErrors((errors) => ({ ...errors, message: 'Enter your message' }));
      valid = false;
    } else {
      setErrors((errors) => ({ ...errors, message: '' }));
    }

    if (valid) {
      alert('Form submitted successfully!');
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="contact-container">
      <h1 className="contact-heading">Connect With Us</h1>
      <div className="contact-content">
        <div className="contact-left">
          <img src={contactImage} alt="Contact Us" className="contact-image" />
        </div>
        <div className="contact-right">
          <h3>Contact Us</h3>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="error">{errors.name}</p>
          </div>
          <div className="form-group">
            <label>User Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="error">{errors.email}</p>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="error">{errors.message}</p>
          </div>
          <button onClick={validateData}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
