const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const { MessageAttachment } = require('discord.js');

module.exports = {
  name: 'quote',
  async execute(message) {
    // Check if the message is a reply
    if (!message.reference) {
      return message.reply("Please reply to a message to quote it.");
    }

    // Fetch the quoted message
    const quotedMessage = await message.channel.messages.fetch(message.reference.messageId);

    // Get the user's avatar URL
    const userAvatarUrl = message.author.displayAvatarURL({ format: 'png', dynamic: false });

    try {
      // Fetch the user's avatar
      const response = await axios.get(userAvatarUrl, { responseType: 'arraybuffer' });
      const avatarBuffer = Buffer.from(response.data);
      const avatarImage = await loadImage(avatarBuffer);

      // Create a canvas
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');

      // Draw the blurred avatar
      ctx.filter = 'blur(10px)'; // Apply blur effect
      ctx.drawImage(avatarImage, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none'; // Reset filter

      // Draw the text on top of the image
      ctx.font = '30px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(quotedMessage.content, 20, 350);

      // Create a PNG attachment from the canvas
      const attachment = new MessageAttachment(canvas.toBuffer(), 'quote.png');

      // Send the image to the server
      await message.channel.send({ content: "Here's your quote!", files: [attachment] });
    } catch (error) {
      console.error('Error creating quote image:', error);
      message.reply("There was an error creating your quote. Please try again.");
    }
  },
};
