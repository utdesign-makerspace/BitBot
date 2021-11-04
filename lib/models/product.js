const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  price: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  brand: { type: String, required: true },
  rating: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

const model = mongoose.model('products', productSchema);

module.exports = model;
