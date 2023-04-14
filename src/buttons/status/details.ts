import constants = require('../../lib/constants');
import printers = require('../../lib/printers');
import * as Discord from 'discord.js';

module.exports = {
	id: constants.status.detailsButtonId,
	async execute(interaction: Discord.Interaction, args: string[]) {
		if (!interaction.isButton()) return;
		interaction.deferUpdate();

		// Grab our arguments
		const printerID = args[0];
		let detailed = args[1] == '1' ? true : false;

		// Get the message options for the printer
		let msg = await printers.getMessage(printerID, detailed);

		// Create the buttons
		const refreshButton = new Discord.ButtonBuilder({
			customId: `${constants.status.detailsButtonId} ${printerID} ${args[1]}`,
			label: constants.status.refreshButtonText,
			style: Discord.ButtonStyle.Secondary
		});
		const detailsButton = new Discord.ButtonBuilder({
			customId: `${constants.status.detailsButtonId} ${printerID} ${
				detailed ? 0 : 1
			}`,
			label: detailed
				? constants.status.hideButtonText
				: constants.status.showButtonText,
			style: Discord.ButtonStyle.Secondary
		});
		const cancelButton = new Discord.ButtonBuilder({
			customId: `${constants.status.cancelButtonId} ${printerID}`,
			label: constants.status.cancelButtonText,
			style: Discord.ButtonStyle.Danger,
			disabled: true
		});
		// Allow stopping print if officer
		if (
			(
				interaction.member?.roles as Discord.GuildMemberRoleManager
			).cache.some((role) => role.name === constants.officerRoleName)
		)
			cancelButton.setDisabled(false);
		const buttonRow =
			new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
				refreshButton,
				detailsButton
			);
		// Only add view and cancel buttons if printer in use
		const data = await printers.getJob(printerID);
		if (data && (data.state == 'Printing' || data.state == 'Paused'))
			buttonRow.addComponents(cancelButton);

		msg.components = [buttonRow];
		await interaction.editReply(msg);
	}
};
