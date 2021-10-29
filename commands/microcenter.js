const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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
    const data = await getProductByURL(
      'https://www.microcenter.com/product/465902/c4labs-zebra-zero-raspberry-pi-zero-type-2-case-black-ice'
    );
    console.log(data);
    return interaction.editReply('Done');
  }
};
