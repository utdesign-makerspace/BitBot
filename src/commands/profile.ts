import { SlashCommandBuilder } from 'discord.js';
import * as Discord from 'discord.js';
import profiles = require('../lib/profiles');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription(
			"View a user's UTDesign Makerspace profile if they have linked their Discord account."
		)
		.addStringOption((option) =>
			option
				.setName('netid')
				.setDescription('The NetID of the user to view the profile of')
		)
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user to view the profile of')
		),
	ephemeral: true,
	execute: async (interaction: Discord.ChatInputCommandInteraction) => {
		profiles.displayProfile(interaction);
	}
};
