const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const db = require('../../database/database');
const { EMBED_COLOR, EMOJIS, PREFIX } = require('../../constants');

const infoEmbed = createEmbed(
  'Set Prefix',
  'Set a custom prefix for this server.',
  'setprefix',
  'ADMINISTRATOR',
  'setprefix <prefix>'
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'setprefix',
  description: 'Set a custom prefix for this server.',
  async execute(message, args) {
    // Only allow admins to set the prefix
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} You do not have permission to set a custom prefix.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    const newPrefix = args[0];

    // Check if a new prefix is provided and if it's valid
    if (!newPrefix || newPrefix.length < 1) {
      infoEmbed.setFooter({
        text: 'Please provide a valid prefix.',
        iconURL: message.guild.iconURL({ dynamic: true }),
      });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    const serverId = message.guild.id;

    // Insert or update the custom prefix in the database
    db.run('INSERT OR REPLACE INTO prefixes (server_id, prefix) VALUES (?, ?)', [serverId, newPrefix], (err) => {
      if (err) {
        console.error(err.message);
        errorEmbed.setDescription(`${EMOJIS.ERROR} An error occurred while setting the prefix.`);
        return message.channel.send({ embeds: [errorEmbed] });
      }
      successEmbed
        .setTitle(`${EMOJIS.SUCCESS} Prefix Successfully Set`)
        .setDescription(`The prefix has been successfully set to \`${newPrefix}\` for this server.`);

      return message.channel.send({ embeds: [successEmbed] });
    });
  }
};
