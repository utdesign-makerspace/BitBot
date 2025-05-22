import { type calendar_v3, google } from 'googleapis';
import { addWeeks } from 'date-fns';
import type * as Discord from 'discord.js';
const { CALENDAR_ID } = process.env;

export interface Event {
	start: string;
	end: string;
	id: string;
	status: string;
	summary: string;
	description: string;
}

export async function getGoogleEvents(): Promise<Event[]> {
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

	// We know all events will have a start and end time, so we can safely
	// ignore the type errors here.
	// @ts-ignore
	const events: Event[] = data.data.items.map(
		(appointment: calendar_v3.Schema$Event) => ({
			// @ts-ignore
			start: appointment.start.dateTime || appointment.start.date,
			// @ts-ignore
			end: appointment.end.dateTime || appointment.end.date,
			id: appointment.id,
			status: appointment.status,
			summary: appointment.summary,
			description: appointment.description
				? appointment.description.replace(/<[^>]*>?/gm, '')
				: ''
		})
	);
	return events;
}

export async function updateDiscordEvents(guild: Discord.Guild): Promise<void> {
	const currentDate = new Date().getTime();
	const events = await this.getGoogleEvents();
	for (const e of events) {
		const startDate = new Date(e.start);
		const existingEvent = await guild.scheduledEvents.cache.find(
			(event) =>
				event.name === e.summary &&
				// @ts-ignore
				event.scheduledStartAt.getTime() === startDate.getTime()
		);
		if (startDate.getTime() > currentDate && !existingEvent) {
			await guild.scheduledEvents.create({
				name: e.summary,
				scheduledStartTime: startDate,
				scheduledEndTime: new Date(e.end),
				privacyLevel: 2,
				entityType: 3,
				description: e.description,
				entityMetadata: {
					location: 'UTDesign Makerspace (SPN 2.220)'
				}
			});
			console.log(
				`📆 ${
					e.summary
				} event at ${startDate.toLocaleString()} created on Discord`
			);
		} else {
			// console.log(
			// 	`${e.summary} already exists on Discord or has already started`
			// );
		}
	}
	return;
}

export async function deleteDiscordEvents(guild: Discord.Guild): Promise<void> {
	const events = await guild.scheduledEvents.fetch();
	for (const [, event] of events) {
		await event.delete();
		console.log(`🗑️ Deleted ${event.name} event on Discord`);
	}
	console.log('✅ All events deleted');
	return;
}
