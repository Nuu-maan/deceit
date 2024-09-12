const { EmbedBuilder } = require('discord.js');
const { EMBED_COLOR } = require('../../constants');

const bannerEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'banner',
  aliases: [],
  description: "Shows the user's banner",
  async execute(message) {
    // Check if a user is mentioned
    let user = message.mentions.users.first();

    // If no user is mentioned, use the message author
    if (!user) {
      user = message.author;
    }

    // Fetch the user's banner URL
    try {
      const userData = await message.client.users.fetch(user.id);
      const userr = await userData.fetch();
      const bannerURL = userr.bannerURL({ dynamic: true, size: 1024 });

      if (bannerURL) {
        bannerEmbed.setTitle(`${user.username}'s Banner`).setImage(bannerURL);
        message.channel.send({ embeds: [bannerEmbed] });
      } else {
        errorEmbed.setDescription(`\`${user.username}\` does not have a banner`);
        message.channel.send({ embeds: [errorEmbed] });
      }

      // Send the embed
    } catch (error) {
      console.error('Error fetching banner:', error);
      message.reply('There was an error trying to fetch the banner.');
    }
  },
};
