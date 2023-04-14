import { SlashCommandBuilder } from '@discordjs/builders';
import * as Discord from 'discord.js';
import printers = require('../lib/printers');
import printerModel = require('../lib/models/printerSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unwatch')
		.setDescription('Stop watching a 3D printer.'),
	ephemeral: true,
	async execute(interaction: Discord.ChatInputCommandInteraction) {
		let printerID = null;

		// See if the user is already watching a printer
		const watchedByUser = await printerModel.Printer.find({
			watcher: (interaction.member as Discord.GuildMember).id
		});
		watchedByUser.forEach(async (printer) => {
			printerID = printer.id;
			printer.watcher = undefined;
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
