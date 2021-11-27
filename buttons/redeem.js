const constants = require('../lib/constants');
const { buyItem, getStoreItemByID } = require('../lib/store');

module.exports = {
	id: 'redeem',
	async execute(interaction, args) {
		await interaction.deferUpdate();

		// Grab the reward
		const rewardId = args[0];

		const reward = await getStoreItemByID(rewardId);
		console.log(JSON.stringify(reward));
		// TODO: Check if user can afford the reward with bits. Then create a transaction in the database.

		const status = await buyItem(rewardId, interaction.member.id);
		if (!status.success) {
			await interaction.send(
				`You do not have enough points to purchase this item.`
			);
			return;
		}
		// Tell user they have redeemed a reward
		await interaction.editReply({
			content: `Your ${reward.Title} has been redeemed. Please pick it up as soon as possible if required.`,
			embeds: [],
			components: []
		});
	}
};
