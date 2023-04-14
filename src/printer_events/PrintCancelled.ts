import printers = require('../lib/printers');
import ldap = require('../lib/ldap');
import * as Discord from 'discord.js';

module.exports = {
	name: 'PrintCancelled',
	execute: async (data: any, printerId: string, client: Discord.Client) => {
		const ldapUser = await ldap.getUserByUsername(data.owner, ['discord']);

		// If there is no user, we can't do anything. Otherwise, get the user.
		if (ldapUser && ldapUser.discord) {
			const user = await client.users.fetch(ldapUser.discord as string);
			if (user) {
				// Construct our embed.
				const embed = await printers.getEmbedTemplate(printerId);
				embed
					.setTitle('⚠  Print Cancelled')
					.setDescription(
						`Your print was cancelled <t:${Math.round(
							Date.now() / 1000
						)}:R>. This can happen for a variety of reasons, such as spaghetti being detected or your print violating our rules. Please come to the UTDesign Makerspace to clean up the printer as soon as possible.`
					)
					.setTimestamp()
					.setColor('#dd2e44');

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

export {};
