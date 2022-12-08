const Discord = require('discord.js');
const constants = require('./constants');
const printers = require('./printers');

module.exports = {
	// NOTE: All methods assume message will NOT be ephemeral. You will need to add that yourself.
	async getFarmEmbed() {
		return new Promise(async (resolve) => {
			// Create our base embed
			let statusEmbed = new Discord.EmbedBuilder()
				.setColor('#c1393d')
				.setTitle(':information_source:  Printer Status')
				.setFooter({ text: 'Printers are first come, first served' })
				.setTimestamp();

			available = '';
			inUse = '';
			offline = '';

			const farmState = await this.getFarmState();
			const printerArray = Object.keys(constants.printers).map((key) => {
				const data = constants.printers[key];
				data.lookup = key;
				return data;
			});

			// Compares each state and determines printer status to display
			for (i = 0; i < printerArray.length; i++) {
				printer = printerArray[i];
				printerText = `${printer.emoji} ${printer.model}\n`;
				let state;
				if (farmState[i])
					state = constants.states.get(farmState[i].toLowerCase());

				if (
					!farmState[i] ||
					state == 'offline' ||
					state == 'maintenance'
				)
					offline += printerText;
				else if (state == 'busy') inUse += printerText;
				else available += printerText;
			}

			// Only add field if information for it exists
			if (available)
				statusEmbed.addFields({
					name: 'Available',
					value: available,
					inline: true
				});
			if (inUse)
				statusEmbed.addFields({
					name: 'Busy',
					value: inUse,
					inline: true
				});
			if (offline)
				statusEmbed.addFields({
					name: 'Offline',
					value: offline,
					inline: true
				});

			resolve({ embeds: [statusEmbed], ephemeral: true });
		});
	},
	async getFarmState() {
		return new Promise(async (resolve) => {
			// Creates an array of printer states. Indexes match those of constants.printers
			const printerArray = Object.keys(constants.printers).map((key) => {
				const data = constants.printers[key];
				data.lookup = key;
				return data;
			});
			const stateArray = [];

			for (i = 0; i < printerArray.length; i++) {
				// Search the database for maintenance, otherwise use job status
				printerDb = await printers.getPrinterFromDb(
					printerArray[i].lookup
				);
				if (printerDb.underMaintenance) stateArray.push('maintenance');
				else {
					printerData = await printers.getJob(printerArray[i].lookup);
					if (printerData) stateArray.push(printerData.state);
					else stateArray.push(null);
				}
			}
			resolve(stateArray);
		});
	},
	async setPresence(client) {
		farmState = await this.getFarmState();
		busyPrinters = 0;
		printerCount = Object.keys(constants.printers).length;
		for (i = 0; i < farmState.length; i++) {
			let state;
			if (farmState[i])
				state = constants.states.get(farmState[i].toLowerCase());

			if (state == 'offline' || state == 'maintenance') printerCount--;
			else if (!farmState[i] || state != 'available') busyPrinters++;
		}
		client.user.setPresence({
			activities: [
				{
					name: `${busyPrinters}/${printerCount} printers in use`,
					type: 'WATCHING'
				}
			],
			// If no printers available, DND. If printers available, idle. If all printers available, online.
			status:
				busyPrinters == printerCount
					? 'dnd'
					: busyPrinters != 0
					? 'idle'
					: 'online'
		});
	}
};
