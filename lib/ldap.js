const ldap = require('ldapjs-promise');

module.exports = {
	getUserByUsername: async function (
		username,
		attributes = ['cometcard', 'givenName', 'sn', 'mail', 'cn', 'discord']
	) {
		const client = ldap.createClient({
			url: process.env.LDAP_URL
		});

		await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS);
		const { entries: users } = await client.searchReturnAll(
			process.env.LDAP_MEMBERS_BASE,
			{
				filter: `(uid=${username})`,
				scope: 'sub',
				attributes
			}
		);
		return users[0];
	},
	getUserByDiscord: async function (
		discordId,
		attributes = ['cometcard', 'givenName', 'sn', 'mail', 'cn', 'uid']
	) {
		const client = ldap.createClient({
			url: process.env.LDAP_URL
		});

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
	getGroupsByUsername: async function (username, attributes = ['cn', 'uid']) {
		const client = ldap.createClient({
			url: process.env.LDAP_URL
		});

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
	},
	addUserToGroup: async function (username, group) {
		const client = ldap.createClient({
			url: process.env.LDAP_URL
		});

		await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS);

		const data = await client.searchReturnAll(
			`cn=${group},${process.env.LDAP_GROUPS_BASE}`,
			{}
		);

		if (data.entries.length === 0) {
			console.log(`📛 Group ${group} not found`);
			return;
		}
		const members = data.entries[0].member;
		const full_username =
			'uid=' + username + ',' + process.env.LDAP_MEMBERS_BASE;
		if (members.includes(full_username)) {
			console.log(`📛 ${username} already in ${group}`);
			return;
		}

		const change = new ldap.Change({
			operation: 'add',
			modification: {
				member: full_username
			}
		});

		await client.modify(
			`cn=${group},${process.env.LDAP_GROUPS_BASE}`,
			change
		);

		console.log(`📛 ${username} added to ${group}`);
	},
	linkUserToDiscord: async function (username, discordId) {
		const client = ldap.createClient({
			url: process.env.LDAP_URL
		});

		await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASS);

		const change = new ldap.Change({
			operation: 'add',
			modification: {
				discord: discordId
			}
		});

		await client.modify(
			`uid=${username},${process.env.LDAP_MEMBERS_BASE}`,
			change
		);
	}
};
