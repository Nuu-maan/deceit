const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Replies with Pong and an embed!',
  async execute(message) {
    // Send an initial text message to get the message ID for latency calculation
    const sentMessage = await message.reply('pong 🏓');

    // Calculate latency
    const latency = sentMessage.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    await sentMessage.edit({ content: `pong 🏓 \`${latency}ms\`` });
  },
};
