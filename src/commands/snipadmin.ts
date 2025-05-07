import { SlashCommandBuilder } from 'discord.js';
import * as Discord from 'discord.js';
import snippetModel = require('../lib/models/snippetSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snipadmin')
		.setDescription('Admin commands for managing snippets.')
		.setDefaultMemberPermissions(0)
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
	async execute(interaction: Discord.ChatInputCommandInteraction) {
		const titleInput = new Discord.TextInputBuilder()
			.setCustomId('title')
			.setLabel('Title')
			.setPlaceholder('Hours of Operation')
			.setStyle(Discord.TextInputStyle.Short);
		const bodyInput = new Discord.TextInputBuilder()
			.setCustomId('body')
			.setLabel('Body')
			.setPlaceholder(
				'Our hours of operation are from 7 AM to 9 PM on weekdays.'
			)
			.setStyle(Discord.TextInputStyle.Paragraph);
		const triggersInput = new Discord.TextInputBuilder()
			.setCustomId('triggers')
			.setLabel('Triggers')
			.setPlaceholder(
				'Use * to indicate a wildcard.\nwhen*makerspace close\nwhen*makerspace open\nhours*makerspace'
			)
			.setStyle(Discord.TextInputStyle.Paragraph);

		const titleRow =
			new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
				titleInput
			);
		const bodyRow =
			new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
				bodyInput
			);
		const triggersRow =
			new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
				triggersInput
			);

		if (interaction.options.getSubcommand() === 'add') {
			// create a modal
			const modal = new Discord.ModalBuilder()
				.setCustomId('addSnippet')
				.setTitle('Add Snippet');

			modal.addComponents(titleRow, bodyRow, triggersRow);

			await interaction.showModal(modal);
		} else if (interaction.options.getSubcommand() === 'remove') {
			// get the snippet option
			const snippet = interaction.options.getString('snippet');

			// get the snippet from the database
			const result = await snippetModel.Snippet.findOne({
				title: snippet
			});

			// if the snippet doesn't exist, return
			if (!result) {
				await interaction.reply({
					content: `The snippet "${snippet}" does not exist.`,
					ephemeral: true
				});
				return;
			}

			// if the snippet exists, delete it
			await snippetModel.Snippet.deleteOne({ title: snippet });

			await interaction.reply({
				content: `The snippet "${snippet}" has been deleted.`,
				ephemeral: true
			});
		} else if (interaction.options.getSubcommand() === 'edit') {
			// get the snippet option
			const snippet = interaction.options.getString('snippet');

			// get the snippet from the database
			const result = await snippetModel.Snippet.findOne({
				title: snippet
			});

			// if the snippet doesn't exist, return
			if (!result) {
				await interaction.reply({
					content: `The snippet "${snippet}" does not exist.`,
					ephemeral: true
				});
				return;
			}

			// set current values
			titleInput.setValue(result.title);
			bodyInput.setValue(result.body);
			triggersInput.setValue(result.triggers.join('\n'));

			// create a modal
			const modal = new Discord.ModalBuilder()
				.setCustomId(`editSnippet-${result._id}`)
				.setTitle(`Edit ${result.title}`);

			modal.addComponents(titleRow, bodyRow, triggersRow);

			await interaction.showModal(modal);
		}
	}
};
