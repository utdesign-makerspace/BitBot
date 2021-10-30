const dotenv = require('dotenv');
const Discord = require('discord.js');
dotenv.config();

module.exports = {
  printers: [
    {
      name: 'Blue',
      ip: '192.168.193.4',
      model: 'CR-10 V2',
      apikey: process.env.BLUE_APIKEY,
      color: '#55acee',
      thumbnail: 'https://i.imgur.com/n6rfE1w.png',
      enabled: true,
      ssl: false,
      emoji: '🔵',
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
      emoji: '🔴',
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
      emoji: '⚪',
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
      emoji: '🟡',
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
      emoji: '🟠',
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
    showButtonId: 'detailed',
    hideButtonId: 'basic',
    cancelButtonId: 'cancel',
    showButtonText: 'View Details',
    hideButtonText: 'Hide Details',
    cancelButtonText: 'Cancel Print',
  }
};
