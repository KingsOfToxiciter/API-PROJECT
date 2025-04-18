const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  category: String,
  link: String
});

module.exports = mongoose.model('Link', linkSchema);
