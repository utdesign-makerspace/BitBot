const mongoose = require('mongoose');

const printerSchema = new mongoose.Schema({
	id: { type: String, require: true, unique: true }, // The ID of the printer, ex. "red"
	underMaintenance: { type: Boolean, require: true, default: false }, // Whether or not the printer is under maintenance
	maintenanceReason: { type: String }, // The reason for the printer being under maintenance, ex. "No magnetic bed"
	watcher: { type: String, require: true, default: null } // The ID of the user waiting for the printer
});

const model = mongoose.model('printers', printerSchema);

module.exports = model;
