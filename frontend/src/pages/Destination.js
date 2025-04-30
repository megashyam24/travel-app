import React from 'react';

const Destination = () => {
  const destinations = [
    { name: 'North India', path: '/explorenorthindia' },
    { name: 'South India', path: '/exploresouthindia' },
  ];

  return (
    <div className="destination">
      <h1>Explore Destinations</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        {destinations.map((dest, index) => (
          <div key={index} style={{ margin: '20px', textAlign: 'center' }}>
            <h3>{dest.name}</h3>
            <a href={dest.path} style={{ color: '#03e9f4' }}>Explore Now</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destination;