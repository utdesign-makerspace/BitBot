const mongoose = require('mongoose');
const UIDGenerator = require('uid-generator');

const gameSchema = new mongoose.Schema({
	title: { type: String, require: true, unique: true },
	secret: {
		type: String,
		require: true,
		unique: true,
		default: function () {
			const uidgen = new UIDGenerator(128, UIDGenerator.BASE16);
			return uidgen.generateSync();
		}
	},
	iconURL: { type: String },
	leaderboardNames: { type: [String], require: true },
	leaderboardTypes: {
		type: [String],
		enum: {
			values: [
				'TimeAscending',
				'TimeDescending',
				'ScoreAscending',
				'ScoreDescending'
			]
		},
		require: true,
		required: function () {
			return this.leaderboardNames.length == this.leaderboardTypes.length;
		}
	}
});

const model = mongoose.model('games', gameSchema);

module.exports = model;
