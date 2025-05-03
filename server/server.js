const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = express();

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());

const { MONGO_URI, JWT_SECRET, PORT, GMAIL_APP_PASSWORD } = process.env;
const port = PORT || 5002;

// Log environment variables for debugging (remove in production)
console.log('Environment variables:', {
  MONGO_URI,
  JWT_SECRET,
  PORT,
  GMAIL_APP_PASSWORD: GMAIL_APP_PASSWORD ? '[REDACTED]' : undefined,
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'info.triptale@gmail.com',
    pass: GMAIL_APP_PASSWORD || 'pwjw eeqj xeql rrha',
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) console.error('Nodemailer setup error:', error.message);
  else console.log('Nodemailer ready to send emails');
});

// MongoDB connection
mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/travel-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

// Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});
const User = mongoose.model('User', UserSchema);

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  place: { type: String, required: true },
  sublocation: String,
  image: { type: String, required: true },
  timing: { type: String, required: true },
  details: String,
});
const Package = mongoose.model('Package', PackageSchema);

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  bookingDate: { type: Date, default: Date.now },
  travelDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
});
const Booking = mongoose.model('Booking', BookingSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET || 'e238b851cbecf3cd9efaf6d5a4bc8b67734d25aa6c1563ec2362c54f56b586f3', (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message, 'Token:', token.substring(0, 10) + '...');
      return res.status(403).json({ 
        message: err.name === 'TokenExpiredError' ? 'Token expired, please refresh or re-login' : 'Invalid token',
        error: err.message 
      });
    }
    console.log('Token verified, user:', user);
    req.user = user;
    next();
  });
};

// Packages Endpoint (Without authentication)
app.get('/api/auth/packages', async (req, res) => {
  console.log('Fetching packages without authentication');
  try {
    const packages = await Package.find();
    console.log('Packages query result:', packages.length, 'packages');
    if (!packages || packages.length === 0) {
      return res.status(404).json({ msg: 'No packages found' });
    }
    res.json(packages);
  } catch (err) {
    console.error('Error fetching packages:', err.stack);
    res.status(500).json({ msg: 'Failed to fetch packages', error: err.message });
  }
});

// Add Package Endpoint (Without authentication)
app.post('/api/auth/add-package', async (req, res) => {
  try {
    const { name, price, place, sublocation, image, timing, details } = req.body;
    const newPackage = new Package({ name, price, place, sublocation, image, timing, details });
    await newPackage.save();
    res.json({ msg: 'Package added successfully', package: newPackage });
  } catch (err) {
    console.error('Error adding package:', err.message);
    res.status(500).json({ msg: 'Failed to add package', error: err.message });
  }
});

// Update Package Endpoint (Without authentication)
app.put('/api/auth/update-package/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, place, sublocation, image, timing, details } = req.body;
    const updatedPackage = await Package.findByIdAndUpdate(id, { name, price, place, sublocation, image, timing, details }, { new: true, runValidators: true });
    if (!updatedPackage) {
      return res.status(404).json({ msg: 'Package not found' });
    }
    res.json({ msg: 'Package updated successfully', package: updatedPackage });
  } catch (err) {
    console.error('Error updating package:', err.message);
    res.status(500).json({ msg: 'Failed to update package', error: err.message });
  }
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET || 'e238b851cbecf3cd9efaf6d5a4bc8b67734d25aa6c1563ec2362c54f56b586f3', { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET + '_refresh', { expiresIn: '7d' });
    res.json({ token, refreshToken, email });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET || 'e238b851cbecf3cd9efaf6d5a4bc8b67734d25aa6c1563ec2362c54f56b586f3', { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET + '_refresh', { expiresIn: '7d' });
    res.json({ token, refreshToken, email });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Refresh Token Endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    console.log('No refresh token provided');
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET + '_refresh');
    console.log('Refresh token verified, user:', decoded);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for refresh token:', decoded.id);
      return res.status(404).json({ message: 'User not found' });
    }
    const newToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
    console.log('New access token generated for user:', user._id);
    res.json({ token: newToken });
  } catch (err) {
    console.log('Refresh token verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid or expired refresh token', error: err.message });
  }
});

