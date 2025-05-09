import ldap = require('ldapjs-promise');

let globalClient: ldap.Client | null = null;

async function getLdapClient() {
	if (globalClient) {
		return globalClient;
	}
	const client = await ldap.createClient({
		url: process.env.LDAP_URL ?? 'ldap://localhost'
	});

	await client.bind(
		process.env.LDAP_BIND_DN ?? 'cn=admin,dc=example,dc=org',
		process.env.LDAP_BIND_PASS ?? 'password'
	);
	globalClient = client;
	return client;
}

export async function getUserByUsername(
	username: string,
	attributes = ['cometcard', 'givenName', 'sn', 'mail', 'cn', 'discord']
): Promise<ldap.SearchEntryObject> {
	const client = await getLdapClient();
	const { entries: users } = await client.searchReturnAll(
		process.env.LDAP_MEMBERS_BASE ??
			'cn=users,cn=accounts,dc=example,dc=org',
		{
			filter: `(uid=${username})`,
			scope: 'sub',
			attributes
		}
	);
	return users[0];
}

export async function getUserByDiscord(
	discordId: string,
	attributes = ['cometcard', 'givenName', 'sn', 'mail', 'cn', 'uid']
): Promise<ldap.SearchEntryObject> {
	const client = await getLdapClient();

	const { entries: users } = await client.searchReturnAll(
		process.env.LDAP_MEMBERS_BASE ??
			'cn=users,cn=accounts,dc=example,dc=org',
		{
			filter: `(discord=${discordId})`,
			scope: 'sub',
			attributes
		}
	);
	return users[0];
}

export async function getGroupsByUsername(
	username: string,
	attributes = ['cn', 'uid']
): Promise<ldap.SearchEntryObject[]> {
	const client = await getLdapClient();

	const { entries: groups } = await client.searchReturnAll(
		process.env.LDAP_GROUPS_BASE ??
			'cn=groups,cn=accounts,dc=example,dc=org',
		{
			filter: `(&(objectClass=posixgroup)(member=uid=${username},${process.env.LDAP_MEMBERS_BASE}))`,
			scope: 'sub',
			attributes
		}
	);
	return groups;
}

export async function addUserToGroup(
	username: string,
	group: string
): Promise<void> {
	const client = await getLdapClient();


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

	await client.modify(`cn=${group},${process.env.LDAP_GROUPS_BASE}`, change);

	console.log(`📛 ${username} added to ${group}`);
}

export async function linkUserToDiscord(
	username: string,
	discordId: string
): Promise<void> {
	const client = await getLdapClient();

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
