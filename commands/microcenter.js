const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { getProductBySKU, productTemplate } = require('../lib/microcenter');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('microcenter')
    .setDescription(
      'Allows you to check if a product is in stock at microcenter.'
    )
    .addStringOption((option) =>
      option
        .setName('sku')
        .setRequired(true)
        .setDescription('The SKU of the product.')
    ),
  ephemeral: true,
  async execute(interaction) {
    const inputSKU = interaction.options.getString('sku');
    if (!inputSKU) {
      return interaction.editReply('You need to specify a SKU.');
    }
    const embed = await productTemplate(inputSKU);

    return interaction.editReply({
      embeds: [embed],
      emphemeral: this.ephemeral
    });
  }
};
