import calendar = require('../lib/calendar');
import * as Discord from 'discord.js';

module.exports = {
	cron: '0 0 * * * *',
	runOnStart: true,
	action: async (client: Discord.Client) => {
		const guild = client.guilds.cache.get(
			process.env.GUILD_ID ?? '593125987177463809'
		);
		if (!guild) {
			console.log('No guild found');
			return;
		}
		console.log(`- Updating calendar for ${guild.name}... -`);
		await calendar.updateDiscordEvents(guild);
	}
};
