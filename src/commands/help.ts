import { SlashCommandBuilder } from '@discordjs/builders';
import * as Discord from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives information about the bot.'),
	ephemeral: true,
	async execute(interaction: Discord.ChatInputCommandInteraction) {
		const helpEmbed = new Discord.EmbedBuilder()
			.setColor('#c1393d')
			.setAuthor({
				name: 'UTDesign Makerspace',
				iconURL: 'https://i.imgur.com/lSwBDLb.png',
				url: 'https://utdmaker.space/'
			})
			.setThumbnail('https://i.imgur.com/lSwBDLb.png')
			.setTitle('BitBot')
			.setDescription(
				'BitBot is the official UTDesign Makerspace Discord bot. It has commands for controlling, monitoring, and learning more about the Makerspace.'
			)
			.addFields({
				name: '3D Printing',
				value: 'Check the status of printers at any time using /status. Link your Discord and UTDesign Makerspace accounts using /link to receive notifications for your 3D prints.'
			});
		interaction.editReply({ embeds: [helpEmbed] });
	}
};
