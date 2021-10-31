const Discord = require('discord.js');
const constants = require('../lib/constants');
const { cancelJob } = require('../lib/printers');

module.exports = {
	id: constants.status.cancelButtonId,
	async execute(interaction, args) {
		interaction.deferUpdate();
		await cancelJob(args[0]);
		interaction.editReply('Ok');
	}
};
