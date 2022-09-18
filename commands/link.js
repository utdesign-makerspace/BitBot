const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const ldap = require('../lib/ldap');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription(
			'Links your Discord account to your UTDesign Makerspace account.'
		)
		.addStringOption((option) =>
			option
				.setName('netid')
				.setDescription('Your NetID')
				.setRequired(true)
		),
	ephemeral: true,
	execute: async (interaction) => {
		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: 'UTDesign Makerspace',
				iconURL: 'https://i.imgur.com/lSwBDLb.png'
			})
			.setColor('#c1393d');

		ldap.getUserByDiscord(interaction.user.id)
			.then((user) => {
				if (user) {
					embed
						.setTitle(`Account Already Linked`)
						.setDescription(
							`Your Discord account is already linked to the UTDesign Makerspace account **${user.uid}**. Please contact an officer if this needs to be changed. For more information, please visit [the BitBot wiki page](https://wiki.utdmaker.space/en/bitbot).`
						);

					const button = new Discord.ButtonBuilder()
						.setLabel('More Information')
						.setURL('https://wiki.utdmaker.space/en/bitbot')
						.setStyle('LINK');
					const buttonRow =
						new Discord.MessageActionRow().addComponents(button);

					interaction.editReply({
						embeds: [embed],
						components: [buttonRow]
					});
				} else {
					const netid = interaction.options.getString('netid');
					ldap.getUserByUsername(netid).then((netidUser) => {
						if (netidUser) {
							ldap.linkUserToDiscord(netid, interaction.user.id);
							embed
								.setTitle(`Account Linked`)
								.setDescription(
									`Your Discord account has been linked to the UTDesign Makerspace account **${netid}**. For more information, please visit [the BitBot wiki page](https://wiki.utdmaker.space/en/bitbot).`
								);
						} else {
							embed
								.setTitle(`Account Not Found`)
								.setDescription(
									`The UTDesign Makerspace account **${netid}** could not be found. For more information, please visit [the BitBot wiki page](https://wiki.utdmaker.space/en/bitbot).`
								);
						}

						const button = new Discord.ButtonBuilder()
							.setLabel('More Information')
							.setURL('https://wiki.utdmaker.space/en/bitbot')
							.setStyle('LINK');
						const buttonRow =
							new Discord.MessageActionRow().addComponents(
								button
							);

						interaction.editReply({
							embeds: [embed],
							components: [buttonRow]
						});
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
};
