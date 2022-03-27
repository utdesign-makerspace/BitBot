const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const ldap = require('../lib/ldap');
const leaderboard = require('../lib/leaderboard');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Linking commands')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('makerspace')
				.setDescription('Checks your UTDesign Makerspace account link.')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('cometcard')
				.setDescription('Assigns a Comet Card to your account.')
				.addStringOption((option) =>
					option
						.setName('id')
						.setDescription(
							'The ID generated by the Arcade Utilities, NOT a UTD ID'
						)
						.setRequired(true)
				)
		),
	ephemeral: true,
	execute: async (interaction) => {
		const embed = new Discord.MessageEmbed()
			.setAuthor({
				name: 'UTDesign Makerspace',
				iconURL: 'https://i.imgur.com/lSwBDLb.png'
			})
			.setColor('#c1393d');
		const sub = interaction.options.getSubcommand();

		ldap.getUserByDiscord(interaction.user.id)
			.then(async (user) => {
				const button = new Discord.MessageButton()
					.setLabel('More Information')
					.setURL('https://wiki.utdmaker.space/en/bitbot')
					.setStyle('LINK');
				const buttonRow = new Discord.MessageActionRow().addComponents(
					button
				);

				if (!user) {
					embed
						.setTitle(`Account Not Linked`)
						.setDescription(
							`Your Discord account is not linked to a UTDesign Makerspace account. For information on how to link your accounts and how this can benefit you, please visit [the BitBot wiki page](https://wiki.utdmaker.space/en/bitbot).`
						);

					return interaction.editReply({
						embeds: [embed],
						components: [buttonRow]
					});
				} else if (sub == 'makerspace') {
					if (user) {
						embed
							.setTitle(`Account Linked`)
							.setDescription(
								`Your Discord account is linked to the UTDesign Makerspace account **${user.cn}**. For information on how this can benefit you, please visit [the BitBot wiki page](https://wiki.utdmaker.space/en/bitbot).`
							);
					}

					interaction.editReply({
						embeds: [embed],
						components: [buttonRow]
					});
				} else if (sub == 'cometcard') {
					const id = interaction.options.getString('id');

					if (id.startsWith('AC') && id.length >= 3) {
						cometCard = id.toUpperCase().substring(2);

						const card = await leaderboard.createCard(
							cometCard,
							interaction.user.id,
							user.cn
						);
						if (card) {
							ldap.assignCometCardByUsername(user.cn, cometCard);

							embed
								.setTitle(`Success`)
								.setDescription(
									'Your Comet Card has been linked.'
								);
						} else {
							embed
								.setTitle(`Failure`)
								.setDescription(
									'You are attempting to register an already registered Comet Card.'
								);
						}
					} else {
						embed
							.setTitle(`Failure`)
							.setDescription(
								'Please use the Arcade Utilities app on the arcade cabinet for more information.'
							);
					}

					interaction.editReply({
						embeds: [embed]
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
};
