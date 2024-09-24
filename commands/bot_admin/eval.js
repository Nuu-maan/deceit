const { EmbedBuilder } = require('discord.js');
const { BOT_ADMINS, EMBED_COLOR, EMOJIS } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const util = require('util');
const db = require('../../database/database');
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

    if (code.startsWith('db.run("UPDATE prefixes SET prefix =')) {
      const match = code.match(/SET prefix = '([^']+)' WHERE server_id = '([^']+)'/);
      if (match) {
        const serverId = match[2];

        db.run("UPDATE prefixes SET prefix = ? WHERE server_id = ?", [match[1], serverId], function(err) {
          if (err) {
            const errorEmbed = new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setTitle(`${EMOJIS.ERROR} Error`)
              .setDescription(`Failed to update prefix: ${err.message}`)
              .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            return message.reply({ embeds: [errorEmbed] });
          }

          const successEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`${EMOJIS.SUCCESS} Success`)
            .setDescription(`Successfully updated prefix to \`${match[1]}\` for server ID: \`${serverId}\``)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
          return message.reply({ embeds: [successEmbed] });
        });
        return;
      }
    }

    if (code.startsWith('db.run("DELETE FROM prefixes WHERE server_id =')) {
      const serverIdMatch = code.match(/'([^']+)'/); 
      if (serverIdMatch && serverIdMatch[1]) {
        const serverId = serverIdMatch[1];

        db.run("DELETE FROM prefixes WHERE server_id = ?", [serverId], function(err) {
          if (err) {
            const errorEmbed = new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setTitle(`${EMOJIS.ERROR} Error`)
              .setDescription(`Failed to delete prefix: ${err.message}`)
              .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
            return message.reply({ embeds: [errorEmbed] });
          }

          const successEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`${EMOJIS.SUCCESS} Success`)
            .setDescription(`Successfully deleted custom prefix for server ID: \`${serverId}\``)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });
          return message.reply({ embeds: [successEmbed] });
        });
        return; 
      }
    }

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
