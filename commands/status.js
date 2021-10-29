const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const constants = require('../lib/constants');
const axios = require('axios');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Gives the status of 3D printers.')
		.addIntegerOption((option) =>
			option
				.setName('printer')
				.setDescription('3D printer to check the status of')
				.addChoices(constants.printerChoices)
		),
	ephemeral: true,
	async execute(interaction) {
		// Quickly check if we were NOT given a specific printer
		if (interaction.options.getInteger('printer') == null) {
			let statusEmbed = new Discord.MessageEmbed()
				.setColor('#c1393d')
				.setTitle(':information_source:  Printer Status')
				.setFooter('Printers are first come, first served')
				.setTimestamp();
			return interaction.editReply({ embeds: [statusEmbed], ephemeral: true });
		}

		// Grab printer object from constants
		const printer =
			constants.printers[interaction.options.getInteger('printer')];

		// Create beginning of embed
		const statusEmbed = new Discord.MessageEmbed()
			.setColor(printer.color)
			.setAuthor(printer.name + ' - ' + printer.model)
			.setThumbnail(printer.thumbnail)
			.setFooter('Printers are first come, first served')
			.setTimestamp();

		// TODO: Add if statements to check if available, in use, or offline
		try {
			var {
				data: {
					state: printerState,
					progress: { printTimeLeft }
				}
			} = await axios({
				method: 'get',
				url: `http${printer.ssl ? 's' : ''}://${printer.ip}/api/job`,
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + printer.apikey
				},
				httpsAgent: new https.Agent({
					rejectUnauthorized: false
				})
			});
		} catch (error) {
			console.log(error);
			// If we get an error, we assume the printer is offline
			statusEmbed
				.setTitle('🔴  Printer Offline')
				.addField('Available', 'Probably not', true)
				.addField(
					'More Info',
					'The octoprint session is offline or has been disconnected from the internal network. This is usually indiciative of a catastrophic system failure.'
				);
			return interaction.editReply({ embeds: [statusEmbed], ephemeral: true });
		}

		const { data: snapshotData } = await axios({
			method: 'get',
			url: `http${printer.ssl ? 's' : ''}://${
				printer.ip
			}/webcam/?action=snapshot`,
			httpsAgent: new https.Agent({
				rejectUnauthorized: false
			}),
			responseType: 'arraybuffer'
		});

		const snapshot = new Discord.MessageAttachment(
			Buffer.from(snapshotData, 'utf-8'),
			'snapshot.jpg'
		);
		try {
			printerState;
		} catch (error) {
			console.log(error);
			statusEmbed
				.setTitle('🔴  Printer Offline')
				.addField('Available', 'Probably', true)
				.addField(
					'More Info',
					'It is very likely that the printer is off or octoprint has been disconnected to '
				);
			return interaction.editReply({ embeds: [statusEmbed], ephemeral: true });
		}
		if (printerState !== 'Printing') {
			// example is available
			statusEmbed
				.setTitle('🟢  Printer Available')
				.addField('Available', 'Yes', true)
				.setImage('attachment://snapshot.jpg');
		} else {
			// example is in use
			statusEmbed
				.setTitle('🟡  Printer In Use')
				.addField(
					'Available',
					`<t:${Math.round(Date.now() / 1000) + printTimeLeft}:R>`,
					false
				)
				.addField(
					'Estimated to finish at',
					`<t:${Math.round(Date.now() / 1000) + printTimeLeft}:f>`,
					false
				)
				.setImage('attachment://snapshot.jpg');
		}

		// Send reply
		return interaction.editReply({
			embeds: [statusEmbed],
			ephemeral: true,
			files: [snapshot]
		});
	}
};
