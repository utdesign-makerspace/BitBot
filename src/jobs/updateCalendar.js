const calendar = require('../lib/calendar.js');
module.exports = {
	cron: '0 0 * * * *',
	runOnStart: true,
	action: async (client) => {
		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		// console.log(`- Updating calendar for ${guild.name}... -`);
		await calendar.updateDiscordEvents(guild);
	}
};
