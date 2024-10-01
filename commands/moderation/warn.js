const { EmbedBuilder } = require('discord.js');
const db = require('../../database/warns');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

module.exports = {
  name: 'warn',
  description: 'Warn a user with a specific reason.',
  async execute(message, args) {
    const userToWarn = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!userToWarn) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`${EMOJIS.ERROR} You need to mention a user to warn.`),
        ],
      });
    }

    const timestamp = Date.now();

    db.run(
      'INSERT INTO warns (userId, guildId, reason, timestamp) VALUES (?, ?, ?, ?)',
      [userToWarn.id, message.guild.id, reason, timestamp],
      function(err) {
        if (err) {
          console.error(err);
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.ERROR} There was an error warning the user.`),
            ],
          });
        }

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} ${userToWarn.tag} has been warned. Reason: ${reason} (Warn ID: ${this.lastID})`),
          ],
        });
      }
    );
  },
};
