import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, NavLink } from 'react-router-dom';
import triptalesLogo from '../Assets/triptales.png'; // Your logo image

const Navigation = ({ handleLogout }) => {
  return (
    <Navbar expand="lg" className="bg-light shadow-sm" style={{ padding: '10px 20px' }}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/home">
          <img
            src={triptalesLogo}
            alt="TripTales Logo"
            height="60"
            style={{ borderRadius: '0px' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '120px' }} navbarScroll>
            <NavLink className="nav-link" to="/home" style={{ color: '#0d6efd', fontWeight: '500' }}>
              Home
            </NavLink>
            <NavDropdown title="Packages" id="navbarScrollingDropdown" style={{ color: '#0d6efd', fontWeight: '500' }}>
              <NavDropdown.Item as={Link} to="/exploresouthindia" style={{ color: '#0d6efd' }}>
                Explore
              </NavDropdown.Item>
            </NavDropdown>
            <NavLink className="nav-link" to="/bookings" style={{ color: '#0d6efd', fontWeight: '500' }}>
              Bookings
            </NavLink>
            <Nav.Link
              as="a"
              href="http://localhost:5000/"
              style={{ color: '#0d6efd', fontWeight: '500' }}
            >
            SmartGenie
            </Nav.Link>
            <NavLink className="nav-link" to="/about" style={{ color: '#0d6efd', fontWeight: '500' }}>
              About
            </NavLink>
            <NavLink className="nav-link" to="/contact" style={{ color: '#0d6efd', fontWeight: '500' }}>
              Contact
            </NavLink>
          </Nav>
          <Nav>
            <button
              onClick={handleLogout}
              className="auth-button"
              style={{
                padding: '8px 15px',
                margin: 0,
                background: '#ff4444',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: '6px',
                fontWeight: 'bold',
                boxShadow: '0 0 10px rgba(255, 68, 68, 0.7)',
              }}
            >
              Logout
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;