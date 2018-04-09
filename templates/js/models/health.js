const mongoose = require('mongoose');

const healthSchema = new mongoose.Schema({
  timestamp: { type: Number, required: true }
});

module.exports = mongoose.model('Health', healthSchema);
