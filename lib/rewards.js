const Discord = require('discord.js');
const { getStoreItems } = require('./store');

module.exports = {
	async getSelectMenu() {
		const selectMenu = new Discord.MessageSelectMenu()
			.setCustomId('store')
			.setPlaceholder('Select a reward for more information');
		const items = await getStoreItems();
		items.forEach((item, index) => {
			selectMenu.addOptions([
				{
					label: item.Title,
					description: item.Description,
					value: item.id,
					emoji: item.Emoji
				}
			]);
		});
		return selectMenu;
	}
};
