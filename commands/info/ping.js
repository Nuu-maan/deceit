const { EmbedBuilder } = require('discord.js');
const { performance } = require('perf_hooks'); // Import performance from perf_hooks
const { EMBED_COLOR } = require('../../constants');

module.exports = {
  name: 'ping',
  description:
    'Replies with Pong and latency information in a cute and advanced embed!',
  async execute(message) {
    const startTime = performance.now(); // Start timing using performance.now()

    // Calculate the latency using performance.now()
    const latency = Math.abs(performance.now() - startTime); // Calculate message latency
    const apiLatency = Math.round(message.client.ws.ping);
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

    // Send the embed with the ping information
    await message.channel.send({ embeds: [pingEmbed] });
  },
};
