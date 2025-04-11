import { SlashCommandBuilder } from 'discord.js';
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
				url: 'https://utd.ms/'
			})
			.setThumbnail('https://i.imgur.com/lSwBDLb.png')
			.setTitle('BitBot')
			.setDescription(
				'BitBot is the official UTDesign Makerspace Discord bot. It has commands for controlling, monitoring, and learning more about the Makerspace.'
			)
			.addFields({
				name: '3D Printing',
				value: 'Check the status of printers at any time using /status. Link your Discord and UTDesign Makerspace accounts using /link to receive notifications for your 3D prints.'
			})
			.addFields({
				name: 'Profiles',
				value: 'Link your Makerspace account using /link. You can view a profile using /profile with a Discord or Makerspace user.'
			})
			.addFields({
				name: 'Snippets',
				value: 'Share answers to commonly asked questions using /snippet. You can post a snippet using /snippet with its name.'
			});
		interaction.editReply({ embeds: [helpEmbed] });
	}
};
