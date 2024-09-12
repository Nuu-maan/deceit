const { ActivityType, EmbedBuilder } = require('discord.js');
const { BOT_ADMINS, EMBED_COLOR } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const embed = new EmbedBuilder().setColor(EMBED_COLOR);
const infoEmbed = createEmbed('status', 'changes the status of the bot', 'none', 'BOT_ADMIN', 'status <message>');

module.exports = {
  name: 'status',
  description: 'Changes the status of the bot',
  async execute(message, args) {
    // Ensure the user has the necessary permissions
    if (!BOT_ADMINS.includes(message.author.id)) {
      return;
    }

    // Join arguments to form the status message
    const status = args.join(' ');

    if (!status) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Set the bot's presence
    try {
      await message.client.user.setPresence({
        activities: [
          {
            name: status,
            type: ActivityType.Playing, // Or use ActivityType.Streaming, ActivityType.Listening, ActivityType.Watching as needed
          },
        ],
        status: 'online', // Options: 'online', 'idle', 'dnd', 'invisible'
      });
      embed.setDescription(`status changed to: \`${status}\``);
      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply('There was an error trying to change the status.');
    }
  },
};
