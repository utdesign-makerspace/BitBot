const { google } = require('googleapis');
const { addWeeks } = require('date-fns');
const Discord = require('discord.js');
const { CALENDAR_ID } = process.env;

module.exports = {
	getGoogleEvents: async function () {
		const client = new google.auth.GoogleAuth({
			keyFile: './google-credentials.json',
			scopes: ['https://www.googleapis.com/auth/calendar']
		});

		const calendar = google.calendar({ version: 'v3', auth: client });

		const data = await calendar.events.list({
			calendarId: CALENDAR_ID,
			timeMin: new Date().toISOString(),
			timeMax: addWeeks(new Date(), 2).toISOString(),
			singleEvents: true,
			orderBy: 'startTime'
		});

		const events = data.data.items.map((appointment) => ({
			start: appointment.start.dateTime || appointment.start.date,
			end: appointment.end.dateTime || appointment.end.date,
			id: appointment.id,
			status: appointment.status,
			summary: appointment.summary,
			description: appointment.description
				? appointment.description.replace(/<[^>]*>?/gm, '')
				: ''
		}));
		return events;
	},
	updateDiscordEvents: async function (guild) {
		const events = await this.getGoogleEvents();
		events.forEach(async (e) => {
			const existingEvent = await guild.scheduledEvents.cache.find(
				(event) =>
					event.name == e.summary &&
					event.scheduledStartAt.getTime() ==
						new Date(e.start).getTime()
			);
			if (!existingEvent) {
				console.log(`Creating ${e.summary} event on Discord`);
				guild.scheduledEvents.create({
					name: e.summary,
					scheduledStartTime: new Date(e.start),
					scheduledEndTime: new Date(e.end),
					privacyLevel: 2,
					entityType: 3,
					description: e.description,
					entityMetadata: {
						location: 'UTDesign Makerspace (SPN 2.220)'
					}
				});
			} else {
				console.log(`${e.summary} already exists on Discord`);
			}
		});
		return;
	}
};
