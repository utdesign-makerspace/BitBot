const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const ldap = require('../lib/ldap');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Checks your UTDesign Makerspace account link.'),
	ephemeral: true,
	execute: async (interaction) => {
		const embed = new Discord.MessageEmbed()
			.setAuthor('UTDesign Makerspace', 'https://i.imgur.com/lSwBDLb.png')
			.setColor('#c1393d');

		ldap.getUserByDiscord(interaction.user.id)
			.then((user) => {
				if (user) {
					embed
						.setTitle(`Account Linked`)
						.setDescription(
							`Your Discord account is linked to the UTDesign Makerspace account **${user.cn}**. For information on how this can benefit you, please visit [the BitBot wiki page](https://wiki.utdmaker.space/en/bitbot).`
						);
				} else {
					embed
						.setTitle(`Account Not Linked`)
						.setDescription(
							`Your Discord account is not linked to a UTDesign Makerspace account. For information on how to link your accounts and how this can benefit you, please visit [the BitBot wiki page](https://wiki.utdmaker.space/en/bitbot).`
						);
				}

				const button = new Discord.MessageButton()
					.setLabel('More Information')
					.setURL('https://wiki.utdmaker.space/en/bitbot')
					.setStyle('LINK');
				const buttonRow = new Discord.MessageActionRow().addComponents(
					button
				);

				interaction.editReply({
					embeds: [embed],
					components: [buttonRow]
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}
};
