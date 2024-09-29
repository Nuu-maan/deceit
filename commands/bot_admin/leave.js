const { EmbedBuilder } = require('discord.js');
const { EMBED_COLOR, BOT_ADMINS, EMOJIS } = require('../../constants');

module.exports = {
  name: 'leave',
  description: 'Makes the bot leave a specified server.',
  async execute(message, args) {
    if (!BOT_ADMINS.includes(message.author.id)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`${EMOJIS.ERROR} You do not have permission to use this command.`),
        ],
      });
    }

    // Check if a server ID was provided
    const serverId = args[0];
    if (!serverId) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`${EMOJIS.WARNING} Please provide a server ID.`),
        ],
      });
    }

    try {
      // Fetch the guild and leave it
      const guild = await message.client.guilds.fetch(serverId);
      if (guild) {
        await guild.leave();
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} Successfully left the server: ${guild.name}`),
          ],
        });
      } else {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} Could not find a server with that ID.`),
          ],
        });
      }
    } catch (error) {
      console.error('Error leaving the server:', error);
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`${EMOJIS.ERROR} There was an error trying to leave the server.`),
        ],
      });
    }
  },
};
