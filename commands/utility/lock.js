const {
    EmbedBuilder,
    PermissionsBitField,
  } = require('discord.js');
  const { EMBED_COLOR, EMOJIS } = require('../../constants');
  
  module.exports = {
    name: 'lock',
    description: 'Locks a specified channel or the current channel.',
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
  
      // Determine the channel to lock
      const channelToLock = message.mentions.channels.first() || message.channel;
  
      // Check if the channel is already locked
      const permissionOverwrites = channelToLock.permissionOverwrites.cache.get(message.guild.roles.everyone.id);
      const isLocked = permissionOverwrites && !permissionOverwrites.allow.has(PermissionsBitField.Flags.SendMessages);
  
      // Inform the user if the channel is already locked
      if (isLocked) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.WARNING} The channel ${channelToLock} is already locked.`),
          ],
        });
      }
  
      try {
        // Update the channel's permission to prevent members from sending messages
        await channelToLock.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: false,
        });
  
        // Confirmation message
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} The channel ${channelToLock} has been locked.`),
          ],
        });
      } catch (error) {
        console.error(error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} There was an error locking the channel. Please try again.`),
          ],
        });
      }
    },
  };
  