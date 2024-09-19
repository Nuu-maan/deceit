const { EmbedBuilder } = require('discord.js');
const { BOT_ADMINS, EMBED_COLOR, EMOJIS } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const util = require('util');

module.exports = {
  name: 'eval',
  description: 'Evaluates JavaScript code',
  aliases: ['ev'],
  
  async execute(message, args) {
    if (!BOT_ADMINS.includes(message.author.id)) {
      const noPermsEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription(`${EMOJIS.ERROR} You don't have permission to use this command.`);
      return message.reply({ embeds: [noPermsEmbed] });
    }

    if (args.length === 0) {
      const usageEmbed = createEmbed(
        'Eval Command',
        'Evaluates JavaScript code',
        'ev',
        'BOT ADMIN',
        'eval <code>',
        EMBED_COLOR
      );
      return message.reply({ embeds: [usageEmbed] });
    }

    const code = args.join(' ');

    try {
      let evaled = await eval(code);
      if (typeof evaled !== 'string') evaled = util.inspect(evaled);

      const successEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.SUCCESS} Evaluated`)
        .addFields(
          { name: `${EMOJIS.BOLT} Input`, value: `\`\`\`js\n${code}\n\`\`\`` },
          { name: `${EMOJIS.HEART} Output`, value: `\`\`\`js\n${evaled}\n\`\`\`` }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      message.reply({ embeds: [successEmbed] });

    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.ERROR} Error`)
        .addFields(
          { name: `${EMOJIS.BOLT} Input`, value: `\`\`\`js\n${code}\n\`\`\`` },
          { name: `${EMOJIS.ERROR} Error`, value: `\`\`\`js\n${err}\n\`\`\`` }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      message.reply({ embeds: [errorEmbed] });
    }
  },
};
