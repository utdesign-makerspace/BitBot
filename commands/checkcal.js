const { SlashCommandBuilder } = require('@discordjs/builders');
const calendar = require('../lib/calendar');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkcal')
		.setDescription('Checks the calendar and outputs to console.'),
	ephemeral: true,
	async execute(interaction) {
		const events = await calendar.getEvents();
		console.log(events);
		interaction.editReply({ content: 'Check console.', ephemeral: true });
	}
};
