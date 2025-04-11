import { SlashCommandBuilder } from 'discord.js';
import * as Discord from 'discord.js';
import constants = require('../lib/constants');
import printers = require('../lib/printers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('maintenance')
		.setDescription(
			'Enables or disables maintenance mode on a printer depending on if a reason is given.'
		)
		.setDefaultPermission(false)
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
	async execute(interaction: Discord.ChatInputCommandInteraction) {
		const printerID = interaction.options.getString('printer', true);
		const reason = interaction.options.getString('reason');

		const success = await printers.setMaintenance(
			printerID,
			reason ?? undefined
		);

		if (success)
			await interaction.editReply({
				content: reason
					? 'Enabled maintenance mode.'
					: 'Disabled maintenance mode.'
			});
		else
			await interaction.editReply({
				content: 'Failed to set maintenance mode.'
			});
	}
};
