const { CommandInteraction, Client } = require('discord.js');
const { BOT_ADMINS } = require('../../constants');

module.exports = {
  name: 'invite',
  description: 'Generate an invite link for the specified guild ID.',
  async execute(interaction) {
    // Check if the user is a bot admin
    if (!BOT_ADMINS.includes(interaction.user.id)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const guildId = interaction.options.getString('guild_id');
    const guild = interaction.client.guilds.cache.get(guildId);

    if (!guild) {
      return interaction.reply({ content: 'The bot is not in that server or the server does not exist.', ephemeral: true });
    }

    try {
      const invite = await guild.channels.cache
        .filter(channel => channel.type === 0) // Filter for text channels
        .first()
        .createInvite({ maxAge: 0, maxUses: 0 }); // Permanent invite

      return interaction.reply(`Here is your invite link: ${invite.url}`);
    } catch (error) {
      console.error('Error creating invite:', error);
      return interaction.reply({ content: 'An error occurred while trying to create an invite link. Please try again later.', ephemeral: true });
    }
  },
};
