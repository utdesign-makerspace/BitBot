const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
dotenv.config();

const commands = [];
fs.readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const command = require(`./commands/${file}`);
    if (command.context) commands.push(command.data);
    else commands.push(command.data.toJSON());
  });

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) guild commands.');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) guild commands.');
  } catch (error) {
    console.error(error);
  }
})();
