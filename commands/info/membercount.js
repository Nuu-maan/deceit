const { EmbedBuilder } = require('discord.js');
const { EMBED_COLOR } = require('../../constants');
const { aliases } = require('./serverinfo');

module.exports = {
  name: 'membercount',
  aliases: ['mc'],
  description: 'displays the total number of members, humans, and bots in the server.',
  async execute(message) {
    try {
      // Get the guild member count details
      const totalMembers = message.guild.memberCount;
      const humanMembers = message.guild.members.cache.filter(member => !member.user.bot).size;
      const botMembers = message.guild.members.cache.filter(member => member.user.bot).size;

      // Create the embed
      const memberCountEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() }) // Set the guild's icon in the author
        .addFields(
          { name: 'members', value: `**\`${totalMembers}\`**`, inline: true },
          { name: 'humans', value: `**\`${humanMembers}\`**`, inline: true },
          { name: 'bots', value: `**\`${botMembers}\`**`, inline: true }
        );

      // Send the embed
      await message.channel.send({ embeds: [memberCountEmbed] });
    } catch (error) {
      console.error('Error fetching member count:', error);
      await message.reply('there was an error trying to fetch the member count.');
    }
  }
};
