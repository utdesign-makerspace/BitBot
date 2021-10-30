require('dotenv').config();

const { DISCORD_TOKEN, MONGODB_SRV } = process.env;

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const mongoose = require('mongoose');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
fs.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => {
		const command = require(`./commands/${file}`);
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		client.commands.set(command.data.name, command);
	});

client.buttons = new Collection();
fs.readdirSync('./buttons')
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => {
		const button = require(`./buttons/${file}`);
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		client.buttons.set(button.id, button);
	});

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand() && !interaction.isButton()) return;

	if (interaction.isButton()) {
		let args = interaction.customId.split(" ");
		let id = args.shift();

		const button = client.buttons.get(id);

		if (!button) return;

		try {
			await button.execute(interaction, args);
		} catch (error) {
			console.error(error); // Since we don't know what every button will do, we can't tell the user
		}
	}

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		if (command.ephemeral) await interaction.deferReply({ ephemeral: true });
		else await interaction.deferReply();
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.editReply({
			content: 'There was an error while executing this command!',
			ephemeral: true
		});
	}
});

client.login(DISCORD_TOKEN);

mongoose
	.connect(MONGODB_SRV, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('Connected to the database.');
	})
	.catch((err) => {
		console.log(err);
	});
