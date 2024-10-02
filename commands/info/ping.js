const { EmbedBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const os = require('os');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

module.exports = {
  name: 'ping',
  description: 'replies with pong and advanced latency info',
  async execute(message) {
    if (!message.guild) {
      return message.reply(
        `${EMOJIS.ERROR} this command can only be used in a server!`,
      );
    }

    if (
      !message.guild.members.me.permissions.has(['SendMessages', 'EmbedLinks'])
    ) {
      return message.reply(
        `${EMOJIS.ERROR} I don’t have permission to send messages or embeds here!`,
      );
    }

    try {
      const startTime = performance.now();

      // Initial reply with "latency"
      const initialReply = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`checking ping...`),
        ],
        allowedMentions: { repliedUser: false },
      });

      const latency = Math.round(performance.now() - startTime);
      const apiLatency =
        message.client.ws.ping >= 0 ? Math.round(message.client.ws.ping) : 0; // Ensure valid WS ping
      const serverRegion = message.guild.preferredLocale || 'Unknown';
      const hostname = os.hostname();

      // Create the embed with complete information
      const pingEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(
          `latency: **\`${latency}\`** ms\nws ping: **\`${apiLatency}\`** ms\nserver region: **\`${serverRegion}\`**\nhost: **\`${hostname}\`**`,
        );

      // Edit the initial reply to include the embed
      await initialReply.edit({
        content: '',
        embeds: [pingEmbed],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error('Error executing ping command:', error);
      return message.channel.send(`${EMOJIS.ERROR} something went wrong!`);
    }
  },
};
