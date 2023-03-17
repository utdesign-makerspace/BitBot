const dotenv = require('dotenv');
const Discord = require('discord.js');
dotenv.config();

module.exports = {
	// If you have contributed to our project on GitHub, add your Discord user ID here
	contributors: [
		'164134588275228674',
		'201049866967711744',
		'143179553529921536',
		'264617528217567233',
		'714700986601570335'
	],
	printers: {
		virgo: {
			name: 'Virgo', // [name].utd.ms, should be capitalized
			ip: '192.168.193.20', // ZeroTier address
			model: 'Ender-3 Pro', // Model of the printer, manufacturer should not be included unless necessary (ex. Prusa Mini+)
			apikey: process.env.WHITE_APIKEY, // API key to use REST API
			color: '#e6e7e8', // DEPRECATED! Hex code that matches emoji color on Discord
			thumbnail: 'https://i.imgur.com/18fhzLl.png', // Transparent image of the printer (preferably 512x512 max)
			enabled: true, // Whether or not the printer should be accessible via BitBot
			ssl: true, // Whether or not the printer uses an SSL certificate
			emoji: '<:ender3:908451113806729296>' // A circle emoji matching the color of the printer (used in farm status embed)
		},
		orion: {
			name: 'Orion',
			ip: '192.168.193.60',
			model: 'Ender-3 Pro',
			apikey: process.env.YELLOW_APIKEY,
			color: '#fdcb58',
			thumbnail: 'https://i.imgur.com/18fhzLl.png',
			enabled: true,
			ssl: true,
			emoji: '<:ender3:908451113806729296>'
		},
		taurus: {
			name: 'Taurus',
			ip: '192.168.193.134',
			model: 'Ender-3 Pro',
			apikey: process.env.GREEN_APIKEY,
			color: '#78b159',
			thumbnail: 'https://i.imgur.com/18fhzLl.png',
			enabled: true,
			ssl: false,
			emoji: '<:ender3:908451113806729296>'
		},
		drago: {
			name: 'Drago',
			ip: '192.168.193.235',
			model: 'Ender-3 Max',
			apikey: process.env.MAX_APIKEY,
			color: '#31373d',
			thumbnail: 'https://i.imgur.com/X2aCiYk.png',
			enabled: true,
			ssl: false,
			emoji: '<:ender3max:1086129147367145542>'
		},
		leo: {
			name: 'Leo',
			ip: '192.168.193.76',
			model: 'Prusa Mini+',
			apikey: process.env.ORANGE_APIKEY,
			color: '#f4900c',
			thumbnail: 'https://i.imgur.com/hFEczfG.png',
			enabled: true,
			ssl: false,
			emoji: '<:prusamini:1086128822702833754>'
		},
		hydra: {
			name: 'Hydra',
			ip: '192.168.193.251',
			model: 'QIDI Tech 1 Dual Extruder',
			apikey: process.env.PURPLE_APIKEY,
			color: '#aa8ed6',
			thumbnail: 'https://i.imgur.com/SAe11rI.png',
			enabled: true,
			ssl: false,
			emoji: '<:qiditech1:1086129706614669435>'
		},
		pegasus: {
			name: 'Pegasus',
			ip: '192.168.193.232',
			model: 'Prusa i3 MK3S+',
			apikey: process.env.PEGASUS_APIKEY,
			color: '#aa8ed6',
			thumbnail: 'https://i.imgur.com/w7fFy1T.png',
			enabled: true,
			ssl: false,
			emoji: '<:prusai3mk3s:1086132774173409281>'
		}
	},
	printerChoices: [
		['Drago', 'drago'],
		['Hydra', 'hydra'],
		['Leo', 'leo'],
		['Orion', 'orion'],
		['Pegasus', 'pegasus'],
		['Taurus', 'taurus'],
		['Virgo', 'virgo']
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
		['opening serial connection', 'available'],
		['maintenance', 'maintenance'],
		['under maintenance', 'maintenance']
	])
};
