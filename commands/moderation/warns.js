const { EmbedBuilder } = require('discord.js');
const db = require('../../database/warns');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

module.exports = {
  name: 'warns',
  description: 'View the list of warnings for a user.',
  async execute(message, args) {
    const userToCheck = message.mentions.users.first() || message.author;

    db.all(
      'SELECT * FROM warns WHERE userId = ? AND guildId = ?',
      [userToCheck.id, message.guild.id],
      (err, rows) => {
        if (err) {
          console.error(err);
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.ERROR} There was an error fetching warnings.`),
            ],
          });
        }

        console.log(rows); 

        if (rows.length === 0) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.INFO} No warnings found for **${userToCheck.tag}**.`),
            ],
          });
        }

        const warningList = rows.map((row) => {
          const timestampInSeconds = Math.floor(Number(row.timestamp) / 1000);
          return `**Warn ID:** ${row.warnId} | **Reason:** ${row.reason} | **Date:** <t:${timestampInSeconds}:F>`;
        }).join('\n');

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setTitle(`Warnings for **${userToCheck.tag}**`)
              .setDescription(warningList)
              .setFooter({ text: `Total Warnings: ${rows.length}`, iconURL: userToCheck.displayAvatarURL() })
              .setTimestamp(),
          ],
        });
      }
    );
  },
};
