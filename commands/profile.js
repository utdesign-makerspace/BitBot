const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const ldap = require('../lib/ldap');

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

		// Grab the LDAP member
		const ldapMember = await ldap.getUserByDiscord(member.id);

		let profileEmbed = new Discord.MessageEmbed()
			.setColor('#c1393d')
			.setAuthor(
				member.displayName,
				member.displayAvatarURL({ dynamic: true })
			);
		// If there doesn't exist a linked account, add it to the embed
		if (!ldapMember) {
			profileEmbed
				.setTitle('No linked account')
				.setDescription(
					'This user has not linked their Discord account to their UTDesign Makerspace account. For more information, use /link.'
				);
		} else {
			// Otherwise, assuming there is a linked account...
			profileEmbed
				.setTitle(`${ldapMember.givenName} ${ldapMember.sn}`)
				.setDescription('<:MakerspaceOfficer:940693728308379669>')
				.addField('Bits', '1000', true)
				.addField('Total Bits', '100000', true)
				.addField('Membership Status', 'Officer', true)
				.addField('Training', '3D Printing\nLaser Cutting', false)
				.addField('Awards', 'Makerspace Game of the Year 2022', false);
		}

		interaction.editReply({ embeds: [profileEmbed] });
	}
};
