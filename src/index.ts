require('dotenv').config();

import { Client, Intents } from "discord.js";

const { DISCORD_TOKEN } = process.env;

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

bot.once("ready", () => {
    console.log("Ready!");
});

bot.login(DISCORD_TOKEN);