import printers = require('../lib/printers');
import ldap = require('../lib/ldap');
import * as Discord from 'discord.js';

module.exports = {
	name: 'PrintPaused',
	execute: async (data: any, printerId: string, client: Discord.Client) => {
		const ldapUser = await ldap.getUserByUsername(data.owner, ['discord']);

		// If there is no user, we can't do anything. Otherwise, get the user.
		if (ldapUser && ldapUser.discord) {
			const user = await client.users.fetch(ldapUser.discord as string);
			if (user) {
				// Construct our embed.
				const embed = await printers.getEmbedTemplate(printerId);
				embed
					.setTitle('🍝  Print Paused')
					.setDescription(
						`Your print was paused <t:${Math.round(
							Date.now() / 1000
						)}:R>. This usually happens because a spaghetti printing fail was detected. Please come to the UTDesign Makerspace to either resume or cancel your print as soon as possible.`
					)
					.setTimestamp()
					.setColor('#fdcb58');

				// Add image to embed.
				const snapshotBuffer = await printers.getSnapshotBuffer(
					printerId
				);
				let snapshot;
				if (snapshotBuffer) {
					snapshot = new Discord.AttachmentBuilder(snapshotBuffer, {
						name: 'snapshot.jpg'
					});
					embed.setImage('attachment://snapshot.jpg');
				}

				// Send the embed to the user.
				await user
					.send({
						embeds: [embed],
						files: snapshot ? [snapshot] : []
					})
					.catch(() => {
						// If the user is not accepting DMs, we can't send them the message.
						console.log(
							"Couldn't send message to user: " + user.username
						);
					});
			}
		}

		printers.updateWatcher(printerId, client);
	}
};
