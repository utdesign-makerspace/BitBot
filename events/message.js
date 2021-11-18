const { arrayShuffle } = require('../lib/utils');
module.exports = {
	event: 'messageCreate',
	async execute(interaction) {
		if (interaction.author.bot) return;
		await awardPointForMessage(interaction);
	}
};

const awardPointForMessage = async (interaction) => {
	if (shouldMessageBeAwarded(interaction.author.id)) {
		interaction.react('🪙');
	}
};

// Chance will be 1/n percentage chance of being awarded
function shouldMessageBeAwarded(authorID, chance = 30) {
	let chances = new Array(chance - 1).fill(0);
	chances.push(1);
	chances = arrayShuffle(chances);
	if (Math.floor(Math.random() * chances.length) == 1) {
		//TRANSACTIONS.push({ id, amount: 0.1 });
	}
}
