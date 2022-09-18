const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snippet')
		.setDescription(
			'Pastes a commonly repeated phrase in chat (ex. our hours of operation).'
		)
		.addStringOption((option) =>
			option
				.setName('snippet')
				.setDescription('The snippet to paste')
				.setRequired(true)
				.setAutocomplete(true)
		),
	async execute(interaction) {
		// get the snippet option
		const snippet = interaction.options.getString('snippet');

		// get the snippet from the database
		const snippetModel = require('../lib/models/snippetSchema');
		const result = await snippetModel.findOne({ title: snippet });

		// if the snippet doesn't exist, return
		if (!result) {
			await interaction.editReply({
				content: `The snippet "${snippet}" does not exist.`,
				ephemeral: true
			});
			return;
		}

		// if the snippet exists, send an embed
		const embed = new EmbedBuilder()
			.setTitle(result.title)
			.setDescription(result.body)
			.setColor('#c1373d')
			.setAuthor({
				name: 'UTDesign Makerspace',
				iconURL: 'https://i.imgur.com/lSwBDLb.png',
				url: 'https://utdmaker.space/'
			});
		await interaction.editReply({ embeds: [embed] });
	}
};
