const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType, // Import ChannelType
} = require('discord.js');
const { EMBED_COLOR } = require('../../constants'); // Import the EMBED_COLOR from constants.js

module.exports = {
  name: 'avatar',
  aliases: ['av','pfp'],
  description: "Shows the user's avatar in different formats with download links",
  async execute(message) {
    // Check if the message is sent in a valid text channel
    if (message.channel.type !== ChannelType.GuildText) { // Use ChannelType.GuildText for checking
      return message.reply('This command can only be used in text channels.');
    }

    // Get the user mentioned or fallback to the message author
    const user = message.mentions.users.first() || message.author;

    // Ensure the user is valid
    if (!user) {
      return message.reply('User not found. Please mention a valid user or use the command without mentioning anyone to get your own avatar.');
    }

    const avatarBaseURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

    // Create the embed
    const avatarEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR) // Use the EMBED_COLOR from constants.js
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarBaseURL)

    // Create the buttons
    const row = new ActionRowBuilder().addComponents(
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
    try {
      await message.channel.send({ embeds: [avatarEmbed], components: [row] });
    } catch (error) {
      console.error('Error sending avatar embed:', error);
      message.reply('There was an error sending the avatar. Please try again later.');
    }
  },
};
