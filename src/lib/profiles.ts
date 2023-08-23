import * as Discord from 'discord.js';
import ldap = require('../lib/ldap');
import constants = require('../lib/constants');

// NOTE: All methods assume message will NOT be ephemeral. You will need to add that yourself.

export async function displayProfile(
	interaction: Discord.Interaction
): Promise<void> {
	if (
		!interaction.isContextMenuCommand() &&
		!interaction.isChatInputCommand()
	)
		return;

	// Get the member who we want to view the profile of
	// If no member specified, assume the user is viewing their own profile
	let user = interaction.options.getUser('user');
	if (!user) user = interaction.user;
	let member = await interaction.guild?.members.fetch(user.id);

	let netId: string | undefined = undefined;
	if (interaction.isChatInputCommand())
		netId = interaction.options.getString('netid') ?? undefined;

	// Grab the LDAP member
	const ldapMember = netId
		? await ldap.getUserByUsername(netId)
		: await ldap.getUserByDiscord(member?.id ?? '');

	let profileEmbed = new Discord.EmbedBuilder().setColor('#c1393d');
	// If there doesn't exist a linked account, add it to the embed
	if (!ldapMember || (netId && !ldapMember.discord)) {
		profileEmbed
			.setTitle('No linked account')
			.setDescription(
				'This user has not linked their Discord account to their UTDesign Makerspace account. For more information, use /link.'
			)
			.setAuthor({
				name: netId ?? member?.displayName ?? 'Unknown member name',
				iconURL: netId
					? 'https://i.imgur.com/cpP1gDT.png'
					: member?.displayAvatarURL()
			});
	} else {
		// Otherwise, assuming there is a linked account...

		// Set new member if netId was specified
		if (netId)
			member = await interaction.guild?.members.fetch(
				ldapMember.discord as string
			);
		profileEmbed.setAuthor({
			name: member?.displayName ?? 'Unknown member name',
			iconURL: member?.displayAvatarURL()
		});

		// Grab their groups
		const groups = await ldap.getGroupsByUsername(
			netId ?? (ldapMember.uid as string)
		);

		// Create the base embed
		profileEmbed.setTitle(`${ldapMember.cn}`);

		// Add membership status
		if (member?.roles.cache.some((role) => role.name == 'Staff'))
			profileEmbed.addFields({
				name: 'Membership Status',
				value: 'Staff',
				inline: true
			});
		else if (member?.roles.cache.some((role) => role.name == 'Officer'))
			profileEmbed.addFields({
				name: 'Membership Status',
				value: 'Officer',
				inline: true
			});
		else if (
			member?.roles.cache.some((role) => role.name.includes('Committee'))
		)
			profileEmbed.addFields({
				name: 'Membership Status',
				value: 'Committee Member',
				inline: true
			});
		else
			profileEmbed.addFields({
				name: 'Membership Status',
				value: 'Member',
				inline: true
			});

		// Add trainings
		let trainings = '';
		if (groups.some((group) => group.cn === 'trained-3dprinting'))
			trainings += '3D Printing\n';
		if (groups.some((group) => group.cn === 'trained-laser'))
			trainings += 'Laser Cutting\n';
		if (groups.some((group) => group.cn === 'trained-resin'))
			trainings += 'Resin Printing\n';
		if (groups.some((group) => group.cn === 'trained-vr'))
			trainings += 'Virtual Reality\n';
		if (trainings)
			profileEmbed.addFields({
				name: 'Training',
				value: trainings,
				inline: false
			});

		// Add awards
		// NEEDS TO BE ADDED, WAITING ON LDAP CHANGE TO ADD AWARDS STRING
		// profileEmbed.addFields({
		// 	name: 'Awards',
		// 	value: 'Makerspace Game of the Year 2022',
		// 	inline: false
		// });

		// Add badges
		// NEEDS MORE FEATURES, WAITING ON LDAP CHANGE TO ADD AWARDS STRING AND DONATION AMOUNT
		let badges = '';
		if (
			member?.roles.cache.some(
				(role) => role.name == 'Staff' || role.name == 'Officer'
			)
		)
			badges += '<:MakerspaceOfficer:940693728308379669> ';
		else if (
			member?.roles.cache.some((role) => role.name.includes('Committee'))
		)
			badges += '<:CommitteeMember:941081405507633162> ';
		if (groups.some((group) => group.cn === 'arcadedev'))
			badges += '<:ArcadeGameDeveloper:941081405297942649> ';
		if (constants.contributors.includes(member?.id ?? ''))
			badges += '<:BitBotContributor:941081405650251827> ';
		profileEmbed.setDescription(badges);
	}
	interaction.editReply({ embeds: [profileEmbed] });
}
