const arrayShuffle = (array) => {
	for (
		let i = 0, length = array.length, swap = 0, temp = '';
		i < length;
		i++
	) {
		swap = Math.floor(Math.random() * (i + 1));
		temp = array[swap];
		array[swap] = array[i];
		array[i] = temp;
	}
	return array;
};

module.exports = { arrayShuffle };
