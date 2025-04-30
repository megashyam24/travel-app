const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  place: { type: String, required: true },
  sublocation: String,
  timing: { type: String, required: true },
  image: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  details: String,
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Package: mongoose.model('Package', packageSchema),
};