// Booking Endpoint
app.post('/api/bookings', authenticateToken, async (req, res) => {
  console.log('Booking request received:', req.body, 'JWT payload:', req.user);
  const { packageId, travelDate, returnDate } = req.body;
  const userId = req.user.id;

  try {
    if (!packageId || !travelDate || !returnDate) {
      console.log('Missing required fields:', { packageId, travelDate, returnDate });
      return res.status(400).json({ message: 'packageId, travelDate, and returnDate are required' });
    }

    if (new Date(returnDate) < new Date(travelDate)) {
      console.log('Invalid date range:', { travelDate, returnDate });
      return res.status(400).json({ message: 'Return date must be after travel date' });
    }

    console.log('Validating package:', packageId);
    const selectedPackage = await Package.findById(packageId);
    console.log('Package query result:', selectedPackage ? selectedPackage.name : 'null');
    if (!selectedPackage) {
      console.log('Package not found:', packageId);
      return res.status(404).json({ message: 'Package not found' });
    }

    console.log('Fetching user:', userId);
    const user = await User.findById(userId);
    console.log('User query result:', user ? { email: user.email, id: user._id } : 'null');
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User email fetched:', user.email || 'undefined');
    if (!user.email) {
      console.log('User email is missing or invalid:', user);
      return res.status(400).json({ message: 'User email is missing or invalid' });
    }

    console.log('Creating booking for user:', userId);
    const booking = new Booking({
      user: userId,
      package: packageId,
      travelDate: new Date(travelDate),
      returnDate: new Date(returnDate),
    });
    await booking.save();
    console.log('Booking saved:', booking._id);

    console.log('Preparing to send email to:', user.email);
    const mailOptions = {
      from: '"TripTale" <info.triptale@gmail.com>',
      to: user.email,
      subject: `Booking Confirmation: ${selectedPackage.name}`,
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi there,</p>
        <p>Thank you for booking the <strong>${selectedPackage.name}</strong> package with TripTale.</p>
        <p><strong>Location:</strong> ${selectedPackage.place} ${selectedPackage.sublocation || ''}</p>
        <p><strong>Price:</strong> Rs.${selectedPackage.price}</p>
        <p><strong>Travel Date:</strong> ${new Date(booking.travelDate).toLocaleDateString()}</p>
        <p><strong>Return Date:</strong> ${new Date(booking.returnDate).toLocaleDateString()}</p>
        <p><strong>Timing:</strong> ${selectedPackage.timing || 'N/A'}</p>
        <p>We look forward to making your trip memorable!</p>
        <br/>
        <p>Regards,<br/>TripTale Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email successfully sent to:', user.email);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message, emailErr.stack);
      return res.status(500).json({ message: 'Booking saved but failed to send email', error: emailErr.message });
    }

    console.log('Booking successful');
    res.status(200).json({ message: 'Booking confirmed and email sent', booking });
  } catch (err) {
    console.error('Booking error:', err.message, err.stack);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

// Get User Bookings Endpoint
app.get('/api/bookings/user', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('package');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err.message);
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

// Delete User Bookings Endpoint
app.delete('/api/bookings/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Deleting bookings for user:', userId);
    const result = await Booking.deleteMany({ user: userId });
    console.log('Deletion result:', result);
    if (result.deletedCount === 0) {
      console.log('No bookings found to delete for user:', userId);
      return res.status(200).json({ message: 'No bookings found to delete' });
    }
    res.status(200).json({ message: 'All bookings deleted successfully' });
  } catch (err) {
    console.error('Error deleting bookings:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to delete bookings', error: err.message });
  }
});

// Test Email Endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: '"TripTale" <info.triptale@gmail.com>',
      to: 'test@example.com', // Replace with a valid test email
      subject: 'Test Email',
      html: '<p>This is a test email from TripTale.</p>',
    });
    console.log('Test email sent');
    res.json({ message: 'Test email sent' });
  } catch (err) {
    console.error('Test email error:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.stack);
  res.status(500).json({ msg: 'Internal server error', error: err.message });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
