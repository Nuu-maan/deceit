const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EMBED_COLOR } = require('../../constants'); // Import the EMBED_COLOR from constants.js

module.exports = {
  name: 'avatar',
  description: "Shows the user's avatar in different formats with download links",
  async execute(message) {
    const user = message.mentions.users.first() || message.author;
    const avatarBaseURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

    // Create the embed
    const avatarEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR) // Use the EMBED_COLOR from constants.js
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarBaseURL)

    // Create the buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('PNG')
          .setStyle(ButtonStyle.Link)
          .setURL(user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })),
        new ButtonBuilder()
          .setLabel('JPG')
          .setStyle(ButtonStyle.Link)
          .setURL(user.displayAvatarURL({ format: 'jpg', size: 1024 })),
        new ButtonBuilder()
          .setLabel('WEBP')
          .setStyle(ButtonStyle.Link)
          .setURL(user.displayAvatarURL({ format: 'webp', size: 1024 }))
      );

    // Send the embed with the buttons
    await message.channel.send({ embeds: [avatarEmbed], components: [row] });
  }
};
