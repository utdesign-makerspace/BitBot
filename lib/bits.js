const Transaction = require('../models/transactions');

const giveUserPoints = async (userID, amount) => {
	const transaction = new Transaction({
		userID,
		amount
	});
	transaction.save();
};

const getUserPoints = async (userID) => {
	const transactions = await Transaction.find({ userID });
	return transactions.reduce(
		(acc, transaction) => acc + transaction.amount,
		0
	);
};

module.exports = {
	giveUserPoints,
	getUserPoints
};
