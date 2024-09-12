const { EmbedBuilder } = require('discord.js');
const { BOT_ADMINS } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed('talk', 'talks as bot', 'none', 'BOT_ADMIN', 'talk <message>');

module.exports = {
  name: 'talk',
  description: 'Talks as bot',
  async execute(message, args) {
    // Ensure the user has the necessary permissions
    if (!BOT_ADMINS.includes(message.author.id)) {
      return;
    }

    // Check if there is a message to send
    if (args.length === 0) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Join all arguments to form the message
    const talkMessage = args.join(' ');

    try {
      // Delete the command message
      await message.delete();

      // Send the new message
      await message.channel.send(talkMessage);
    } catch (error) {
      console.error('Error processing command:', error);

      // If there was an error deleting or sending, notify the user
      message.channel.send('There was an error processing your request.');
    }
  },
};
