const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
	cometCard: { type: String, require: true, unique: true }, // The Comet Card ID obtained from the Arcade Utilities
	netId: { type: String, require: true, unique: true } // The NetID of the user
});

const model = mongoose.model('cards', cardSchema);

module.exports = model;
