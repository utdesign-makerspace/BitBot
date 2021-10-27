require('dotenv').config();

const { DISCORD_TOKEN } = process.env;

const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
  console.log('Ready!');
});

client.login(DISCORD_TOKEN);
