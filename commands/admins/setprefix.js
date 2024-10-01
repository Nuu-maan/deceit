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

// Cooldown set to prevent spamming the command
const cooldowns = new Set();

module.exports = {
  name: 'setprefix',
  description: 'Set a custom prefix for this server.',
  async execute(message, args) {
    const serverId = message.guild.id;

    // Cooldown check to prevent spamming
    if (cooldowns.has(serverId)) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} Please wait before changing the prefix again.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Only allow admins or server owner to set the prefix
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== message.guild.ownerId) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} You do not have permission to set a custom prefix.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    const newPrefix = args[0];

    // Check if a new prefix is provided and valid (no regex constraints now)
    if (!newPrefix || newPrefix.length < 1 || newPrefix.length > 5) {
      infoEmbed.setFooter({
        text: 'Please provide a valid prefix (1-5 characters).',
        iconURL: message.guild.iconURL({ dynamic: true }),
      });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Insert or update the custom prefix in the database using a parameterized query
    db.run('INSERT OR REPLACE INTO prefixes (server_id, prefix) VALUES (?, ?)', [serverId, newPrefix], (err) => {
      if (err) {
        console.error(`Database Error: ${err.message}`);
        errorEmbed.setDescription(`${EMOJIS.ERROR} An error occurred while setting the prefix.`);
        return message.channel.send({ embeds: [errorEmbed] });
      }

      // Success message
      successEmbed
        .setTitle(`${EMOJIS.SUCCESS} Prefix Successfully Set`)
        .setDescription(`The prefix has been successfully set to \`${newPrefix}\` for this server.`);

      message.channel.send({ embeds: [successEmbed] });

      // Add to cooldown to prevent spamming
      cooldowns.add(serverId);
      setTimeout(() => cooldowns.delete(serverId), 60000); // 1-minute cooldown
    });
  }
};
