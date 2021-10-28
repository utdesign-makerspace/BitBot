const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const constants = require('../lib/constants');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Gives the status of 3D printers.')
        .addIntegerOption(option => 
            option.setName("printer")
                .setDescription("3D printer to check the status of")
                .addChoices(constants.printerChoices)),
	ephemeral: true,
	async execute(interaction) {
        // Quickly check if we were NOT given a specific printer
        if (interaction.options.getInteger('printer') == null) {
            let statusEmbed = new Discord.MessageEmbed()
                .setColor("#c1393d")
                .setTitle(":information_source:  Printer Status")
                .setFooter("Printers are first come, first served")
                .setTimestamp();
            return interaction.editReply({ embeds: [statusEmbed], ephemeral: true });
        }

        // Grab printer object from constants
        const printer = constants.printers[interaction.options.getInteger('printer')];

        // Create beginning of embed
        const statusEmbed = new Discord.MessageEmbed()
            .setColor(printer.color)
			.setAuthor(printer.model)
			.setThumbnail(printer.thumbnail)
            .setFooter("Printers are first come, first served")
            .setTimestamp();
        
        // TODO: Add if statements to check if available, in use, or offline
        if (true) { // example is available
            statusEmbed.setTitle("🟢  Printer Available")
                .addField("Available", "Yes", true);
        }

        // Send reply
		return interaction.editReply({ embeds: [statusEmbed], ephemeral: true });
	},
};