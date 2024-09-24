const { CommandInteraction, Client, ChannelType } = require('discord.js');
const { BOT_ADMINS } = require('../../constants');

module.exports = {
  name: 'invite',
  description: 'Generate an invite link for the specified guild ID.',
  options: [
    {
      name: 'guild_id',
      type: 'STRING',
      description: 'The ID of the guild to generate an invite for.',
      required: true,
    },
  ],
  async execute(interaction) {
    // Check if the command is invoked as a slash command
    if (interaction instanceof CommandInteraction) {
      return await handleSlashCommand(interaction);
    }

    // Check if the command is invoked as a message command
    if (interaction.content.startsWith(',,invite')) {
      const args = interaction.content.split(' ').slice(1);
      const guildId = args[0];

      return await handleMessageCommand(interaction, guildId);
    }

    // Fallback response if command is invoked incorrectly
    return interaction.reply({ content: 'Invalid command usage. Use as a slash command or message command.', ephemeral: true });
  },
};

async function handleSlashCommand(interaction) {
  // Check if the user is a bot admin
  if (!BOT_ADMINS.includes(interaction.user.id)) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  const guildId = interaction.options.getString('guild_id');
  return await generateInvite(interaction, guildId);
}

async function handleMessageCommand(interaction, guildId) {
  // Check if the user is a bot admin
  if (!BOT_ADMINS.includes(interaction.author.id)) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  return await generateInvite(interaction, guildId);
}

async function generateInvite(interaction, guildId) {
  const guild = interaction.client.guilds.cache.get(guildId);
  if (!guild) {
    return interaction.reply({ content: 'The bot is not in that server or the server does not exist.', ephemeral: true });
  }

  const textChannel = guild.channels.cache.find(channel => channel.type === ChannelType.GuildText);
  if (!textChannel) {
    return interaction.reply({ content: 'There are no text channels available in that server.', ephemeral: true });
  }

  try {
    const invite = await textChannel.createInvite({ maxAge: 0, maxUses: 0 }); // Permanent invite
    return interaction.reply(`Here is your invite link: || ${invite.url} ||`);
  } catch (error) {
    console.error('Error creating invite:', error);
    return interaction.reply({ content: 'An error occurred while trying to create an invite link. Please try again later.', ephemeral: true });
  }
}
