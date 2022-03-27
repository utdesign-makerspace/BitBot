const cardModel = require('../lib/models/cardSchema');

module.exports = {
	createCard: async function (cometCardId, nId) {
		let card;
		try {
			// If someone is already using that Comet Card, return an error unless
			// the user is the owner of said card.
			card = await cardModel.findOne({ cometCard: cometCardId });
			if (card) {
				if (card.netId == nId) return card;
				else return null;
			}
			// If the user already has a card, edit it to use the new value.
			card = await cardModel.findOne({ discord: discordId });
			if (card) {
				card.cometCard = cometCardId;
				await card.save();
				return card;
			} else {
				// If the user doesn't have a card, create one.
				let cardData = {
					cometCard: cometCardId,
					netId: nId
				};
				card = await cardModel.create(cardData);
				await card.save();
				return card;
			}
		} catch (err) {
			console.log(err);
			return;
		}
	}
};
