const calendar = require('../lib/calendar.js');
module.exports = {
	cron: '0 0 * * * *',
	action: async (client) => {
		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		console.log(guild);
		console.log(`- Updating calendar for ${guild.name}... -`);
		await calendar.updateDiscordEvents(guild);
	}
};
