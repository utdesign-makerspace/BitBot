const constants = require('../lib/constants');
const { buyItem } = require('../lib/store');

module.exports = {
	id: 'redeem',
	async execute(interaction, args) {
		await interaction.deferUpdate();

		// Grab the reward
		const rewardId = args[0];
		const reward = constants.rewards[rewardId];

		// TODO: Check if user can afford the reward with bits. Then create a transaction in the database.
		await buyItem(reward.id, interaction.author.id);
		// Tell user they have redeemed a reward
		await interaction.editReply({
			content: `Your ${reward.Title} has been redeemed. Please pick it up as soon as possible if required.`,
			embeds: [],
			components: []
		});
	}
};
