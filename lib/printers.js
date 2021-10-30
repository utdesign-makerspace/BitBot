const Discord = require('discord.js');
const constants = require('../lib/constants');
const axios = require('axios');
const https = require('https');
const humanizeDuration = require('humanize-duration');

module.exports = {
    // NOTE: All methods assume message will NOT be ephemeral. You will need to add that yourself.
    async getMessage(printerID, detailed) {
        return new Promise(async resolve => {
            const printer = constants.printers[printerID];

		    // Create beginning of embed
		    const statusEmbed = new Discord.MessageEmbed()
		    	.setColor(printer.color)
		    	.setAuthor(printer.name + ' - ' + printer.model)
		    	.setThumbnail(printer.thumbnail)
		    	.setFooter('Printers are first come, first served')
		    	.setTimestamp();

		    const data = await this.getData(printerID);
            const snapshotBuffer = await this.getSnapshotBuffer(printerID);

		    const snapshot = new Discord.MessageAttachment(
		    	snapshotBuffer,
		    	'snapshot.jpg'
		    );
		    try {
		    	data.state;
		    } catch (error) {
		    	console.log(error);
		    	statusEmbed
		    		.setTitle('🔴  Printer Offline')
		    		.addField('Available', 'Probably', true)
		    		.addField(
		    			'More Info',
		    			'It is very likely that the printer is off or octoprint has been disconnected to '
		    		);
		    	resolve ({ embeds: [statusEmbed] });
		    }
		    if (data.state !== 'Printing') {
		    	// example is available
		    	statusEmbed
		    		.setTitle('🟢  Printer Available')
		    		.addField('Available', 'Yes', true)
		    		.setImage('attachment://snapshot.jpg');
		    } else {
		    	// example is in use
		    	statusEmbed
		    		.setTitle('🟡  Printer In Use')
		    		.setImage('attachment://snapshot.jpg');

                if (detailed) {
                    statusEmbed.addField(
                        'File Name',
                        data.job.file.name,
                        false
                    ).addField(
                        'User',
                        data.job.user,
                        false
                    ).addField(
                        'Estimated Print Time',
                        humanizeDuration(data.job.estimatedPrintTime * 1000, { round: true }),
                        false
                    );
                }
                statusEmbed.addField(
		    		'Available',
		    		`<t:${Math.round(Date.now() / 1000) + data.progress.printTimeLeft}:R>`,
		    		true
		    	);
                if (detailed) {
                    statusEmbed.addField(
                        'Progress',
                        `${Math.floor(data.progress.completion)}%`,
                        true
                    ).addField(
                        'Started at',
                        `<t:${Math.round(Date.now() / 1000) - data.progress.printTime}:f>`,
                        false
                    );
                }
		    	statusEmbed.addField(
                    'Estimated to finish at',
                    `<t:${Math.round(Date.now() / 1000) + data.progress.printTimeLeft}:f>`,
                    false
		    	);
		    }

		    // Resolve message
		    resolve({
		    	embeds: [statusEmbed],
		    	ephemeral: true,
		    	files: [snapshot]
		    });
        });
    },
    async getData(printerID) {
        return new Promise(async resolve => {
            const printer = constants.printers[printerID];

		    try {
		    	var {
		    		data
		    	} = await axios({
		    		method: 'get',
		    		url: `http${printer.ssl ? 's' : ''}://${printer.ip}/api/job`,
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
		    	resolve(null);
		    }
        });
    },
    async getSnapshotBuffer(printerID) {
        return new Promise(async resolve => {
            const printer = constants.printers[printerID];

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
        });
    },
}