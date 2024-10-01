const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { EMBED_COLOR, DELETE_AFTER } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed(
  'purge',
  'Deletes a specified number of messages',
  'clear, p',
  'MANAGE_MESSAGES',
  '`purge <amount>`\n`purge <amount> bots`\n`purge <amount> @mentionuser`\n`purge bots` (delete all bot messages)'
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  name: 'purge',
  aliases: ['clear', 'p'],
  description: 'Deletes a specified number of messages from the channel or filters by bots or specific users.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      errorEmbed.setDescription('`MANAGE_MESSAGES` permission required.');
      return message.reply({ embeds: [errorEmbed] });
    }

    // If no arguments are provided, send the infoEmbed
    if (args.length === 0) {
      return message.reply({ embeds: [infoEmbed] });
    }

    const amount = args[0] && !isNaN(args[0]) ? parseInt(args[0]) : null;
    const filterType = args[1] || (args[0] === 'bots' ? 'bots' : null);

    // If no amount is specified and the filter is bots, delete all bot messages.
    if (!amount && filterType === 'bots') {
      await purgeBots(message, 100); // Default to fetching 100 messages if no amount is provided.
      return;
    }

    if (amount && (isNaN(amount) || amount < 1)) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Check for filter type
    if (filterType && filterType !== 'bots' && !message.mentions.users.size) {
      errorEmbed.setDescription('You must mention a valid user to purge their messages.\n```,,purge <amount> @mentionuser```');
      return message.reply({ embeds: [errorEmbed] });
    }

    switch (filterType) {
      case 'bots':
        await purgeBots(message, amount || 100);
        break;

      default:
        const user = message.mentions.users.first();
        if (!user) {
          await purgeAll(message, amount); // Default purge if no user is mentioned
        } else {
          await purgeUser(message, user, amount || 100);
        }
        break;
    }
  },
};

async function purgeBots(message, amount) {
  const fetched = await message.channel.messages.fetch({
    limit: 100, // Fetch the last 100 messages
  });

  const botMessages = fetched.filter((msg) => msg.author.bot); // Filter bot messages

  const messagesToDelete = botMessages.first(amount); // Get the specified amount of bot messages

  if (!messagesToDelete || messagesToDelete.length === 0) {
    errorEmbed.setDescription('No bot messages found.');
    return message.reply({ embeds: [errorEmbed] });
  }

  await message.channel.bulkDelete(messagesToDelete, true); // Bulk delete the filtered messages

  successEmbed.setDescription(`\`${messagesToDelete.length}\` bot messages deleted.`);
  const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

  setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
  message.delete().catch(() => {});
}

async function purgeUser(message, user, amount) {
  const fetched = await message.channel.messages.fetch({
    limit: 100,
  });

  // Filter out the command message
  const messagesToConsider = fetched.filter((msg) => msg.id !== message.id);

  // Filter messages by the user
  const userMessages = messagesToConsider.filter(
    (msg) => msg.author.id === user.id,
  );

  if (userMessages.size === 0) {
    errorEmbed.setDescription(`No messages from \`${user.tag}\` found.`);
    return message.reply({ embeds: [errorEmbed] });
  }

  const messagesToDelete = userMessages.first(amount);

  await message.channel.bulkDelete(messagesToDelete, true);

  successEmbed.setDescription(`\`${messagesToDelete.length}\` messages from \`${user.tag}\` deleted.`);
  const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

  setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
  message.delete().catch(() => {});
}

async function purgeAll(message, amount) {
  const fetched = await message.channel.messages.fetch({
    limit: Math.min(100, amount), // Fetch up to 100 messages or the requested amount
  });

  const messagesToDelete = fetched.first(amount);

  if (messagesToDelete.size === 0) {
    errorEmbed.setDescription('No messages found to delete.');
    return message.reply({ embeds: [errorEmbed] });
  }

  await message.channel.bulkDelete(messagesToDelete, true);

  successEmbed.setDescription(`\`${messagesToDelete.size}\` messages deleted.`);
  const confirmationMessage = await message.channel.send({ embeds: [successEmbed] });

  setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
  message.delete().catch(() => {});
}
