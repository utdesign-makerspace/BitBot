const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	printers: [
		{
			name: 'Blue',
			ip: '192.168.193.4',
			model: 'CR-10 V2',
			apikey: process.env.BLUE_APIKEY,
			color: '#55acee',
			thumbnail: 'https://i.imgur.com/2rZfi6p.png',
			enabled: true,
			ssl: false
		},
		{
			name: 'Red',
			ip: '192.168.193.79',
			model: 'Ender-3 Pro',
			apikey: process.env.RED_APIKEY,
			color: '#bb645f',
			thumbnail: 'https://wiki.utdmaker.space/equipment/ender-3-pro.png',
			enabled: true,
			ssl: true
		},
		{
			name: 'White',
			ip: '192.168.193.20',
			model: 'Ender-3 Pro',
			apikey: process.env.WHITE_APIKEY,
			color: '#e9e9e9',
			thumbnail: 'https://wiki.utdmaker.space/equipment/ender-3-pro.png',
			enabled: true,
			ssl: true
		},
		{
			name: 'Yellow',
			ip: '192.168.193.60',
			model: 'Ender-3 Pro',
			apikey: process.env.YELLOW_APIKEY,
			color: '#e3d765',
			thumbnail: 'https://wiki.utdmaker.space/equipment/ender-3-pro.png',
			enabled: true,
			ssl: true
		},
		{
			name: 'Orange',
			ip: '192.168.193.76',
			model: 'Prusa Mini+',
			apikey: process.env.ORANGE_APIKEY,
			color: '#e39665',
			thumbnail: 'https://cdn.shop.prusa3d.com/3667/original-prusa-mini.jpg',
			enabled: true,
			ssl: false
		}
	],
	printerChoices: [
		['Blue', 0],
		['Red', 1],
		['White', 2],
		['Yellow', 3],
		['Orange', 4]
	]
};
