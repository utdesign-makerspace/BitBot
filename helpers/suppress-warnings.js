const originalEmit = process.emit;
process.emit = function (event, error) {
	if (
		event === 'warning' &&
		error.message.includes('Setting the NODE_TLS_REJECT_UNAUTHORIZED')
	) {
		return false;
	}

	return originalEmit.apply(process, arguments);
};
