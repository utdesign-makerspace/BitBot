require('dotenv').config();

const { DISCORD_TOKEN, MONGODB_SRV } = process.env;

const fs = require('fs');
const Discord = require('discord.js');
const { Client, Collection, Intents } = require('discord.js');
const mongoose = require('mongoose');
const constants = require('./lib/constants');
const printers = require('./lib/printers');

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

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand() && !interaction.isButton()) return;

	if (interaction.isButton()) {
		let id = interaction.customId;

		if (id.startsWith(constants.status.showButtonId)) {
			// TODO: Shorten this, maybe make a buttons folder like commands
			interaction.deferUpdate();
			const printerID = id.substring(id.indexOf(constants.status.showButtonId)+constants.status.showButtonId.length);
			let msg = await printers.getMessage(printerID, true);
			const hideButton = new Discord.MessageButton({
                customId: `${constants.status.hideButtonId}${printerID}`,
                label: constants.status.hideButtonText,
                style: 'SECONDARY',
            });
            const cancelButton = new Discord.MessageButton({
                customId: `${constants.status.cancelButtonId}${printerID}`,
                label: constants.status.cancelButtonText,
                style: 'DANGER',
                disabled: true,
            });
			const buttonRow = new Discord.MessageActionRow().addComponents(hideButton, cancelButton,);
            msg.components = [buttonRow];
			msg.attachments = [];
			await interaction.editReply(msg);
		} else if (id.startsWith(constants.status.hideButtonId)) {
			// TODO: Shorten this, maybe make a buttons folder like commands
			interaction.deferUpdate();
			const printerID = id.substring(id.indexOf(constants.status.hideButtonId)+constants.status.hideButtonId.length);
			let msg = await printers.getMessage(printerID, false);
			const showButton = new Discord.MessageButton({
                customId: `${constants.status.showButtonId}${printerID}`,
                label: constants.status.showButtonText,
                style: 'SECONDARY',
            });
            const cancelButton = new Discord.MessageButton({
                customId: `${constants.status.cancelButtonId}${printerID}`,
                label: constants.status.cancelButtonText,
                style: 'DANGER',
                disabled: true,
            });
			const buttonRow = new Discord.MessageActionRow().addComponents(showButton, cancelButton,);
            msg.components = [buttonRow];
			msg.attachments = [];
			await interaction.editReply(msg);
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
