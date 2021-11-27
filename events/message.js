const { arrayShuffle } = require('../lib/utils');
const { giveUserPoints, getUserPoints } = require('../lib/bits');
module.exports = {
	event: 'messageCreate',
	async execute(interaction) {
		if (interaction.author.bot) return;
		console.log(interaction.content);
		console.log(await getUserPoints(interaction.author.id));
	}
};

const awardPointForMessage = async (interaction) => {
	if (shouldMessageBeAwarded(interaction.author.id)) {
		giveUserPoints(interaction.author.id, 0.1);
		interaction.react('🪙');
	}
};

// Chance will be 1/n percentage chance of being awarded
function shouldMessageBeAwarded(chance = 30) {
	let chances = new Array(chance - 1).fill(0);
	chances.push(1);
	chances = arrayShuffle(chances);
	return Math.floor(Math.random() * chances.length) == 1;
}
