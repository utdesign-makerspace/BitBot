const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const constants = require('../lib/constants');
const printers = require('../lib/printers');

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
        const printerID = interaction.options.getInteger('printer');

        let msg;
        
		if (printerID !== null) {
            msg = await printers.getMessage(printerID, false);
            const viewButton = new Discord.MessageButton({
                customId: `${constants.status.showButtonId}${printerID}`,
                label: constants.status.showButtonText,
                style: 'SECONDARY',
            });
            const cancelButton = new Discord.MessageButton({
                customId: `${constants.status.cancelButtonId}${printerID}`,
                label: constants.status.cancelButtonText,
                style: 'DANGER',
                disabled: true,
            });
            const buttonRow = new Discord.MessageActionRow().addComponents(viewButton, cancelButton,);
            msg.components = [buttonRow];
        } else {
            let statusEmbed = new Discord.MessageEmbed()
				.setColor('#c1393d')
				.setTitle(':information_source:  Printer Status')
				.setFooter('Printers are first come, first served')
				.setTimestamp();
			return interaction.editReply({ embeds: [statusEmbed], ephemeral: true });
        }

        msg.ephemeral = true;
        interaction.editReply(msg);
	}
};
