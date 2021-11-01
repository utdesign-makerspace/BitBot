const dotenv = require('dotenv');
const Discord = require('discord.js');
dotenv.config();

module.exports = {
	printers: [
		{
			name: 'Blue', // Should be the color of the printer
			ip: '192.168.193.4', // Local IP of the printer
			model: 'CR-10 V2', // Model of the printer, manufacturer should not be included unless necessary (ex. Prusa Mini+)
			apikey: process.env.BLUE_APIKEY, // API key to use REST API
			color: '#55acee', // Hex code that matches emoji color on Discord
			thumbnail: 'https://i.imgur.com/n6rfE1w.png', // Transparent image of the printer (preferably 512x512 max)
			enabled: true, // Whether or not the printer should be accessible via BitBot
			ssl: false, // Whether or not the printer uses an SSL certificate
			emoji: '🔵' // A circle emoji matching the color of the printer (used in farm status embed)
		},
		{
			name: 'Red',
			ip: '192.168.193.79',
			model: 'Ender-3 Pro',
			apikey: process.env.RED_APIKEY,
			color: '#dd2e44',
			thumbnail: 'https://i.imgur.com/18fhzLl.png',
			enabled: true,
			ssl: true,
			emoji: '🔴'
		},
		{
			name: 'White',
			ip: '192.168.193.20',
			model: 'Ender-3 Pro',
			apikey: process.env.WHITE_APIKEY,
			color: '#e6e7e8',
			thumbnail: 'https://i.imgur.com/18fhzLl.png',
			enabled: true,
			ssl: true,
			emoji: '⚪'
		},
		{
			name: 'Yellow',
			ip: '192.168.193.60',
			model: 'Ender-3 Pro',
			apikey: process.env.YELLOW_APIKEY,
			color: '#fdcb58',
			thumbnail: 'https://i.imgur.com/18fhzLl.png',
			enabled: true,
			ssl: true,
			emoji: '🟡'
		},
		{
			name: 'Orange',
			ip: '192.168.193.76',
			model: 'Prusa Mini+',
			apikey: process.env.ORANGE_APIKEY,
			color: '#f4900c',
			thumbnail: 'https://i.imgur.com/hFEczfG.png',
			enabled: true,
			ssl: false,
			emoji: '🟠'
		}
	],
	printerChoices: [
		['Blue', 0],
		['Red', 1],
		['White', 2],
		['Yellow', 3],
		['Orange', 4]
	],
	status: {
		detailsButtonId: 'details',
		cancelButtonId: 'cancel',
		showButtonText: 'View Details',
		hideButtonText: 'Hide Details',
		cancelButtonText: 'Cancel Print',
		refreshButtonText: 'Refresh'
	},
	officerRoleName: 'Officer',
	technicianRoleId: '894802466846167090',
	states: new Map([
		['operational', 'available'],
		['printing', 'busy'],
		['pausing', 'busy'],
		['paused', 'busy'],
		['cancelling', 'busy'],
		['error', 'offline'],
		['offline', 'offline'],
		['offline after error', 'offline'],
		['opening serial connection', 'available']
	])
};
