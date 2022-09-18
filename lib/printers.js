const Discord = require('discord.js');
const constants = require('../lib/constants');
const axios = require('axios');
const https = require('https');
const humanizeDuration = require('humanize-duration');
const ldap = require('./ldap');
const Sentry = require('@sentry/node');
const printerModel = require('../lib/models/printerSchema');

module.exports = {
	// NOTE: All methods assume message will NOT be ephemeral. You will need to add that yourself.
	getMessage: async function (printerID, detailed) {
		// Create beginning of embed and Get the data of our printer
		const [statusEmbed, data] = await Promise.all([
			this.getEmbedTemplate(printerID),
			this.getJob(printerID)
		]);
		// If no state, we assume the printer is borked
		if (!data) {
			statusEmbed.setTitle('⚠  OctoPrint Offline').addFields(
				{ name: 'Available', value: 'No', inline: false },
				{
					name: 'More Information',
					value: `This printer's instance of OctoPrint is offline. This is usually indicative of a system failure. Please contact a <@&${constants.technicianRoleId}> and inform them of the issue.`,
					inline: false
				}
			);
			return { embeds: [statusEmbed] };
		} else {
			// Get the snapshot
			const [snapshotBuffer, printerDb] = await Promise.all([
				this.getSnapshotBuffer(printerID),
				this.getPrinterFromDb(printerID)
			]);
			let snapshot;
			if (snapshotBuffer) {
				snapshot = new Discord.AttachmentBuilder(snapshotBuffer, {
					name: 'snapshot.jpg'
				});
				statusEmbed.setImage('attachment://snapshot.jpg');
			}

			// Determine availability using constants
			const printerState = constants.states.get(data.state.toLowerCase());

			if (printerDb.underMaintenance) {
				const reason = printerDb.maintenanceReason;
				statusEmbed.setTitle('⚠  Maintenance').addFields(
					{
						name: 'Available',
						value: 'No',
						inline: true
					},
					{
						name: 'More Information',
						value: reason ? reason : '*No reason provided.*',
						inline: false
					}
				);
				statusEmbed.setImage(null);
				return {
					embeds: [statusEmbed],
					ephemeral: true
				};
			} else if (printerState == 'available') {
				statusEmbed.setTitle('🟢  Printer Available').addFields({
					name: 'Available',
					value: 'Yes',
					inline: true
				});
				if (detailed)
					statusEmbed.addFields({
						name: 'State',
						value: data.state,
						inline: true
					});
			} else if (printerState == 'busy') {
				statusEmbed.setTitle('🟡  Printer Busy');
				if (detailed && data.state == 'Printing') {
					// Find Discord ID if we can
					const ldapUser = await ldap.getUserByUsername(
						data.job.user,
						'discord'
					);
					let user = data.job.user;
					if (ldapUser && ldapUser.discord) {
						user = `<@${ldapUser.discord}>`;
					}

					// Add fields
					statusEmbed.addFields(
						{
							name: 'File Name',
							value: data.job.file.name,
							inline: false
						},
						{ name: 'User', value: user, inline: false },
						{
							name: 'Estimated Print Time',
							value: humanizeDuration(
								data.job.estimatedPrintTime * 1000,
								{ round: true }
							),
							inline: false
						}
					);
				}
				if (data.state == 'Printing')
					statusEmbed.addFields({
						name: 'Available',
						value: `<t:${
							Math.round(Date.now() / 1000) +
							data.progress.printTimeLeft
						}:R>`,
						inline: true
					});
				// If we aren't printing, we don't need an ETA
				else
					statusEmbed.addFields({
						name: 'Available',
						value: `No`,
						inline: true
					});
				if (detailed) {
					statusEmbed.addFields({
						name: 'State',
						value: data.state,
						inline: true
					});
					if (data.state == 'Printing')
						statusEmbed.addFields(
							{
								name: 'Progress',
								value: `${Math.floor(
									data.progress.completion
								)}%`,
								inline: true
							},
							{
								name: 'Started at',
								value: `<t:${
									Math.round(Date.now() / 1000) -
									data.progress.printTime
								}:f>`,
								inline: false
							}
						);
				}
				if (data.state == 'Printing')
					statusEmbed.addFields({
						name: 'Estimated to finish at',
						value: `<t:${
							Math.round(Date.now() / 1000) +
							data.progress.printTimeLeft
						}:f>`,
						inline: false
					});
			} else {
				statusEmbed.setTitle('🔴  Printer Offline').addFields({
					name: 'Available',
					value: 'Ask an officer',
					inline: true
				});
				if (detailed)
					statusEmbed.addFields({
						name: 'State',
						value: data.state,
						inline: true
					});
				statusEmbed.addFields({
					name: 'More Information',
					value: 'Printers are sometimes shut down by users after they have completed their print. This is not indicative of a system failure or maintenance, but could be the case.',
					inline: false
				});
				statusEmbed.setImage(null);
				return {
					embeds: [statusEmbed],
					ephemeral: true
				};
			}

			// Return message options
			return {
				embeds: [statusEmbed],
				ephemeral: true,
				files: [snapshot]
			};
		}
	},
	async getEmbedTemplate(printerID) {
		return new Promise(async (resolve) => {
			const printer = constants.printers[printerID];

			// Create beginning of embed
			const embed = new Discord.EmbedBuilder()
				.setColor(printer.color)
				.setAuthor({ name: printer.name + ' - ' + printer.model })
				.setThumbnail(printer.thumbnail)
				.setTimestamp();

			resolve(embed);
		});
	},
	async getJob(printerID) {
		return new Promise(async (resolve) => {
			const printer = constants.printers[printerID];

			// Try to grab printer job, resolve null if failed
			try {
				var { data } = await axios({
					method: 'get',
					url: `http${printer.ssl ? 's' : ''}://${
						printer.ip
					}/api/job`,
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + printer.apikey
					},
					httpsAgent: new https.Agent({
						rejectUnauthorized: false
					})
				});
				resolve(data);
			} catch (error) {
				console.log(error);
				if (process.env.NODE_ENV === 'production') {
					Sentry.captureException(error);
				}
				resolve(null);
			}
		});
	},
	async getSnapshotBuffer(printerID) {
		return new Promise(async (resolve) => {
			const printer = constants.printers[printerID];

			// Get snapshot data then resolve a buffer
			try {
				const { data: snapshotData } = await axios({
					method: 'get',
					url: `http${printer.ssl ? 's' : ''}://${
						printer.ip
					}/webcam/?action=snapshot`,
					httpsAgent: new https.Agent({
						rejectUnauthorized: false
					}),
					responseType: 'arraybuffer'
				});
				resolve(Buffer.from(snapshotData, 'utf-8'));
			} catch (error) {
				console.log(error);
				if (process.env.NODE_ENV === 'production') {
					Sentry.captureException(error);
				}
				resolve(null);
			}
		});
	},
	async cancelJob(printerID) {
		return new Promise(async (resolve) => {
			const printer = constants.printers[printerID];

			// Try to cancel the print job, resolve null if failed
			try {
				var { data } = await axios({
					method: 'post',
					url: `http${printer.ssl ? 's' : ''}://${
						printer.ip
					}/api/job`,
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + printer.apikey
					},
					httpsAgent: new https.Agent({
						rejectUnauthorized: false
					}),
					data: {
						command: 'cancel'
					}
				});
				resolve(data);
			} catch (error) {
				if (process.env.NODE_ENV === 'production') {
					Sentry.captureException(error);
				}
				console.log(error);
				resolve(null);
			}
		});
	},
	getPrinterFromDb: async function (printerID) {
		let printer;
		try {
			printer = await printerModel.findOne({ id: printerID });
			if (!printer) {
				let printerData = {
					id: printerID,
					underMaintenance: false,
					watcher: null
				};
				printer = await printerModel.create(printerData);
				await printer.save();
				return printer;
			} else return printer;
		} catch (err) {
			console.log(err);
			return;
		}
	},
	setMaintenance: async function (printerID, reason) {
		// Get printer from db
		let printer = await this.getPrinterFromDb(printerID);

		// If there is a reason, enable maintenance mode and set reason
		printer.underMaintenance = reason ? true : false;
		if (reason) printer.maintenanceReason = reason;

		// Save
		await printer.save();

		// We're done, return true
		return true;
	},
	updateWatcher: async function (printerID, client) {
		// Grab printer from the database.
		let printer;
		try {
			printer = await printerModel.findOne({ id: printerID });
			if (!printer) {
				let printerData = { id: printerID };
				printer = await printerModel.create(printerData);
				await printer.save();
			}
		} catch (err) {
			console.log(err);
			return;
		}

		if (printer.watcher) {
			// Find the user waiting for the printer.
			const watcher = await client.users.fetch(printer.watcher);
			printer.watcher = null;
			await printer.save();
			if (!watcher) return;

			// Construct our embed.
			const watcherEmbed = await this.getEmbedTemplate(printerID);
			watcherEmbed
				.setTitle('🔓  Printer Available')
				.setDescription(
					`This printer was made available <t:${Math.round(
						Date.now() / 1000
					)}:R>. Please note that this message does not guarantee availability once you arrive.`
				)
				.setTimestamp();
			await watcher.send({ embeds: [watcherEmbed] }).catch(() => {
				// If the user is not accepting DMs, we can't send them the message.
				console.log("Couldn't send message to user: " + user.username);
			});
		}
	}
};
