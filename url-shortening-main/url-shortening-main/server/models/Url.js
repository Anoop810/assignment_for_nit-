const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
    alias: String,
    clicks: { type: Number, default: 0 },
    sources: [String],  // Array of sources
  });
  

module.exports = mongoose.model('Url', UrlSchema);
