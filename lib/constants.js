const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    printers: [
        {
            name: "Blue",
            ip: "blue.utd.ms",
            model: "CR-10 V2",
            apikey: process.env.BLUE_APIKEY,
            color: "#55acee",
            thumbnail: "https://i.imgur.com/2rZfi6p.png",
            enabled: true,
        },
    ],
    printerChoices: [
        ["Blue", 0],
    ],
}