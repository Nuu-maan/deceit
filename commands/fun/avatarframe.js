const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

const frames = {
  'holiday': path.resolve(__dirname, '../../assets/frames/holiday.png'), 
  'neon': path.resolve(__dirname, '../../assets/frames/neon.png'),       
  'minimalist': path.resolve(__dirname, '../../assets/frames/minimalist.png'), 
};

module.exports = {
  name: 'avatarframe',
  description: 'Adds a cool frame around your avatar.',
  usage: 'avatarframe <frame-type>',
  async execute(message, args) {
    const frameType = args[0] ? args[0].toLowerCase() : null;
    const user = message.author;

    if (!frameType || !frames[frameType]) {
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(`${EMOJIS.ERROR} Please provide a valid frame type! Available frames: \`holiday\`, \`neon\`, \`minimalist\`.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      console.log(`Loading frame from: ${frames[frameType]}`);

      const avatarUrl = user.displayAvatarURL({ format: 'png', size: 512 });
      const avatarImage = await loadImage(avatarUrl);
      console.log(`Avatar loaded: ${avatarUrl}`);

      const frameBuffer = fs.readFileSync(frames[frameType]);
      const frameImage = await loadImage(frameBuffer);
      console.log(`Frame image loaded: ${frames[frameType]}`);

      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(avatarImage, 0, 0, 512, 512);

      ctx.drawImage(frameImage, 0, 0, 512, 512);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'avatar_with_frame.png' }); // Change to PNG
      const successEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(`${EMOJIS.SUCCESS} Here is your avatar with the \`${frameType}\` frame!`);
      return message.channel.send({ embeds: [successEmbed], files: [attachment] });

    } catch (error) {
      console.error(`Error creating avatar frame: ${error.message}`);
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(`${EMOJIS.ERROR} Oops, something went wrong while applying the frame!`);
      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
