const { EmbedBuilder } = require('discord.js');
const { EMBED_COLOR } = require('../../constants');

const embed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: "shows user's avatar",
  async execute(message) {
    // Check if a user is mentioned
    let user = message.mentions.users.first();

    // If no user is mentioned, use the message author
    if (!user) {
      user = message.author;
    }

    // Create an embed with the user's avatar
    embed.setTitle(`***${user.username}'s Avatar***`).setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));

    // Send the embed
    message.channel.send({ embeds: [embed] });
  },
};
