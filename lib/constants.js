const dotenv = require('dotenv');
const Discord = require('discord.js');
dotenv.config();

module.exports = {
	// If you have contributed to our project on GitHub, add your Discord user ID here
	contributors: [
		'164134588275228674',
		'201049866967711744',
		'143179553529921536'
	],
	printers: {
		red: {
			name: 'Red', // [name].utd.ms
			ip: '192.168.193.79', // ZeroTier address
			model: 'Ender-3 Pro', // Model of the printer, manufacturer should not be included unless necessary (ex. Prusa Mini+)
			apikey: process.env.RED_APIKEY, // API key to use REST API
			color: '#dd2e44', // Hex code that matches emoji color on Discord
			thumbnail: 'https://i.imgur.com/18fhzLl.png', // Transparent image of the printer (preferably 512x512 max)
			enabled: true, // Whether or not the printer should be accessible via BitBot
			ssl: true, // Whether or not the printer uses an SSL certificate
			emoji: '🔴' // A circle emoji matching the color of the printer (used in farm status embed)
		},
		white: {
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
		yellow: {
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
		green: {
			name: 'Green',
			ip: '192.168.193.134',
			model: 'Ender-3 Pro',
			apikey: process.env.GREEN_APIKEY,
			color: '#78b159',
			thumbnail: 'https://i.imgur.com/18fhzLl.png',
			enabled: true,
			ssl: false,
			emoji: '🟢'
		},
		blue: {
			name: 'Blue',
			ip: '192.168.193.4',
			model: 'CR-10 V2',
			apikey: process.env.BLUE_APIKEY,
			color: '#55acee',
			thumbnail: 'https://i.imgur.com/n6rfE1w.png',
			enabled: true,
			ssl: false,
			emoji: '🔵'
		},
		max: {
			name: 'Max',
			ip: '192.168.193.235',
			model: 'Ender-3 Max',
			apikey: process.env.MAX_APIKEY,
			color: '#31373d',
			thumbnail: 'https://i.imgur.com/X2aCiYk.png',
			enabled: true,
			ssl: false,
			emoji: '⚫'
		},
		orange: {
			name: 'Orange',
			ip: '192.168.193.76',
			model: 'Prusa Mini+',
			apikey: process.env.ORANGE_APIKEY,
			color: '#f4900c',
			thumbnail: 'https://i.imgur.com/hFEczfG.png',
			enabled: true,
			ssl: false,
			emoji: '🟠'
		},
		purple: {
			name: 'Purple',
			ip: '192.168.193.251',
			model: 'QIDI Tech 1 Dual Extruder',
			apikey: process.env.PURPLE_APIKEY,
			color: '#aa8ed6',
			thumbnail: 'https://i.imgur.com/SAe11rI.png',
			enabled: true,
			ssl: false,
			emoji: '🟣'
		}
	},
	printerChoices: [
		['Red', 'red'],
		['White', 'white'],
		['Yellow', 'yellow'],
		['Green', 'green'],
		['Blue', 'blue'],
		['Max', 'max'],
		['Orange', 'orange'],
		['Purple', 'purple']
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
	technicianRoleId: '929562510779093022',
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
