const { EmbedBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const os = require('os');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

module.exports = {
  name: 'ping',
  description: 'replies with pong and advanced latency info',
  async execute(message) {
    if (!message.guild) {
      return message.reply(`${EMOJIS.ERROR} this command can only be used in a server!`);
    }

    if (!message.guild.members.me.permissions.has(['SendMessages', 'EmbedLinks'])) {
      return message.reply(`${EMOJIS.ERROR} i don’t have permission to send messages or embeds here!`);
    }

    try {
      const startTime = performance.now();
      const sentMessage = await message.channel.send("🏓 pong! calculating...");

      const latency = Math.round(performance.now() - startTime);      
      const apiLatency = message.client.ws.ping >= 0 ? Math.round(message.client.ws.ping) : 0; // Ensure valid WS ping
      const serverRegion = message.guild.preferredLocale || 'Unknown';
      const hostname = os.hostname();

      const pingEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(`
        latency: **\`${latency}\`** ms  
        ws ping: **\`${apiLatency}\`** ms
        server region: \`${serverRegion}\`
        host: \`${hostname}\`
  `);

      await sentMessage.delete();
      await message.channel.send({ embeds: [pingEmbed] });

    } catch (error) {
      console.error('error executing ping command:', error);
      return message.channel.send(`${EMOJIS.ERROR} something went wrong!`);
    }
  },
};
