const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
	secret: { type: String, require: true },
	netId: { type: String, require: true },
	scores: {
		type: [Number],
		require: true
	},
	data: { type: Object }
});

const model = mongoose.model('playerData', playerSchema);

module.exports = model;
