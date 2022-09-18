const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const constants = require('../lib/constants');
const printers = require('../lib/printers');
const farm = require('../lib/farm');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Gives the status of 3D printers.')
		.addStringOption((option) =>
			option
				.setName('printer')
				.setDescription('3D printer to check the status of')
				.addChoices(constants.printerChoices)
		),
	ephemeral: true,
	async execute(interaction) {
		const printerID = interaction.options.getString('printer');

		let msg;

		if (printerID !== null) {
			// Grab our message options
			msg = await printers.getMessage(printerID, false);
			// Create the buttons
			const refreshButton = new Discord.ButtonBuilder({
				customId: `${constants.status.detailsButtonId} ${printerID} 0`,
				label: constants.status.refreshButtonText,
				style: 'SECONDARY'
			});
			const viewButton = new Discord.ButtonBuilder({
				customId: `${constants.status.detailsButtonId} ${printerID} 1`,
				label: constants.status.showButtonText,
				style: 'SECONDARY'
			});
			const cancelButton = new Discord.ButtonBuilder({
				customId: `${constants.status.cancelButtonId} ${printerID}`,
				label: constants.status.cancelButtonText,
				style: 'DANGER',
				disabled: true
			});
			// Allow stopping print if officer
			if (
				interaction.member.roles.cache.some(
					(role) => role.name === constants.officerRoleName
				)
			)
				cancelButton.setDisabled(false);
			const buttonRow = new Discord.MessageActionRow().addComponents(
				refreshButton,
				viewButton
			);
			// Only add view and cancel buttons if printer in use
			const data = await printers.getJob(printerID);
			if (data && (data.state == 'Printing' || data.state == 'Paused'))
				buttonRow.addComponents(cancelButton);

			msg.components = [buttonRow];
		} else {
			msg = await farm.getFarmEmbed();
		}

		// Set ephemeral because we don't need everyone to see the status. We can change this once bot
		// is live and we have a #bot-commands channel to avoid overflow.
		msg.ephemeral = true;
		interaction.editReply(msg);
	}
};
