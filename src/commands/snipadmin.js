const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} = require('discord.js');
const snippetModel = require('../lib/models/snippetSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snipadmin')
		.setDescription('Admin commands for managing snippets.')
		.setDefaultPermission(false)
		.addSubcommand((subcommand) =>
			subcommand.setName('add').setDescription('Add a new snippet.')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('Remove an existing snippet.')
				.addStringOption((option) =>
					option
						.setName('snippet')
						.setDescription('The snippet to remove')
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit an existing snippet.')
				.addStringOption((option) =>
					option
						.setName('snippet')
						.setDescription('The snippet to edit')
						.setRequired(true)
						.setAutocomplete(true)
				)
		),
	noDefer: true,
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'add') {
			// create a modal
			const modal = new ModalBuilder()
				.setCustomId('addSnippet')
				.setTitle('Add Snippet');

			// create text inputs
			const titleInput = new TextInputBuilder()
				.setCustomId('title')
				.setLabel('Title')
				.setPlaceholder('Hours of Operation')
				.setStyle(TextInputStyle.Short);
			const bodyInput = new TextInputBuilder()
				.setCustomId('body')
				.setLabel('Body')
				.setPlaceholder(
					'Our hours of operation are from 7 AM to 9 PM on weekdays.'
				)
				.setStyle(TextInputStyle.Paragraph);

			const titleRow = new ActionRowBuilder().addComponents(titleInput);
			const bodyRow = new ActionRowBuilder().addComponents(bodyInput);

			modal.addComponents(titleRow, bodyRow);

			await interaction.showModal(modal);
		} else if (interaction.options.getSubcommand() === 'remove') {
			// get the snippet option
			const snippet = interaction.options.getString('snippet');

			// get the snippet from the database
			const result = await snippetModel.findOne({ title: snippet });

			// if the snippet doesn't exist, return
			if (!result) {
				await interaction.reply({
					content: `The snippet "${snippet}" does not exist.`,
					ephemeral: true
				});
				return;
			}

			// if the snippet exists, delete it
			await snippetModel.deleteOne({ title: snippet });

			await interaction.reply({
				content: `The snippet "${snippet}" has been deleted.`,
				ephemeral: true
			});
		} else if (interaction.options.getSubcommand() === 'edit') {
			// get the snippet option
			const snippet = interaction.options.getString('snippet');

			// get the snippet from the database
			const result = await snippetModel.findOne({ title: snippet });

			// if the snippet doesn't exist, return
			if (!result) {
				await interaction.reply({
					content: `The snippet "${snippet}" does not exist.`,
					ephemeral: true
				});
				return;
			}

			// create a modal
			const modal = new ModalBuilder()
				.setCustomId(`editSnippet-${result._id}`)
				.setTitle(`Edit ${result.title}`);

			// create text inputs
			const titleInput = new TextInputBuilder()
				.setCustomId('title')
				.setLabel('Title')
				.setValue(result.title)
				.setStyle(TextInputStyle.Short);
			const bodyInput = new TextInputBuilder()
				.setCustomId('body')
				.setLabel('Body')
				.setValue(result.body)
				.setStyle(TextInputStyle.Paragraph);

			const titleRow = new ActionRowBuilder().addComponents(titleInput);
			const bodyRow = new ActionRowBuilder().addComponents(bodyInput);

			modal.addComponents(titleRow, bodyRow);

			await interaction.showModal(modal);
		}
	}
};
