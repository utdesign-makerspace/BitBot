import * as Discord from 'discord.js';
import { Printer, printers, states } from './constants';
import { getPrinterFromDb, getJob, PrinterJob } from './printers';

// NOTE: All methods assume message will NOT be ephemeral. You will need to add that yourself.

export async function getFarmEmbed(): Promise<Discord.InteractionReplyOptions> {
	return new Promise(async (resolve) => {
		// Create our base embed
		let statusEmbed = new Discord.EmbedBuilder()
			.setColor('#c1393d')
			.setTitle(':information_source:  Printer Status')
			.setFooter({ text: 'Printers are first come, first served' })
			.setTimestamp();

		let available = '';
		let inUse = '';
		let offline = '';

		const farmState = await this.getFarmState();
		const printerArray: Printer[] = Object.keys(printers).map((key) => {
			const data = printers[key];
			data.key = key;
			return data;
		});

		// Compares each state and determines printer status to display
		for (let i = 0; i < printerArray.length; i++) {
			let printer = printerArray[i];
			let printerText = `${printer.emoji} ${printer.name}\n`;
			let state;
			if (farmState[i]) state = states.get(farmState[i].toLowerCase());

			if (!farmState[i] || state == 'offline' || state == 'maintenance')
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
}

export async function getFarmState(): Promise<(string | null)[]> {
	return new Promise(async (resolve) => {
		// Creates an array of printer states. Indexes match those of printers
		const printerArray = Object.keys(printers).map((key) => {
			const data = printers[key];
			data.key = key;
			return data;
		});
		const stateArray: (string | null)[] = [];

		for (let i = 0; i < printerArray.length; i++) {
			// Search the database for maintenance, otherwise use job status
			let printerDb = await getPrinterFromDb(printerArray[i].key ?? '');
			if (printerDb?.underMaintenance) stateArray.push('maintenance');
			else {
				let printerData = await getJob(printerArray[i].key ?? '');
				if (printerData) stateArray.push(printerData.state);
				else stateArray.push(null);
			}
		}
		resolve(stateArray);
	});
}

export async function setPresence(client: Discord.Client): Promise<void> {
	let farmState = await this.getFarmState();
	let busyPrinters = 0;
	let printerCount = Object.keys(printers).length;
	for (let i = 0; i < farmState.length; i++) {
		let state;
		if (farmState[i]) state = states.get(farmState[i].toLowerCase());

		if (state == 'offline' || state == 'maintenance') printerCount--;
		else if (!farmState[i] || state != 'available') busyPrinters++;
	}
	client.user?.setPresence({
		activities: [
			{
				name: `${busyPrinters}/${printerCount} printers in use`,
				type: Discord.ActivityType.Watching
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
	return;
}
