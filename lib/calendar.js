const { google } = require('googleapis');
const { addWeeks } = require('date-fns');
const { CALENDAR_ID } = process.env;

module.exports = {
	getEvents: async function () {
		const client = new google.auth.GoogleAuth({
			keyFile: './google-credentials.json',
			scopes: ['https://www.googleapis.com/auth/calendar']
		});

		const calendar = google.calendar({ version: 'v3', auth: client });

		const data = await calendar.events.list({
			calendarId: CALENDAR_ID,
			timeMin: new Date().toISOString(),
			timeMax: addWeeks(new Date(), 1).toISOString(),
			singleEvents: true,
			orderBy: 'startTime'
		});

		const events = data.data.items.map((appointment) => ({
			start: appointment.start.dateTime || appointment.start.date,
			end: appointment.end.dateTime || appointment.end.date,
			id: appointment.id,
			status: appointment.status,
			creator: appointment.creator,
			description: appointment.description
		}));
		return events;
	}
};
