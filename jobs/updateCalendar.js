const calendar = require('../lib/calendar.js');
module.exports = {
	cron: '* */1 * * * *',
	action: async (client) => {
		const guilds = [...client.guilds.cache.values()];
		console.log(guilds);
		for (let i = 0; i < guilds.length; i++) {
			console.log('Updating calendar for ' + guilds[i].name);
			await calendar.updateDiscordEvents(guilds[i]);
		}
	}
};
