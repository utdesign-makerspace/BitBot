const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createevent')
		.setDescription('Creates a test event.'),
	ephemeral: true,
	async execute(interaction) {
		interaction.guild.scheduledEvents.create({
			name: 'SGDA Meeting',
			scheduledStartTime: new Date('2022-02-23T19:00:00-06:00'),
			scheduledEndTime: new Date('2022-02-23T20:30:00-06:00'),
			privacyLevel: 'GUILD_ONLY',
			entityType: 'EXTERNAL',
			description:
				'Weekly meetings held by the Student Game Developer Association.',
			entityMetadata: { location: 'SPN 2.220' }
		});
		interaction.editReply({ content: 'Event created.', ephemeral: true });
	}
};
