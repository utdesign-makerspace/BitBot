const constants = require("../lib/constants");
const printers = require("../lib/printers");
const Discord = require("discord.js");

module.exports = {
    id: constants.status.detailsButtonId,
    async execute (interaction, args) {
		interaction.deferUpdate();

        // Grab our arguments
		const printerID = args[0];
        let detailed = args[1];

        // Convert 0 or 1 to false or true
        if (detailed == true)
            detailed = true;
        else
            detailed = false;

		// Get the message options for the printer
		let msg = await printers.getMessage(printerID, detailed);

		// Create the buttons
		const detailsButton = new Discord.MessageButton({
            customId: `${constants.status.detailsButtonId} ${printerID} ${detailed ? 0 : 1}`,
            label: detailed ? constants.status.hideButtonText : constants.status.showButtonText,
            style: 'SECONDARY',
        });
        const cancelButton = new Discord.MessageButton({
            customId: `${constants.status.cancelButtonId} ${printerID}`,
            label: constants.status.cancelButtonText,
            style: 'DANGER',
            disabled: true,
        });
		const buttonRow = new Discord.MessageActionRow().addComponents(detailsButton, cancelButton,);

		// Modify our message options
        msg.components = [buttonRow];
		msg.attachments = []; // This gets rid of previous images to prevent an overflow
		await interaction.editReply(msg);
    }
};