const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const {} = require('../lib/constants');
const axios = require('axios');
const cheerio = require('cheerio');
const { getProductByURL } = require('../lib/microcenter');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('microcenter')
    .setDescription(
      'Allows you to check if a product is in stock at microcenter.'
    ),
  ephemeral: true,
  async execute(interaction) {
    const { name, image, sku, qty, rating, price, url, instock } =
      await getProductByURL(
        'https://www.microcenter.com/product/465902/c4labs-zebra-zero-raspberry-pi-zero-type-2-case-black-ice'
      );
    const embed = new MessageEmbed()
      .setTitle(name)
      .setURL(url)
      .setColor('#0099ff')
      .addFields([
        { name: 'Price', value: price, inline: true },
        { name: 'Quanity', value: qty, inline: true },
        { name: 'Rating', value: rating, inline: true },
        { name: 'SKU', value: sku, inline: true }
      ])
      .setThumbnail(image)
      .setAuthor('Microcenter', null, 'https://www.microcenter.com/')
      .setFooter(`Data was last updated: ${Date.now()}`);
    console.log('Sending');
    return interaction.editReply({
      embeds: [embed],
      emphemeral: this.ephemeral
    });
  }
};
