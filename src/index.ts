console.log(
	`                        @=                        
               .@+      #=      #*                
                :#:    :--:    =*                 
                     +@@@@@@+                     
                    +@@@@@@@@=                    
                    +@@@@@@@@=                    
                     +@@@@@@=                     
                       -@@-                       
                     .=*@@*-.                     
     -#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#:     
    -@@=.                                .+@@:    
    =@@                                   .@@-    
.-=*@@@    @%%%%%%%%%%%%%%%%%%%%%%%%%%%   .@@@#+-.
#@@@%@@    @*   :.              :.   +%   .@@%%@@*
#@% =@@    @*  %@*            .%@=   +%   .@@- %@*
#@% =@@    @* .@@@@.          :@@@@  +%   .@@- %@*
#@% =@@    @*  =@@=            +@%-  +%   .@@- @@*
#@@*#@@    #%:                      :%*   .@@#*@@*
.-+*@@@     =#%@@@@@@@@@@@@@@@@@@@@@#=    .@@%*=: 
    =@@                                   .@@-    
    -@@=..................................+@@:    
     -%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%-     
        .....@@#++++++++++++++++++#@@:....        
           =*@@-                  -@@*-           
        .*@@%@@-#@*======*@# -#%*:-@@%@@*:        
       +@@#: @@-#@-      -@# %@@@#-@@ :#@@*       
      #@@:   @@-*%*++++++*%* .=+= -@@   :%@%      
    :*@@#.   @@-                  -@@    +@@*:    
  :%@@@@@@+  @@%##################%@@  -@@@@@@%-  
  #%%+ :%%%- =+++++++++++++++++++++++ .@@@=.+@@@: 
`
);

if (process.env.NODE_ENV !== 'production')
	console.warn(
		'⚠️ You are not running in production! LDAP sync will not run.\n'
	);

require('dotenv').config();

const { DISCORD_TOKEN, MONGODB_SRV, MQTT_HOST, MQTT_USER, MQTT_PASS } =
	process.env;

import fs = require('fs');
import read = require('fs-readdir-recursive');
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import mongoose = require('mongoose');
mongoose.set('strictQuery', true);
import mqtt = require('mqtt');
import constants = require('./lib/constants');
import cron = require('cron');
import Sentry = require('@sentry/node');
import farm = require('./lib/farm');
require('./helpers/deploy-commands')();
import snippetModel = require('./lib/models/snippetSchema');
import * as Discord from 'discord.js';

if (
	process.env.NODE_ENV === 'production' &&
	process.env.hasOwnProperty('SENTRY_DSN')
) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: 1.0
	});
}

