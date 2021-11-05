const printers = require('../lib/printers');
const ldap = require('../lib/ldap');
const Discord = require('discord.js');

module.exports = {
	name: 'PrintDone',
	execute: async (data, printerId, client) => {
		const ldapUser = await ldap.getUserByUsername(data.owner, 'discord');

		// If there is no user, we can't do anything. Otherwise, get the user.
		if (!ldapUser || !ldapUser.discord) return;
		const user = await client.users.fetch(ldapUser.discord);
		if (!user) return;

		// Construct our embed.
		const embed = await printers.getEmbedTemplate(printerId);
		embed
			.setTitle('🎉  Print Completed')
			.setDescription(
				`Your print was completed <t:${Math.round(
					Date.now() / 1000
				)}:R>! Please come to the UTDesign Makerspace to pick up your print as soon as possible.`
			)
			.setTimestamp();

		// Add image to embed.
		const snapshotBuffer = await printers.getSnapshotBuffer(printerId);
		let snapshot;
		if (snapshotBuffer) {
			snapshot = new Discord.MessageAttachment(
				snapshotBuffer,
				'snapshot.jpg'
			);
			embed.setImage('attachment://snapshot.jpg');
		}

		// Send the embed to the user.
		await user.send({ embeds: [embed], files: [snapshot] });
	}
};
