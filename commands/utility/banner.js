const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMBED_COLOR } = require('../../constants');

module.exports = {
  name: 'banner',
  description: "Shows the user's banner in different formats with download links",
  async execute(message) {
    let user = message.mentions.users.first() || message.author;

    try {
      const userData = await message.client.users.fetch(user.id, { force: true });
      const bannerURL = userData.bannerURL({ dynamic: true, size: 1024 });

      if (bannerURL) {
        const bannerEmbed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setTitle(`${user.username}'s Banner`)
          .setImage(bannerURL);

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

        await message.channel.send({ embeds: [bannerEmbed], components: [row] });
      } else {
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
