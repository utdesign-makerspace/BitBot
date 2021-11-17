const Discord = require('discord.js');
const constants = require('./constants');
const printers = require('./printers');

module.exports = {
	// NOTE: All methods assume message will NOT be ephemeral. You will need to add that yourself.
	async getFarmEmbed() {
		return new Promise(async (resolve) => {
			// Create our base embed
			let statusEmbed = new Discord.MessageEmbed()
				.setColor('#c1393d')
				.setTitle(':information_source:  Printer Status')
				.setFooter('Printers are first come, first served')
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

				if (!farmState[i] || state == 'offline') offline += printerText;
				else if (state == 'busy') inUse += printerText;
				else available += printerText;
			}

			// Only add field if information for it exists
			if (available) statusEmbed.addField('Available', available, true);
			if (inUse) statusEmbed.addField('Busy', inUse, true);
			if (offline) statusEmbed.addField('Offline', offline, true);

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
				printerData = await printers.getJob(printerArray[i].lookup);
				if (printerData) stateArray.push(printerData.state);
				else stateArray.push(null);
			}
			resolve(stateArray);
		});
	}
};
