const { EmbedBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const { EMBED_COLOR } = require('../../constants');

module.exports = {
  name: 'ping',
  description: 'Replies with Pong and latency information in a cute and advanced embed!',
  async execute(message) {
    const startTime = performance.now(); // Start timing

    // Send a message to start the ping calculation
    const sentMessage = await message.channel.send("🏓 Pong! Calculating ping...");

    // Calculate the latency
    const latency = performance.now() - startTime; // Calculate message latency
    const apiLatency = message.client.ws.ping || 'Not connected'; // Get API latency
    const uptime = Math.round(message.client.uptime / 1000); // in seconds

    // Create the embed with the ping information
    const pingEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("🏓 Pong! Here's your ping info:")
      .addFields(
        { name: 'Latency', value: `\`${latency.toFixed(2)}ms\``, inline: true },
        { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true },
        {
          name: 'Uptime',
          value: `<t:${Math.floor(Date.now() / 1000) - uptime}:R>`,
          inline: true,
        },
      )
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    // Delete the initial ping message and send the embed
    await sentMessage.delete();
    await message.channel.send({ embeds: [pingEmbed] });
  },
};
