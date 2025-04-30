const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Package } = require('../models/index');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Authenticated user from token:', decoded); // Debug log
    next();
  } catch (err) {
    res.status(403).json({ msg: 'Invalid or expired token.', error: err.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    console.log('User from database:', user); // Debug log
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    if (!user.isAdmin && !req.user.isAdmin) {
      console.log('Admin check failed for user:', user.email, 'Token isAdmin:', req.user.isAdmin);
      return res.status(403).json({ msg: 'Admin access required. Please ensure you registered with shivakumar@gmail.com.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error while checking admin status.', error: err.message });
  }
};

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      isAdmin: email === 'shivakumar@gmail.com', // Updated admin email
    });
    console.log('Saving user:', { email, isAdmin: user.isAdmin }); // Debug log

    await user.save();
    const payload = { id: user.id, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, msg: 'User registered successfully.', isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ msg: 'Server error during registration.', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    const payload = { id: user.id, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for:', email, 'isAdmin:', user.isAdmin); // Debug log
    res.json({ token, msg: 'Login successful.', isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ msg: 'Server error during login.', error: err.message });
  }
});

// Package Routes
router.get('/packages', authenticateToken, async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching packages.', error: err.message });
  }
});

router.post('/packages', authenticateToken, isAdmin, async (req, res) => {
  try {
    const package = new Package(req.body);
    const savedPackage = await package.save();
    res.status(201).json({ package: savedPackage, msg: 'Package added successfully.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error.', error: err.message });
    }
    res.status(500).json({ msg: 'Server error while adding package.', error: err.message });
  }
});

router.put('/packages/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!package) return res.status(404).json({ msg: 'Package not found.' });
    res.json({ package, msg: 'Package updated successfully.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error.', error: err.message });
    }
    res.status(500).json({ msg: 'Server error while updating package.', error: err.message });
  }
});

router.delete('/packages/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);
    if (!package) return res.status(404).json({ msg: 'Package not found.' });
    res.json({ msg: 'Package deleted successfully.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error while deleting package.', error: err.message });
  }
});

module.exports = router;