const mqttClient = mqtt.connect(MQTT_HOST ?? 'mqtt://localhost', {
	username: MQTT_USER,
	password: MQTT_PASS
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const jobs = [];
const commands = new Collection<string, any>();
fs.readdirSync('./src/commands')
	.filter((file: string) => file.endsWith('.ts'))
	.forEach((file: string) => {
		const command = require(`./commands/${file}`);
		commands.set(command.data.name, command);
	});

const buttons = new Collection<string, any>();
read('./src/buttons')
	.filter((file: string) => file.endsWith('.ts'))
	.forEach((file: string) => {
		const button = require(`./buttons/${file}`);
		buttons.set(button.id, button);
	});

const printerEvents = new Collection<string, any>();
fs.readdirSync('./src/printer_events')
	.filter((file: string) => file.endsWith('.ts'))
	.forEach((file: string) => {
		const printerEvent = require(`./printer_events/${file}`);
		printerEvents.set(printerEvent.name, printerEvent);
	});

client.once('ready', async () => {
	console.log('🟢 Connected to Discord.');

	// Presence system
	farm.setPresence(client);
	setInterval(async () => {
		farm.setPresence(client);
	}, 5 * 60 * 1000);

	// Cron job system
	fs.readdirSync('./src/jobs')
		.filter((file: string) => file.endsWith('.ts'))
		.forEach(async (file: string) => {
			const job = require(`./jobs/${file}`);
			// Set a new item in the Collection
			// With the key as the command name and the value as the exported module
			const cronJob = new cron.CronJob(
				job.cron,
				() => {
					try {
						job.action(client);
					} catch (error) {
						if (process.env.NODE_ENV === 'production') {
							Sentry.captureException(error);
						}
						console.error(error);
					}
				},
				null,
				true,
				'America/Chicago'
			);
			cronJob.start();
			jobs.push(cronJob);
			if (job.runOnStart) {
				await job.action(client);
			}
		});

	// Update permissions
	// const guildCommands = await client.guilds.cache
	// 	.get(GUILD_ID)
	// 	.commands.fetch();
	// const permissions = [
	// 	{
	// 		id: OFFICER_ID,
	// 		type: 'ROLE',
	// 		permission: true
	// 	}
	// ];
	// console.log('Updating command permissions.');
	// client.commands.each((cmd) => {
	// 	if (!cmd.context) {
	// 		const command = guildCommands.find((c) => c.name == cmd.data.name);
	// 		if (command && cmd.data.defaultPermission == false) {
	// 			command.permissions.add({ permissions });
	// 			console.log(
	// 				`Added officer permission to ${cmd.data.name} command.`
	// 			);
	// 		}
	// 	}
	// });
});

client.on('interactionCreate', async (interaction: Discord.Interaction) => {
	if (interaction.isButton()) {
		let args = interaction.customId.split(' ');
		let id = args.shift();

		const button = buttons.get(id ?? '');

		if (!button) return;

		try {
			await button.execute(interaction, args);
		} catch (error) {
			console.error(error); // Since we don't know what every button will do, we can't tell the user
			if (process.env.NODE_ENV === 'production') {
				Sentry.captureException(error);
			}
		}
	}

	if (interaction.isAutocomplete()) {
		if (
			interaction.commandName === 'snippet' ||
			interaction.commandName === 'snipadmin'
		) {
			const focused = interaction.options.getFocused();
			// create array filteredOptions with all snippets in database that contain user input in lowercase
			const filteredOptions = await snippetModel.Snippet.find({
				title: { $regex: focused, $options: 'i' }
			});

			await interaction.respond(
				filteredOptions.map((choice: any) => ({
					name: choice.title,
					value: choice.title
				}))
			);
		}
	}

	// check if interaction is a button and has an embed
	if (interaction.isModalSubmit()) {
		if (interaction.customId === 'addSnippet') {
			// create a new snippet in the database
			let snip;
			try {
				snip = await snippetModel.Snippet.findOne({
					title: interaction.fields.getTextInputValue('title')
				});

				if (!snip) {
					let snipData = {
						title: interaction.fields.getTextInputValue('title'),
						body: interaction.fields.getTextInputValue('body')
					};
					snip = await snippetModel.Snippet.create(snipData);
					await snip.save();
					await interaction.reply({
						content: `Snippet "${snip.title}" created!`,
						ephemeral: true
					});
					return;
				}

				await interaction.reply({
					content: 'A snippet with that name already exists.',
					ephemeral: true
				});
				return;
			} catch (err) {
				console.log(err);
				return;
			}
		} else if (interaction.customId.startsWith('editSnippet')) {
			// edit a snippet in the database
			let snip;
			try {
				snip = await snippetModel.Snippet.findOne({
					_id: interaction.customId.substring(12)
				});

				if (!snip) {
					await interaction.reply({
						content: 'That snippet does not exist.',
						ephemeral: true
					});
					return;
				}

				snip.title = interaction.fields.getTextInputValue('title');
				snip.body = interaction.fields.getTextInputValue('body');
				await snip.save();
				await interaction.reply({
					content: `Snippet "${snip.title}" edited!`,
					ephemeral: true
				});
				return;
			} catch (err) {
				console.log(err);
				return;
			}
		}
	}

	if (
		!interaction.isCommand() &&
		!interaction.isUserContextMenuCommand() &&
		!interaction.isMessageContextMenuCommand()
	)
		return;

	const command = commands.get(interaction.commandName);

	if (!command) return;

	try {
		if (!command.noDefer) {
			if (command.ephemeral)
				await interaction.deferReply({ ephemeral: true });
			else await interaction.deferReply();
		}
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (process.env.NODE_ENV === 'production') {
			Sentry.captureException(error);
		}
		await interaction.editReply({
			content: 'There was an error while executing this command!'
		});
	}
});

client.login(DISCORD_TOKEN);

mongoose
	.connect(MONGODB_SRV ?? 'mongodb://localhost:27017/', {
		useNewUrlParser: true,
		useUnifiedTopology: true
	} as mongoose.ConnectOptions)
	.then(() => {
		console.log('🟢 Connected to the database.');
	})
	.catch((err: any) => {
		console.log(err);
	});

mqttClient.on('connect', async function () {
	// console.log('🟢 MQTT connected.');

	const printerArray = Object.keys(constants.printers).map((key) => {
		const data = constants.printers[key];
		data.key = key;
		return data;
	});
	for (let i = 0; i < printerArray.length; i++) {
		const printer = printerArray[i];
		mqttClient.subscribe(
			`${printer.name.toLowerCase()}/event/PrintStarted`
		);
		mqttClient.subscribe(
			`${printer.name.toLowerCase()}/event/PrintCancelled`
		);
		mqttClient.subscribe(`${printer.name.toLowerCase()}/event/PrintPaused`);
		mqttClient.subscribe(`${printer.name.toLowerCase()}/event/PrintDone`);
	}

	console.log('🟢 Subscribed to MQTT events.');
});

mqttClient.on('message', async function (topic: string, message: string) {
	const data = JSON.parse(message.toString());

	// If the timestamp of the event is older than five seconds, ignore it
	const now = new Date();
	if (now.getTime() - new Date(data._timestamp * 1000).getTime() > 5000)
		return;

	// Grab the printer name
	const printerId = topic.split('/')[0];

	// Run the printer event
	const event = printerEvents.get(data._event);

	if (!event) return;

	try {
		await event.execute(data, printerId, client);
	} catch (error) {
		console.error(error);
		if (process.env.NODE_ENV === 'production') {
			Sentry.captureException(error);
		}
	}
});
