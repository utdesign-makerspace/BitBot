const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const ldap = require('../lib/ldap');
const constants = require('../lib/constants');

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

			// Grab their groups
			const groups = await ldap.getGroupsByUsername(ldapMember.cn);

			// Create the base embed
			profileEmbed
				.setTitle(`${ldapMember.givenName} ${ldapMember.sn}`)
				.addField('Bits', 'WIP', true)
				.addField('Total Bits', 'WIP', true);

			// Add membership status
			if (member.roles.cache.some((role) => role.name == 'Staff'))
				profileEmbed.addField('Membership Status', 'Staff', true);
			else if (member.roles.cache.some((role) => role.name == 'Officer'))
				profileEmbed.addField('Membership Status', 'Officer', true);
			else if (
				member.roles.cache.some((role) =>
					role.name.includes('Committee')
				)
			)
				profileEmbed.addField(
					'Membership Status',
					'Committee Member',
					true
				);
			else profileEmbed.addField('Membership Status', 'Member', true);

			// Add trainings
			let trainings = '';
			if (groups.some((group) => group.cn === 'trained-3dprinting'))
				trainings += '3D Printing\n';
			if (groups.some((group) => group.cn === 'trained-lasercutting'))
				trainings += 'Laser Cutting\n';
			if (trainings) profileEmbed.addField('Training', trainings, false);

			// Add awards
			// NEEDS TO BE ADDED, WAITING ON LDAP CHANGES
			// profileEmbed.addField(
			// 	'Awards',
			// 	'Makerspace Game of the Year 2022',
			// 	false
			// );

			// Add badges
			// AWARD AND DONOR NEED TO BE ADDED
			let badges = '';
			if (
				member.roles.cache.some(
					(role) => role.name == 'Staff' || role.name == 'Officer'
				)
			)
				badges += '<:MakerspaceOfficer:940693728308379669> ';
			else if (
				member.roles.cache.some((role) =>
					role.name.includes('Committee')
				)
			)
				badges += '<:CommitteeMember:941081405507633162> ';
			if (groups.some((group) => group.cn === 'arcadedev'))
				badges += '<:ArcadeGameDeveloper:941081405297942649> ';
			if (constants.contributors.includes(member.id))
				badges += '<:BitBotContributor:941081405650251827> ';
			profileEmbed.setDescription(badges);
		}
		interaction.editReply({ embeds: [profileEmbed] });
	}
};
