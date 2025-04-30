const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/auth');
const Package = require('../models/Package');

router.post('/bookings', authMiddleware, async (req, res) => {
  const { packageId, email } = req.body;

  try {
    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info.triptale@gmail.com',
        pass: 'pwyn vzmu dwbc coaq', // Replace with a secure app password
      },
    });

    const mailOptions = {
      from: 'info.triptale@gmail.com',
      to: email,
      subject: `Booking Confirmation: ${selectedPackage.name}`,
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi there,</p>
        <p>Thank you for booking the <strong>${selectedPackage.name}</strong> package with TripTale.</p>
        <p><strong>Location:</strong> ${selectedPackage.place} ${selectedPackage.sublocation || ''}</p>
        <p><strong>Price:</strong> Rs.${selectedPackage.price}</p>
        <p><strong>Timing:</strong> ${selectedPackage.timing || 'N/A'}</p>
        <p>We look forward to making your trip memorable!</p>
        <br/>
        <p>Regards,<br/>TripTale Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Booking confirmed and email sent' });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

module.exports = router;
