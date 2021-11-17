const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription(
			"View a user's UTDesign Makerspace profile if they have linked their Discord account."
		)
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user to view the profile of')
		),
	ephemeral: true,
	execute: async (interaction) => {
		// Get the member who we want to view the profile of
		// If no member specified, assume the user is viewing their own profile
		let member = interaction.member;
		const memberOption = interaction.options.getUser('user');
		if (memberOption) {
			member = interaction.guild.members.cache.get(memberOption.id);
		}

		let profileEmbed = new Discord.MessageEmbed()
			.setColor('#c1393d')
			.setAuthor(
				member.displayName,
				member.displayAvatarURL({ dynamic: true })
			);

		interaction.editReply({ embeds: [profileEmbed] });
	}
};
