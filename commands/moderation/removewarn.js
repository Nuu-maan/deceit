const { EmbedBuilder } = require('discord.js');
const db = require('../../database/warns'); // Import the database connection
const { EMBED_COLOR, EMOJIS } = require('../../constants');

module.exports = {
  name: 'warnremove',
  description: 'Remove a warning by its ID.',
  async execute(message, args) {
    const warnId = args[0];

    if (!warnId) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`${EMOJIS.ERROR} Please provide a warn ID to remove.`),
        ],
      });
    }

    db.get('SELECT * FROM warns WHERE warnId = ?', [warnId], (err, row) => {
      if (err) {
        console.error(err);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} There was an error fetching the warning.`),
          ],
        });
      }

      if (!row) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.INFO} No warning found with ID **${warnId}**.`),
          ],
        });
      }

      const { userId, reason } = row; 

      db.run('DELETE FROM warns WHERE warnId = ?', [warnId], function(err) {
        if (err) {
          console.error(err);
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.ERROR} There was an error removing the warning.`),
            ],
          });
        }

        if (this.changes === 0) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.INFO} No warning found with ID **${warnId}**.`),
            ],
          });
        }

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} Warning ID **${warnId}** for user <@${userId}> has been removed. Reason: **${reason}**.`),
          ],
        });
      });
    });
  },
};
