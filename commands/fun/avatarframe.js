const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

const successEmbed = new EmbedBuilder();

// Dynamically load frames from the directory
const framesDirectory = path.resolve(__dirname, '../../assets/frames');
const frames = {};

fs.readdirSync(framesDirectory).forEach((file) => {
  const frameType = path.parse(file).name; // Get the file name without extension
  frames[frameType] = path.join(framesDirectory, file);
});

module.exports = {
  name: 'avatarframe',
  aliases: ['avframe', 'frame'],
  description: 'Adds a cool frame around your avatar.',
  usage: 'avatarframe <frame-type>',
  async execute(message, args) {
    const frameType = args[0]?.toLowerCase();
    const user = message.author;

    if (!frameType || !frames[frameType]) {
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(
          `${EMOJIS.ERROR} Please provide a valid frame type. Available frames: \`\`\`holiday, neon, minimalist\`\`\``,
        );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      const avatarUrl = user.displayAvatarURL({ format: 'png', size: 512 });
      const avatarImage = await loadImage(avatarUrl);
      const frameBuffer = fs.readFileSync(frames[frameType]);
      const frameImage = await loadImage(frameBuffer);

      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');

      // Draw the avatar and the frame
      ctx.drawImage(avatarImage, 0, 0, 512, 512);
      ctx.drawImage(frameImage, 0, 0, 512, 512);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'avatar_with_frame.png',
      });

      successEmbed
        .setColor(EMBED_COLOR)
        .setDescription(
          `${EMOJIS.SUCCESS} Here is your avatar with the \`${frameType}\` frame!`,
        )
        .setImage('attachment://avatar_with_frame.png');

      return message.channel.send({
        embeds: [successEmbed],
        files: [attachment],
      });
    } catch (error) {
      console.error(`Error creating avatar frame: ${error.message}`);
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(
          `${EMOJIS.ERROR} Oops, something went wrong while applying the frame!`,
        );
      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
