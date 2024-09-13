const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { DELETE_AFTER, PREFIX, EMBED_COLOR } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = new EmbedBuilder()
  .setColor(EMBED_COLOR)
  .setTitle('Purge Command')
  .setDescription('Bulk delete messages from a channel, bots, or specific users.')
  .addFields(
    { name: 'Aliases', value: 'p, clear', inline: true },
    { name: 'Permission', value: 'MANAGE_MESSAGES', inline: true },
    { name: 'Usage', value: 
      `\`\`${PREFIX}purge <amount>\`\` - Deletes the last <amount> of messages.\n` + 
      `\`\`${PREFIX}purge bots\`\` - Deletes all bot messages from the last 100 messages.\n` + 
      `\`\`${PREFIX}purge <amount> user @username\`\` - Deletes <amount> of messages from the mentioned user.\n` + 
      `\`\`${PREFIX}purge user @username\`\` - Deletes up to 100 messages from the mentioned user.` }
  );

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'purge',
  aliases: ['clear', 'p'],
  description: 'Deletes a specified number of messages from the channel or filters by bots or specific users.',

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      errorEmbed.setDescription(`\`MANAGE_MESSAGES\` permission required`);
      return message.reply({ embeds: [errorEmbed] });
    }

    const amount = parseInt(args[0]);
    const filterType = args[1];

    if (!amount && !filterType) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (filterType === 'bots') {
      await this.purgeBots(message, amount || 100);
    } else if (filterType === 'user') {
      const user = message.mentions.users.first();
      if (!user) {
        errorEmbed.setDescription('Please mention a user to purge their messages.');
        return message.reply({ embeds: [errorEmbed] });
      }
      await this.purgeUser(message, user, amount || 100);
    } else {
      await this.purgeMessages(message, amount);
    }
  },

  async purgeMessages(message, amount) {
    if (amount < 1) {
      errorEmbed.setDescription(`Provide a valid amount of messages to delete.`);
      return message.reply({ embeds: [errorEmbed] });
    }

    const limit = Math.min(amount, 100);
    const iterations = Math.ceil(amount / 100);
    let totalDeleted = 0;

    for (let i = 0; i < iterations; i++) {
      const fetched = await message.channel.messages.fetch({ limit });
      const toDelete = fetched.filter((msg) => msg.id !== message.id);

      if (toDelete.size === 0) break;

      await message.channel.bulkDelete(toDelete, true);
      totalDeleted += toDelete.size;
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait to avoid rate limit
    }

    successEmbed.setDescription(`\`${totalDeleted}\` messages deleted.`);
    const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

    setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
    message.delete().catch(() => {});
  },

  async purgeBots(message, amount) {
    const fetched = await message.channel.messages.fetch({ limit: amount });
    const botMessages = fetched.filter(msg => msg.author.bot);

    if (botMessages.size === 0) {
      errorEmbed.setDescription('No bot messages found in the last 100 messages.');
      return message.reply({ embeds: [errorEmbed] });
    }

    await message.channel.bulkDelete(botMessages, true);

    successEmbed.setDescription(`\`${botMessages.size}\` bot messages deleted.`);
    const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

    setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
    message.delete().catch(() => {});
  },

  async purgeUser(message, user, amount) {
    const fetched = await message.channel.messages.fetch({ limit: 100 });
    const userMessages = fetched.filter(msg => msg.author.id === user.id).first(amount);

    if (userMessages.length === 0) {
      errorEmbed.setDescription(`No messages from \`${user.tag}\` found in the last 100 messages.`);
      return message.reply({ embeds: [errorEmbed] });
    }

    await message.channel.bulkDelete(userMessages, true);

    successEmbed.setDescription(`\`${userMessages.length}\` messages from \`${user.tag}\` deleted.`);
    const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

    setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
    message.delete().catch(() => {});
  }
};
