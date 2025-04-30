const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  place: { type: String, required: true },
  sublocation: { type: String },
  timing: { type: String, required: true },
  image: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  details: { type: String },
});

module.exports = mongoose.model('Package', packageSchema);