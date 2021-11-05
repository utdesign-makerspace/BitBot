const printers = require('../lib/printers');
const ldap = require('../lib/ldap');
const constants = require('../lib/constants');

module.exports = {
	name: 'PrintStarted',
	execute: async (data, printerId, client) => {
		const ldapUser = await ldap.getUserByUsername(data.owner, 'discord');

		// If there is no user, we can't do anything. Otherwise, get the user.
		if (!ldapUser || !ldapUser.discord) return;
		const user = await client.users.fetch(ldapUser.discord);
		if (!user) return;

		// Construct our embed.
		const embed = await printers.getEmbedTemplate(printerId);
		embed
			.setTitle('✅  Print Started')
			.setDescription(
				`Your print has started! You will receive a notification once your print finishes or fails. To check up on your print, use **/status ${constants.printers[printerId].name}** in the UTDesign Makerspace server.`
			)
			.setTimestamp();

		// Send the embed to the user.
		await user.send({ embeds: [embed] });
	}
};
