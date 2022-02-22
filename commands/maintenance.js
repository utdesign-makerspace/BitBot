const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const constants = require('../lib/constants');
const printers = require('../lib/printers');
const farm = require('../lib/farm');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('maintenance')
		.setDescription(
			'Enables or disables maintenance mode on a printer depending on if a reason is given.'
		)
		.addStringOption((option) =>
			option
				.setName('printer')
				.setDescription('3D printer to set the maintenance mode of')
				.setRequired(true)
				.addChoices(constants.printerChoices)
		)
		.addStringOption((option) =>
			option
				.setName('reason')
				.setDescription('Reason for maintenance mode if enabled')
		),
	ephemeral: true,
	async execute(interaction) {
		const printerID = interaction.options.getString('printer');
		const reason = interaction.options.getString('reason');

		const success = await printers.setMaintenance(printerID, reason);

		if (success)
			await interaction.editReply({
				content: reason
					? 'Enabled maintenance mode.'
					: 'Disabled maintenance mode.',
				ephemeral: true
			});
		else
			await interaction.editReply({
				content: 'Failed to set maintenance mode.',
				ephemeral: true
			});
	}
};
