const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives information about the bot.'),
	ephemeral: true,
	async execute(interaction) {
		const helpEmbed = new Discord.MessageEmbed()
			.setColor('#c1393d')
			.setAuthor(
				'UTDesign Makerspace',
				'https://i.imgur.com/lSwBDLb.png',
				'https://utdmaker.space/'
			)
			.setThumbnail(
				'https://cdn.discordapp.com/avatars/628033792505806868/bea690b7691970aecf066edd9d3c9fe1.png?size=512'
			)
			.setTitle('Bit-Bot v1')
			.setDescription(
				'The UTDesign Makerspace Bot (Bit-Bot) has commands for controlling, monitoring, and learning about the makerspace.'
			)
			.addField(
				'3D Printing',
				'Check the status of printers at any time using /status. Link your Discord and UTDesign Makerspace accounts to receive notifications for your 3D prints.'
			);
		interaction.editReply({ embeds: [helpEmbed], ephemeral: true });
	}
};
