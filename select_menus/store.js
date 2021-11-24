const Discord = require('discord.js');
//const constants = require('../lib/constants');
const { getStoreItemByID } = require('../lib/store');
const rewards = require('../lib/rewards');

module.exports = {
	id: 'store',
	execute: async (interaction) => {
		// Grab reward information

		const rewardId = interaction.values[0];
		const reward = await getStoreItemByID(rewardId);
		// Check store embed
		const rewardEmbed = new Discord.MessageEmbed()
			.setColor('#c1393d')
			.setAuthor('UTDesign Makerspace', 'https://i.imgur.com/lSwBDLb.png')
			.setTitle(reward.Title)
			.setDescription(reward.Description)
			.addField('Price', `${reward['Bit Price']} Bits`, true)
			.addField('Pickup', reward.Pickup ? 'Yes' : 'No', true)
			.setThumbnail(reward.Photo[0].url);

		// Create button row
		const redeemButton = new Discord.MessageButton({
			customId: `redeem ${rewardId}`,
			label: 'Redeem',
			style: 'PRIMARY'
		});
		const storeButton = new Discord.MessageButton({
			customId: `returnToStore`,
			label: 'Return to Store',
			style: 'SECONDARY'
		});
		const buttonRow = new Discord.MessageActionRow().addComponents(
			redeemButton,
			storeButton
		);

		// TODO: Disable redeem button if user can not afford the reward

		// Create select menu
		const selectMenu = await rewards.getSelectMenu();
		const selectRow = new Discord.MessageActionRow().addComponents(
			selectMenu
		);

		// Send reward embed
		interaction.update({
			embeds: [rewardEmbed],
			components: [buttonRow, selectRow]
		});
	}
};
