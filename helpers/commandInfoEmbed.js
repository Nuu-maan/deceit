const { EmbedBuilder } = require('discord.js');
const { PREFIX, EMBED_COLOR } = require('../constants');

function createEmbed(
  title,
  description,
  aliases,
  permission,
  usage,
  color = EMBED_COLOR,
) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .addFields(
      { name: 'aliases', value: `${aliases}`, inline: true },
      { name: 'permission', value: `\`${permission}\``, inline: true },
      { name: 'usage', value: `\`\`\`${PREFIX}${usage}\`\`\``, inline: false },
    );
  return embed;
}

module.exports = { createEmbed };
