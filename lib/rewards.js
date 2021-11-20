const Discord = require('discord.js');
const constants = require('./constants');

module.exports = {
	async getSelectMenu() {
		const selectMenu = new Discord.MessageSelectMenu()
			.setCustomId('store')
			.setPlaceholder('Select a reward for more information');
		Object.keys(constants.rewards).forEach((key) => {
			const reward = constants.rewards[key];
			selectMenu.addOptions([
				{
					label: reward.name,
					description: `${reward.price} Bits`,
					value: key,
					emoji: reward.emoji ? reward.emoji : '🏆'
				}
			]);
		});
		return selectMenu;
	}
};
