const ldap = require('ldapjs-promise');
const client = ldap.createClient({
	url: process.env.LDAP_URL
});

module.exports = {
	getUserByUsername: async function (
		username,
		attributes = ['cometcard', 'givenName', 'sn', 'mail', 'cn', 'discord']
	) {
		await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS);
		const { entries: users } = await client.searchReturnAll(
			process.env.LDAP_MEMBERS_BASE,
			{
				filter: `(cn=${username})`,
				scope: 'sub',
				attributes
			}
		);
		return users[0];
	},
	getUserByDiscord: async function (
		discordId,
		attributes = ['cometcard', 'givenName', 'sn', 'mail', 'cn', 'username']
	) {
		await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS);
		const { entries: users } = await client.searchReturnAll(
			process.env.LDAP_MEMBERS_BASE,
			{
				filter: `(discord=${discordId})`,
				scope: 'sub',
				attributes
			}
		);
		return users[0];
	},
	getGroupsByUsername: async function (username, attributes = ['cn']) {
		await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS);
		const { entries: groups } = await client.searchReturnAll(
			process.env.LDAP_GROUPS_BASE,
			{
				filter: `(&(objectClass=posixGroup)(memberUid=${username}))`,
				scope: 'sub',
				attributes
			}
		);
		return groups;
	}
};
