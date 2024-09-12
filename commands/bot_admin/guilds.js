const { EmbedBuilder } = require('discord.js');
const { BOT_ADMINS } = require('../../constants');

const embed = new EmbedBuilder().setColor('#2B2D31');
module.exports = {
  name: 'guilds',
  description: 'Lists all the servers the bot is in',
  async execute(message) {
    if (!BOT_ADMINS.includes(message.author.id)) {
      return;
    }

    const guilds = message.client.guilds.cache;
    const guildList = guilds.map((guild) => `**${guild.name}** (ID: ${guild.id})`).join('\n');

    if (!guildList) {
      embed.setDescription('The bot is not in any servers.');
      return message.reply({ embeds: [embed] });
    }

    embed.setTitle('List of Servers').setDescription(guildList);

    message.reply({ embeds: [embed] });
  },
};
