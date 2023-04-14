import * as Discord from 'discord.js';
import profile = require('../lib/profiles');

module.exports = {
	data: {
		name: 'View Profile',
		type: 2
	},
	ephemeral: true,
	context: true,
	async execute(interaction: Discord.Interaction) {
		profile.displayProfile(interaction);
	}
};
