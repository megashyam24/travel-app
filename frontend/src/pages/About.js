import React from 'react';

const About = () => {
  const styles = {
    container: {
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      color: '#ffffff',
      padding: '50px 20px',
      fontFamily: `'Poppins', sans-serif`,
      minHeight: '100vh',
      textAlign: 'center',
    },
    heading: {
      fontSize: '3rem',
      marginBottom: '20px',
      color: '#00ffe7',
      letterSpacing: '2px',
    },
    subheading: {
      fontSize: '1.4rem',
      marginBottom: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.8',
    },
    list: {
      textAlign: 'left',
      maxWidth: '800px',
      margin: '40px auto',
      fontSize: '1.1rem',
      lineHeight: '2',
      background: '#ffffff10',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 0 15px #00ffe7',
    },
    listItem: {
      marginBottom: '10px',
    },
    highlight: {
      color: '#00ffe7',
      fontWeight: 'bold',
    },
    footer: {
      marginTop: '50px',
      fontStyle: 'italic',
      fontSize: '1rem',
      color: '#cccccc',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to TripTales</h1>
      <p style={styles.subheading}>
        Embark on unforgettable adventures with <span style={styles.highlight}>Tourly</span> — your personal travel companion.
        From dreamy honeymoons to wild friend getaways, peaceful devotional trips to family vacations, we design experiences that last a lifetime.
      </p>

      <div style={styles.list}>
        <h2 style={{ color: '#00ffe7' }}>  Our Premium Services</h2>
        <ul>
          <li style={styles.listItem}> Customized <span style={styles.highlight}>Travel Packages</span> for every vibe — Honeymoon, Family, Friends, Bachelor, Devotional, and more!</li>
          <li style={styles.listItem}> Smart <span style={styles.highlight}>Recommendations</span> based on your interests and travel goals</li>
          <li style={styles.listItem}> Seamless <span style={styles.highlight}>Booking Assistance</span> for flights, hotels, activities & more</li>
          <li style={styles.listItem}> Expert <span style={styles.highlight}>Trip Planning</span> — fully personalized itineraries with insider tips</li>
          <li style={styles.listItem}> 24/7 <span style={styles.highlight}>Customer Support</span> — travel with total peace of mind</li>
        </ul>
      </div>

      <p style={styles.footer}>Every Journey has a story - <strong>Triptales</strong> 💙</p>
    </div>
  );
};

export default About;
