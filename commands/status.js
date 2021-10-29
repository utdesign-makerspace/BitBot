const { SlashCommandBuilder } = require('@discordjs/builders');
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
		)
        .addBooleanOption((option) =>
            option
                .setName('detailed')
                .setDescription('Give a detailed status (only if specified a printer)')
        ),
	ephemeral: true,
	async execute(interaction) {
		printers.getPrinterStatus(interaction, interaction.options.getBoolean('detailed'));
	}
};
