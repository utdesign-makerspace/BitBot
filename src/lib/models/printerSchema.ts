import mongoose = require('mongoose');

export interface IPrinter extends mongoose.Document {
	id: string;
	underMaintenance: boolean;
	maintenanceReason?: string;
	watcher?: string;
}

const printerSchema = new mongoose.Schema({
	id: { type: String, require: true, unique: true }, // The ID of the printer, ex. "red"
	underMaintenance: { type: Boolean, require: true, default: false }, // Whether or not the printer is under maintenance
	maintenanceReason: { type: String }, // The reason for the printer being under maintenance, ex. "No magnetic bed"
	watcher: { type: String, require: true, default: null } // The ID of the user waiting for the printer
	// bambu: {
	// 	type: {
	// 		serialNumber: { type: String, require: true, unique: true },
	// 		ipAddress: { type: String, require: true },
	// 	},
	// 	require: false,
	// }
});

export const Printer = mongoose.model<IPrinter>('printers', printerSchema);
export default Printer;
