const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');

const ERROR_EMOJI = '❌';
const BLEND_MODES = ['multiply', 'overlay', 'screen'];
const FILTERS = ['glitch', 'pixelate', 'posterize'];

const { EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR } = require('../../constants');
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

const infoEmbed = createEmbed(
  'Avater Fusion',
  'Fuses two avatars together',
  'avfuse, avfusion',
  'none',
  'avfuse <@user1> <@user2>',
);
async function fetchAvatar(url) {
  const fetchModule = await import('node-fetch');
  const response = await fetchModule.default(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = {
  name: 'avatarfusion',
  aliases: ['avfuse', 'avfusion'],
  description:
    "Merges two users' avatars together into a cool combo with fun effects.",
  async execute(message, args) {
    const mentions = message.mentions.users;
    const user1 = mentions.first();
    const user2 = mentions.last();

    if (!user1 || !user2 || user1.id === user2.id) {
      return message.reply({ embeds: [infoEmbed] });
    }

    try {
      const avatar1 = user1.displayAvatarURL({ format: 'webp', size: 512 });
      const avatar2 = user2.displayAvatarURL({ format: 'webp', size: 512 });

      const buffer1 = await fetchAvatar(avatar1);
      const buffer2 = await fetchAvatar(avatar2);

      const convertedAvatar1 = await sharp(buffer1).png().toBuffer();
      const convertedAvatar2 = await sharp(buffer2).png().toBuffer();

      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');

      const img1 = await loadImage(convertedAvatar1);
      const img2 = await loadImage(convertedAvatar2);

      const randomBlendMode =
        BLEND_MODES[Math.floor(Math.random() * BLEND_MODES.length)];
      ctx.globalCompositeOperation = randomBlendMode;
      ctx.drawImage(img2, 0, 0, 512, 512);

      ctx.save();
      const randomRotation = Math.random() * 0.2 - 0.1;
      ctx.translate(256, 256);
      ctx.rotate(randomRotation);
      ctx.drawImage(img1, -128, -128, 256, 256);
      ctx.restore();

      ctx.globalAlpha = 0.2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, 512, 512);

      const randomFilter = FILTERS[Math.floor(Math.random() * FILTERS.length)];
      if (randomFilter === 'glitch') {
        ctx.drawImage(img1, 30, 20, 200, 100, 300, 400, 100, 200);
      } else if (randomFilter === 'pixelate') {
        ctx.drawImage(img1, 0, 0, 64, 64);
        ctx.drawImage(canvas, 0, 0, 512, 512);
      } else if (randomFilter === 'posterize') {
        ctx.filter = 'contrast(200%)';
        ctx.drawImage(img1, 0, 0, 512, 512);
      }

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'avatarfusion.png',
      });
      successEmbed.setImage('attachment://avatarfusion.png');
      return message.channel.send({
        embeds: [successEmbed],
        files: [attachment],
      });
    } catch (error) {
      console.error(`Error creating avatar fusion: ${error.message}`);
      return message.reply(
        `${ERROR_EMOJI} Oops, something went wrong while merging avatars!`,
      );
    }
  },
};
