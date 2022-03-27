const { SlashCommandBuilder } = require('@discordjs/builders');
const gameModel = require('../lib/models/gameSchema');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('View the leaderboard for a game.')
		.addStringOption((option) =>
			option
				.setName('game')
				.setDescription('The title of the game')
				.setRequired(true)
				.setAutocomplete(true)
		),
	ephemeral: true,
	async execute(interaction) {
		const title = interaction.options.getString('game');

		const embed = new Discord.MessageEmbed()
			.setAuthor({
				name: 'UTDesign Makerspace Arcade',
				iconURL: 'https://i.imgur.com/lSwBDLb.png'
			})
			.setTitle(`${title} - Leaderboard`)
			.setColor('#c1393d');

		let game = await gameModel.findOne({ title: title });
		if (!game) {
			embed.setDescription(
				`No leaderboard found for ${title}. This game may not support UTDesign Makerspace leaderboards.`
			);
			return interaction.editReply({ embeds: [embed] });
		}

		embed.setThumbnail(game.iconURL);
		for (let i = 0; i < game.leaderboardNames.length; i++) {
			embed.addField(
				game.leaderboardNames[i],
				`This leaderboard uses ${game.leaderboardTypes[i]} sorting.`,
				false
			);
		}

		return interaction.editReply({ embeds: [embed] });
	}
};
