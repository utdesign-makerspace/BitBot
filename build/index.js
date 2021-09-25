"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var discord_js_1 = require("discord.js");
var DISCORD_TOKEN = process.env.DISCORD_TOKEN;
var bot = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.DIRECT_MESSAGES] });
bot.once("ready", function () {
    console.log("Ready!");
});
bot.login(DISCORD_TOKEN);
