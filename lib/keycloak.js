const axios = require('axios');
const qs = require('qs');
module.exports = {
	getDiscordIDByUUID: async (uuid) => {
		let discordUser;
		let response;
		let token;
		try {
			response = await axios({
				method: 'post',
				url: 'https://members.utdmaker.space/auth/realms/master/protocol/openid-connect/token',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Cookie: 'KEYCLOAK_LOCALE=en'
				},
				data: qs.stringify({
					client_id: 'admin-cli',
					username: 'utdmakerspace@gmail.com',
					password: 'stavMaker18',
					grant_type: 'password'
				})
			});
		} catch (e) {
			console.log(e);
			return null;
		}
		token = response.data.access_token;
		if (token == null) {
			return null;
		}
		try {
			discordUser = await axios({
				method: 'get',
				url: `https://members.utdmaker.space/auth/admin/realms/Makerspace/users/${uuid}/federated-identity`,
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
		} catch (e) {
			return null;
		}

		return discordUser.data[0].userId;
	}
};
