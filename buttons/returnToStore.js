const Discord = require('discord.js');

module.exports = {
	id: 'returnToStore',
	async execute(interaction, args) {
		await interaction.deferUpdate();
		const command = interaction.client.commands.get('store');

		if (!command)
			return interaction.editReply(
				'ERROR: Could not find the store command.'
			);

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (process.env.NODE_ENV === 'production') {
				Sentry.captureException(error);
			}
			await interaction.editReply({
				content: 'There was an error while executing this command!',
				ephemeral: true
			});
		}
	}
};
