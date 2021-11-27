const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
	{
		userID: {
			type: String,
			required: true
		},
		amount: {
			type: Number,
			required: true
		}
	},
	{ timestamps: true }
);

const model = mongoose.model('Transaction', transactionSchema);

module.exports = model;
