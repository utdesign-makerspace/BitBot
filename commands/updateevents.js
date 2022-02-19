const { SlashCommandBuilder } = require('@discordjs/builders');
const calendar = require('../lib/calendar');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateevents')
		.setDescription('Updates events within Discord.'),
	ephemeral: true,
	async execute(interaction) {
		await calendar.updateDiscordEvents(interaction.guild);
		interaction.editReply({ content: 'Events updated.', ephemeral: true });
	}
};
