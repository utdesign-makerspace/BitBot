require('dotenv').config();

const { DISCORD_TOKEN, MONGODB_SRV, MQTT_HOST, MQTT_USER, MQTT_PASS } =
	process.env;

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const constants = require('./lib/constants');
const cron = require('cron');

const mqttClient = mqtt.connect(MQTT_HOST, {
	username: MQTT_USER,
	password: MQTT_PASS
});
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const jobs = [];
client.commands = new Collection();
fs.readdirSync('./commands')
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => {
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	});

client.buttons = new Collection();
fs.readdirSync('./buttons')
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => {
		const button = require(`./buttons/${file}`);
		client.buttons.set(button.id, button);
	});

client.printerEvents = new Collection();
fs.readdirSync('./printer_events')
	.filter((file) => file.endsWith('.js'))
	.forEach((file) => {
		const printerEvent = require(`./printer_events/${file}`);
		client.printerEvents.set(printerEvent.name, printerEvent);
	});

client.once('ready', () => {
	console.log('Ready!');
	fs.readdirSync('./jobs')
		.filter((file) => file.endsWith('.js'))
		.forEach((file) => {
			const job = require(`./jobs/${file}`);
			// Set a new item in the Collection
			// With the key as the command name and the value as the exported module
			const cronJob = new cron.CronJob(
				job.cron,
				() => {
					try {
						job.action();
					} catch (error) {
						console.error(error);
					}
				},
				null,
				true,
				'America/Los_Angeles'
			);
			cronJob.start();
			jobs.push(cronJob);
		});
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand() && !interaction.isButton()) return;

	if (interaction.isButton()) {
		let args = interaction.customId.split(' ');
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
		if (command.ephemeral)
			await interaction.deferReply({ ephemeral: true });
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

mqttClient.on('connect', async function () {
	console.log('MQTT connected.');

	const printerArray = constants.printers;
	for (let i = 0; i < printerArray.length; i++) {
		const printer = printerArray[i];
		mqttClient.subscribe(
			`${printer.name.toLowerCase()}/event/PrintStarted`
		);
		mqttClient.subscribe(
			`${printer.name.toLowerCase()}/event/PrintCancelled`
		);
		mqttClient.subscribe(`${printer.name.toLowerCase()}/event/PrintDone`);
	}

	console.log('Subscribed to MQTT events.');
});

mqttClient.on('message', async function (topic, message) {
	const data = JSON.parse(message.toString());

	// If the timestamp of the event is older than five seconds, ignore it
	const now = new Date();
	if (now - new Date(data._timestamp * 1000) > 5000) return;

	// Grab the printer name
	const printerId = constants.printers.indexOf(
		constants.printers.find(
			(p) => p.name.toLowerCase() === topic.split('/')[0]
		)
	);

	// Run the printer event
	const event = client.printerEvents.get(data._event);

	if (!event) return;

	try {
		await event.execute(data, printerId, client);
	} catch (error) {
		console.error(error);
	}
});
