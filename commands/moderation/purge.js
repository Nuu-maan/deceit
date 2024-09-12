const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { DELETE_AFTER, PREFIX, EMBED_COLOR } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed('purge', 'bulk delete messages', 'p, clear', 'MANAGE_MESSAGES', 'purge <amount>');
const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'purge',
  aliases: ['clear', 'p'],
  description: 'Deletes a specified number of messages from the channel.',

  async execute(message, args) {
    // check if user has MANAGE_MESSAGES permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      errorEmbed.setDescription(`\`MANAGE_MESSAGES\` permission required`);
      return message.reply({ embeds: [errorEmbed] });
    }

    // check if user has provided an amount, if not, return infoEmbed
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // check if amount is greater than 100
    if (amount >= 100) {
      errorEmbed.setDescription(`max deletions per command: \`99\``);
      return message.reply({ embeds: [errorEmbed] });
    }

    try {
      // Fetch messages
      const fetched = await message.channel.messages.fetch({ limit: amount + 1 }); // +1 to include the command message itself
      const messages = fetched.filter((msg) => msg.id !== message.id); // Exclude the command message itself

      // Bulk delete messages
      await message.channel.bulkDelete(messages, true);

      // Send confirmation
      successEmbed.setDescription(`\`${messages.size}\` messages deleted.`);
      const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

      // Delete the confirmation message after DELETE_AFTER seconds
      setTimeout(() => {
        confirmationMessage.delete().catch(() => {});
      }, DELETE_AFTER);

      //  delete the command message itself
      message.delete().catch(() => {});
    } catch (error) {
      console.error(error);
      message.reply('There was an error trying to delete messages.').then((msg) => {
        setTimeout(() => msg.delete().catch(() => {}), DELETE_AFTER);
      });
    }
  },
};
