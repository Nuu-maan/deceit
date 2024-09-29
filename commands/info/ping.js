const { EmbedBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

module.exports = {
  name: 'ping',
  description: 'Replies with Pong and latency information in a simple, minimal embed!',
  async execute(message) {
    // Check if the command is being used in a guild
    if (!message.guild) {
      return message.reply(`${EMOJIS.ERROR} This command can only be used in a server!`);
    }

    // Check permissions for sending messages and embeds
    if (!message.guild.members.me.permissions.has(['SendMessages', 'EmbedLinks'])) {
      return message.reply(`${EMOJIS.ERROR} I don't have permission to send messages or embeds here!`);
    }

    try {
      // Record the time before sending the message
      const startTime = performance.now();
      const sentMessage = await message.channel.send("🏓 Pong! Calculating ping...");

      // Measure latency after the message has been sent
      const latency = performance.now() - startTime;
      
      // Get API latency and ensure it's valid
      const apiLatency = message.client.ws.ping;
      const apiLatencyMessage = apiLatency && apiLatency >= 0 ? `**\`${apiLatency}ms\`**` : '**`WebSocket not connected`**';

      // Build the minimal embed
      const pingEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(`
        
latency: **\`${latency.toFixed(2)}\`ms  **
api letency: ${apiLatencyMessage}
        `)
      await sentMessage.delete();
      await message.channel.send({ embeds: [pingEmbed] });

    } catch (error) {
      console.error('Error executing ping command:', error);
      return message.channel.send(`${EMOJIS.ERROR} Something went wrong!`);
    }
  },
};
