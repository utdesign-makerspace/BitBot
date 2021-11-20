const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('store')
		.setDescription('Opens the bit redemption store.'),
	ephemeral: true,
	execute: async (interaction) => {
		// Create the base store embed that tells the user what they can do.
		const storeEmbed = new Discord.MessageEmbed()
			.setColor('#c1393d')
			.setAuthor('UTDesign Makerspace', 'https://i.imgur.com/lSwBDLb.png')
			.setTitle('Welcome to the UTDesign Makerspace store!')
			.setDescription(
				'Browse the store by selecting an item from the select menu below. You will see a preview of the item, a purchase button, and a gift button.'
			)
			.addField(
				'💳  Redeeming Items',
				`As long as you have the bits, you can redeem any item available in the store. Click the "Redeem" button and you will receive more information on retrieving your item.`
			)
			.addField(
				'⏰  Redemption Limit',
				'You are limited to one redemption per 24 hours.'
			)
			.addField(
				'❌  No Returns, Real-World Currency, or Trades',
				'All redemptions are final. We do not accept real-world currency (ex. USD, Ethereum, etc.) or items (ex. filament, technology, etc.) in exchange for rewards.'
			);

		interaction.editReply({ embeds: [storeEmbed] });
	}
};
