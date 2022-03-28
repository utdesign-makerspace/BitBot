const { SlashCommandBuilder } = require('@discordjs/builders');
const gameModel = require('../lib/models/gameSchema');
const playerModel = require('../lib/models/playerSchema');
const leaderboard = require('../lib/leaderboard');
const ldap = require('../lib/ldap');
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

		playerModel
			.find({ secret: game.secret })
			.exec(async (err, playerData) => {
				players = playerData.map((p) => {
					return {
						netId: p.netId,
						scores: p.scores
					};
				});

				embed.setThumbnail(game.iconURL);
				for (let i = 0; i < game.leaderboardNames.length; i++) {
					scores = players
						.map((p) => {
							return {
								netId: p.netId,
								score: p.scores[i]
							};
						})
						.sort((a, b) => {
							return b.score - a.score;
						});

					if (game.leaderboardTypes[i].includes('Ascending'))
						scores.reverse();

					content = `This leaderboard uses ${game.leaderboardTypes[i]} sorting.`;

					const isTime = game.leaderboardTypes[i].includes('Time');

					for (let j = 0; j < 5; j++) {
						if (j >= scores.length) break;

						let ldapUser = await ldap.getUserByUsername(
							scores[j].netId
						);
						if (!isTime)
							content += `\n${scores[j].score} - ${
								ldapUser
									? `<@${ldapUser.discord}>`
									: scores[j].netId
							}`;
						else
							content += `\n${leaderboard.formatAsTime(
								scores[j].score
							)} - ${
								ldapUser
									? `<@${ldapUser.discord}>`
									: scores[j].netId
							}`;
					}

					embed.addField(game.leaderboardNames[i], content, false);
				}

				return interaction.editReply({ embeds: [embed] });
			});
	}
};
