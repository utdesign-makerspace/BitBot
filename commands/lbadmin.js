const { SlashCommandBuilder } = require('@discordjs/builders');
const gameModel = require('../lib/models/gameSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lbadmin')
		.setDescription('Admin commands for managing leaderboards.')
		.setDefaultPermission(false)
		.addSubcommand((sub) =>
			sub
				.setName('create')
				.setDescription('Creates a new leaderboard.')
				.addStringOption((option) =>
					option
						.setName('title')
						.setDescription('The title of the game')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('type')
						.setDescription('The type of leaderboard')
						.setRequired(true)
						.addChoices([
							['Time (Ascending)', 'TimeAscending'],
							['Time (Descending)', 'TimeDescending'],
							['Score (Ascending)', 'ScoreAscending'],
							['Score (Descending)', 'ScoreDescending']
						])
				)
				.addStringOption((option) =>
					option
						.setName('iconurl')
						.setDescription(
							'URL of an icon to be displayed alongside the leaderboard'
						)
				)
		),
	ephemeral: true,
	async execute(interaction) {
		const title = interaction.options.getString('title');
		const type = interaction.options.getString('type');
		const iconURL = interaction.options.getString('iconurl');

		let data = {
			title: title,
			leaderboardNames: ['Game'],
			leaderboardTypes: [type]
		};
		if (iconURL) data.iconURL = iconURL;

		let game = await gameModel.create(data);
		await game.save();

		interaction.editReply({
			content: `Created a leaderboard for ${title}. If you would like to add additional gamemodes for the game, please refer to the IT Docs.`
		});
	}
};
