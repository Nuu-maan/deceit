const db = require('../../database/database');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR, EMOJIS, PREFIX } = require('../../constants');

module.exports = {
  name: 'setprefix',
  description: 'Set a custom prefix for this server.',
  async execute(message, args) {
    // Only allow admins to set the prefix
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply({
        embeds: [createEmbed(
          'Permission Denied',
          `${EMOJIS.ERROR} You do not have permission to set a custom prefix.`,
          'none',
          'ADMINISTRATOR',
          'setprefix <prefix>'
        )]
      });
    }

    const newPrefix = args[0];
    
    // Check if the provided argument is valid
    if (!newPrefix || typeof newPrefix !== 'string' || newPrefix.length < 1) {
      return message.reply({
        embeds: [createEmbed(
          'Invalid Prefix',
          `${EMOJIS.INFO} Please provide a valid new prefix.`,
          'none',
          'ADMINISTRATOR',
          'setprefix <prefix>'
        )]
      });
    }

    const serverId = message.guild.id;

    // Insert or update the custom prefix in the database
    db.run('INSERT OR REPLACE INTO prefixes (server_id, prefix) VALUES (?, ?)', [serverId, newPrefix], (err) => {
      if (err) {
        console.error(err.message);
        return message.reply({
          embeds: [createEmbed(
            'Error',
            `${EMOJIS.ERROR} An error occurred while setting the prefix.`,
            'none',
            'ADMINISTRATOR',
            'setprefix <prefix>'
          )]
        });
      }

      return message.reply({
        embeds: [createEmbed(
          'Prefix Set',
          `${EMOJIS.SUCCESS} Prefix successfully set to \`${newPrefix}\` for this server.`,
          'none',
          'ADMINISTRATOR',
          'setprefix <prefix>'
        )]
      });
    });
  }
};
