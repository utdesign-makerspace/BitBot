const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const constants = require('../lib/constants');
const printers = require('../lib/printers');
const printerModel = require('../lib/models/printerSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watch')
		.setDescription(
			'Receive a notification once a 3D printer becomes available.'
		)
		.addStringOption((option) =>
			option
				.setName('printer')
				.setDescription('3D printer to check the status of')
				.addChoices(constants.printerChoices)
				.setRequired(true)
		),
	ephemeral: true,
	async execute(interaction) {
		const printerID = interaction.options.getString('printer');
		const embed = await printers.getEmbedTemplate(printerID);

		// See if the user is already watching a printer
		const watchedByUser = await printerModel.find({
			watcher: interaction.member.id
		});
		if (watchedByUser.length > 0) {
			embed
				.setTitle('❌  Already Watching a Printer')
				.setDescription(
					'You are already watching a printer. Please use /unwatch to stop watching another printer.'
				)
				.setTimestamp()
				.setColor('#dd2e44');
			return interaction.editReply({ embeds: [embed] });
		}

		// See if the printer is already being watched
		const printer = await printers.getPrinterFromDb(printerID);
		if (printer.watcher) {
			embed
				.setTitle('🙈  Printer Already Watched')
				.setDescription(
					'This printer is already being watched by another member. To help with availability, all printers are limited to one watcher.'
				)
				.setTimestamp()
				.setColor('#dd2e44');
			return interaction.editReply({ embeds: [embed] });
		}

		// See if the printer is unavailable/available
		printerData = await printers.getJob(printerID);
		if (
			!printerData ||
			constants.states.get(printerData.state.toLowerCase()) ==
				'offline' ||
			printer.underMaintenance
		) {
			embed
				.setTitle('⚠  Printer Unavailable')
				.setDescription(
					'This printer is currently unavailable to be watched. It may be offline or under maintenance. Please use /status for more information.'
				)
				.setTimestamp()
				.setColor('#dd2e44');
			return interaction.editReply({ embeds: [embed] });
		} else if (
			constants.states.get(printerData.state.toLowerCase()) == 'available'
		) {
			embed
				.setTitle('🔓  Printer Available')
				.setDescription(
					'This printer is currently available. Please note that this message does not guarantee availability once you arrive.'
				)
				.setTimestamp()
				.setColor('#78b159');
			return interaction.editReply({ embeds: [embed] });
		}

		// We're good to go, watch the printer
		printer.watcher = interaction.member.id;
		printer.save();
		embed
			.setTitle('👀  Watching Printer')
			.setDescription(
				'You have begun watching this printer. Please make sure that you allow direct messages from server members to receive your notification.'
			)
			.setTimestamp()
			.setColor('#3b88c3');
		return interaction.editReply({ embeds: [embed] });
	}
};
