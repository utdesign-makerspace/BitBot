const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
	title: { type: String, require: true, unique: true }, // The title of the snippet
	body: { type: String, require: true } // The body, or main text, of the snippet
});

const model = mongoose.model('snippets', snippetSchema);

module.exports = model;
