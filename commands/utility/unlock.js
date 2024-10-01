const {
    EmbedBuilder,
    PermissionsBitField,
  } = require('discord.js');
  const { EMBED_COLOR, EMOJIS } = require('../../constants');
  
  module.exports = {
    name: 'unlock',
    description: 'Unlocks a specified channel or the current channel.',
    async execute(message, args) {
      // Check if the user has permission to manage channels
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} You need the \`MANAGE_CHANNELS\` permission to use this command.`),
          ],
        });
      }
  
      // Determine the channel to unlock
      const channelToUnlock = message.mentions.channels.first() || message.channel;
  
      // Check if the channel is already unlocked
      const permissionOverwrites = channelToUnlock.permissionOverwrites.cache.get(message.guild.roles.everyone.id);
      const isUnlocked = permissionOverwrites && permissionOverwrites.allow.has(PermissionsBitField.Flags.SendMessages);
  
      // Inform the user if the channel is already unlocked
      if (isUnlocked) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.WARNING} The channel ${channelToUnlock} is already unlocked.`),
          ],
        });
      }
  
      try {
        // Update the channel's permission to allow members to send messages
        await channelToUnlock.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: true,
        });
  
        // Confirmation message
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} The channel ${channelToUnlock} has been unlocked.`),
          ],
        });
      } catch (error) {
        console.error(error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} There was an error unlocking the channel. Please try again.`),
          ],
        });
      }
    },
  };
  