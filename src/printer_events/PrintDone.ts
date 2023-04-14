import printers = require('../lib/printers');
import ldap = require('../lib/ldap');
import * as Discord from 'discord.js';

module.exports = {
	name: 'PrintDone',
	execute: async (data: any, printerId: string, client: Discord.Client) => {
		const ldapUser = await ldap.getUserByUsername(data.owner, ['discord']);

		// If there is no user, we can't do anything. Otherwise, get the user.
		if (ldapUser && ldapUser.discord) {
			const user = await client.users.fetch(ldapUser.discord as string);
			if (user) {
				// Construct our embed and get snapshot
				const [embed, snapshotBuffer] = await Promise.all([
					printers.getEmbedTemplate(printerId),
					printers.getSnapshotBuffer(printerId)
				]);
				embed
					.setTitle('🎉  Print Completed')
					.setDescription(
						`Your print was completed <t:${Math.round(
							Date.now() / 1000
						)}:R>! Please come to the UTDesign Makerspace to pick up your print as soon as possible.`
					)
					.setTimestamp()
					.setColor('#78b159');

				// Add image to embed.
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
