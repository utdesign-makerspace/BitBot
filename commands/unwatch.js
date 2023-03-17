const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const constants = require('../lib/constants');
const printers = require('../lib/printers');
const printerModel = require('../lib/models/printerSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwatch')
		.setDescription('Stop watching a 3D printer.'),
	ephemeral: true,
	async execute(interaction) {
		let printerID = null;

		// See if the user is already watching a printer
		const watchedByUser = await printerModel.find({
			watcher: interaction.member.id
		});
		watchedByUser.forEach(async (printer) => {
			printerID = printer.id;
			printer.watcher = null;
			await printer.save();
		});

		// Get the proper template
		let embed;
		if (printerID == null) {
			embed = new Discord.EmbedBuilder()
				.setColor('#c1393d')
				.setAuthor({ name: 'UTDesign Makerspace' })
				.setTimestamp();
		} else {
			embed = await printers.getEmbedTemplate(printerID);
		}

		// Send the embed
		embed
			.setTitle('🙈  Stopped Watching Printer')
			.setDescription(
				'You have stopped watching this printer. You will no longer receive a notification once the printer is available.'
			)
			.setTimestamp()
			.setColor('#3b88c3');
		return interaction.editReply({ embeds: [embed] });
	}
};
