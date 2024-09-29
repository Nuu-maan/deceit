const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { EMBED_COLOR } = require('../../constants');
const { aliases } = require('../fun/remindme');

module.exports = {
  name: 'banner',
  description: "Shows the user's banner in different formats with download links",
  async execute(message) {
    // Check if the command is used in a text channel
    if (message.channel.type !== ChannelType.GuildText) {
      return message.reply('This command can only be used in text channels.');
    }

    // Get the user mentioned or fallback to the message author
    let user = message.mentions.users.first() || message.author;

    try {
      // Fetch user data
      const userData = await message.client.users.fetch(user.id, { force: true });
      const bannerURL = userData.bannerURL({ dynamic: true, size: 1024 });

      // Check if the user has a banner
      if (bannerURL) {
        // Create the embed for the banner
        const bannerEmbed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setTitle(`${user.username}'s Banner`)
          .setImage(bannerURL);

        // Create buttons for downloading different formats
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('PNG')
              .setStyle(ButtonStyle.Link)
              .setURL(userData.bannerURL({ format: 'png', dynamic: true, size: 1024 })),
            new ButtonBuilder()
              .setLabel('JPG')
              .setStyle(ButtonStyle.Link)
              .setURL(userData.bannerURL({ format: 'jpg', size: 1024 })),
            new ButtonBuilder()
              .setLabel('WEBP')
              .setStyle(ButtonStyle.Link)
              .setURL(userData.bannerURL({ format: 'webp', size: 1024 }))
          );

        // Send the embed with the buttons
        await message.channel.send({ embeds: [bannerEmbed], components: [row] });
      } else {
        // Send error message if no banner is found
        const errorEmbed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setDescription(`\`${user.username}\` does not have a banner`);
        await message.channel.send({ embeds: [errorEmbed] });
      }

    } catch (error) {
      console.error('Error fetching banner:', error);
      message.reply('There was an error trying to fetch the banner.');
    }
  }
};
