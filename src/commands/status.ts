import { SlashCommandBuilder } from 'discord.js';
import * as Discord from 'discord.js';
import constants = require('../lib/constants');
import printers = require('../lib/printers');
import farm = require('../lib/farm');

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
	async execute(interaction: Discord.ChatInputCommandInteraction) {
		const printerID = interaction.options.getString('printer');

		let msg;

		if (printerID !== null) {
			// Grab our message options
			msg = await printers.getMessage(printerID, false);
			// Create the buttons
			const refreshButton = new Discord.ButtonBuilder({
				customId: `${constants.status.detailsButtonId} ${printerID} 0`,
				label: constants.status.refreshButtonText,
				style: Discord.ButtonStyle.Secondary
			});
			const viewButton = new Discord.ButtonBuilder({
				customId: `${constants.status.detailsButtonId} ${printerID} 1`,
				label: constants.status.showButtonText,
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
					viewButton
				);

			// Create a select menu with the different printers
			const printerRow =
				new Discord.ActionRowBuilder<Discord.SelectMenuBuilder>().addComponents(
					new Discord.StringSelectMenuBuilder()
						.setCustomId(constants.status.printerSelectId)
						.setPlaceholder('Select a printer')
						.addOptions(
							// make sure printer requested is default
							constants.printerSelectChoices.map((option) => {
								option.setDefault(
									option.data.value == printerID
								);
								return option;
							})
						)
				);

			// Only add view and cancel buttons if printer in use
			const data = await printers.getJob(printerID);
			if (data && (data.state == 'Printing' || data.state == 'Paused'))
				buttonRow.addComponents(cancelButton);

			msg.components = [printerRow, buttonRow];
		} else {
			msg = await farm.getFarmEmbed();

			// Create a select menu with the different printers
			const printerRow =
				new Discord.ActionRowBuilder<Discord.SelectMenuBuilder>().addComponents(
					new Discord.StringSelectMenuBuilder()
						.setCustomId(constants.status.printerSelectId)
						.setPlaceholder('Select a printer')
						.addOptions(constants.printerSelectChoices)
				);
			msg.components = [printerRow];
		}

		// Set ephemeral because we don't need everyone to see the status. We can change this once bot
		// is live and we have a #bot-commands channel to avoid overflow.
		msg.ephemeral = true;
		interaction.editReply(msg);
	}
};
