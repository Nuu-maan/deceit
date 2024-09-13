const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { EMBED_COLOR, DELETE_AFTER } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed(
  'purge',
  'Deletes a specified number of messages or filters messages by bots or a specific user.',
  'purge, clear, p',
  'MANAGE_MESSAGES',
  'purge <amount> [filter]\nFilters: bots, user'
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  name: 'purge',
  description: 'Deletes a specified number of messages from the channel or filters by bots or specific users.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      errorEmbed.setDescription('`MANAGE_MESSAGES` permission required');
      return message.reply({ embeds: [errorEmbed] });
    }

    const amount = parseInt(args[0]);
    const filterType = args[1];

    if (isNaN(amount) || amount < 1) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (filterType === 'bots') {
      await purgeBots(message, amount);
    } else if (filterType === 'user') {
      const user = message.mentions.users.first();
      if (!user) {
        errorEmbed.setDescription('Please mention a user to purge their messages.');
        return message.reply({ embeds: [errorEmbed] });
      }
      await purgeUser(message, user, amount);
    } else {
      await purgeMessages(message, amount);
    }
  },
};

async function purgeMessages(message, amount) {
  if (amount < 1) return;

  const limit = Math.min(amount, 100);
  let totalDeleted = 0;

  while (amount > 0) {
    const fetched = await message.channel.messages.fetch({ limit: Math.min(amount, 100) });
    const toDelete = fetched.filter(msg => msg.id !== message.id);

    if (toDelete.size === 0) break;

    await message.channel.bulkDelete(toDelete, true);
    totalDeleted += toDelete.size;
    amount -= toDelete.size;

    await wait(1500); // Wait to avoid rate limits
  }

  successEmbed.setDescription(`\`${totalDeleted}\` messages deleted.`);
  const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

  setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
  message.delete().catch(() => {});
}

async function purgeBots(message, amount) {
  const fetched = await message.channel.messages.fetch({ limit: Math.min(amount, 100) });
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
}

async function purgeUser(message, user, amount) {
  const fetched = await message.channel.messages.fetch({ limit: 100 });
  const userMessages = fetched.filter(msg => msg.author.id === user.id);

  if (userMessages.size === 0) {
    errorEmbed.setDescription(`No messages from \`${user.tag}\` found in the last 100 messages.`);
    return message.reply({ embeds: [errorEmbed] });
  }

  const messagesToDelete = userMessages.first(amount);

  await message.channel.bulkDelete(messagesToDelete, true);

  successEmbed.setDescription(`\`${messagesToDelete.length}\` messages from \`${user.tag}\` deleted.`);
  const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

  setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
  message.delete().catch(() => {});
}
