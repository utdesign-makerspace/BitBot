const Discord = require('discord.js');
const constants = require('../../lib/constants');
const printers = require('../../lib/printers');

module.exports = {
	id: constants.status.cancelButtonId,
	async execute(interaction, args) {
		await interaction.deferUpdate();

		// Get embeds to start with
		const warningEmbed = await printers.getEmbedTemplate(args[0]);
		const cancelledCancelEmbed = await printers.getEmbedTemplate(args[0]);
		const cancelledJobEmbed = await printers.getEmbedTemplate(args[0]);

		// Modify warning embed to convey 30 second time limit
		warningEmbed
			.setTitle('⚠ Cancelling Print')
			.setDescription(
				'You have selected to cancel this print. This process is irreversible and your print progress will be lost. You have 30 seconds to change your mind.'
			)
			.setImage('attachment://snapshot.jpg');
		const cancelButton = new Discord.ButtonBuilder({
			customId: `cancelthecancel ${interaction.id}`,
			label: 'Stop Cancellation',
			style: Discord.ButtonStyle.Danger
		});
		const buttonRow = new Discord.ActionRowBuilder().addComponents(
			cancelButton
		);
		// Send warning embed
		const msg = await interaction.editReply({
			embeds: [warningEmbed],
			components: [buttonRow]
		});

		// Modify the cancel embeds
		cancelledCancelEmbed
			.setTitle('✅ Cancellation Stopped')
			.setDescription(
				'You have selected to stop your cancellation. Your print will continue as intended.'
			)
			.setImage('attachment://snapshot.jpg');
		cancelledJobEmbed
			.setTitle('🛑 Print Cancelled')
			.setDescription(
				'Your print has been cancelled. Please come to the Makerspace to retrieve your print.'
			)
			.setImage('attachment://snapshot.jpg');

		// Use button collector to determine if user stopped
		const buttonCollector = msg.createMessageComponentCollector({
			componentType: 'BUTTON',
			time: 30 * 1000
		});
		buttonCollector.on('collect', (i) => {
			if (i.customId === `cancelthecancel ${interaction.id}`)
				return i.update({
					embeds: [cancelledCancelEmbed],
					components: []
				});
		});
		buttonCollector.on('end', async (collected) => {
			if (collected.size == 0) {
				await printers.cancelJob(args[0]);
				return interaction.editReply({
					embeds: [cancelledJobEmbed],
					components: []
				});
			}
		});
	}
};
