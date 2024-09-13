const {
  EmbedBuilder,
  PermissionsBitField,
  userMention,
} = require('discord.js');
const { EMBED_COLOR, DELETE_AFTER } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed(
  'purge',
  'Deletes a specified number of messages',
  'clear, p',
  'MANAGE_MESSAGES',
  'purge <amount>\n,,purge <amount> bots\n,,purge <amount> user <mention>',
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  name: 'purge',
  aliases: ['clear', 'p'],
  description:
    'Deletes a specified number of messages from the channel or filters by bots or specific users.',
  async execute(message, args) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    ) {
      errorEmbed.setDescription('`MANAGE_MESSAGES` permission required');
      return message.reply({ embeds: [errorEmbed] });
    }

    const amount = parseInt(args[0]);
    const filterType = args[1];

    if (isNaN(amount) || amount < 1) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Check for filter type
    if (filterType && !['bots', 'user'].includes(filterType)) {
      errorEmbed.setDescription(
        'invalid filter type, available filters: `bots`, `user` \n```,,purge <amount> bots``` ```,,purge <amount> user <mention>```',
      );
      return message.reply({ embeds: [errorEmbed] });
    }

    switch (filterType) {
      case 'bots':
        await purgeBots(message, amount);
        break;

      case 'user':
        const user = message.mentions.users.first();
        if (!user) {
          errorEmbed.setDescription(
            'please mention a user to purge their messages.\n```,,purge <amount> user <mention>```',
          );
          return message.reply({ embeds: [errorEmbed] });
        }

        await purgeUser(message, user, amount);
        break;

      default:
        await purgeMessages(message, amount);
        break;
    }
  },
};

async function purgeMessages(message, amount) {
  if (amount < 1) return;

  let totalDeleted = 0;

  while (amount > 0) {
    // Fetch messages from the channel
    const fetched = await message.channel.messages.fetch({
      limit: Math.min(amount + 1, 100),
    });

    // Filter out the command message
    const toDelete = fetched.filter((msg) => msg.id !== message.id);

    // If no messages to delete, break the loop
    if (toDelete.size === 0) break;

    // Try to bulk delete the messages
    try {
      const deleteCount = Math.min(toDelete.size, amount);
      await message.channel.bulkDelete(toDelete.first(deleteCount), true);
      totalDeleted += toDelete.size;
      amount -= toDelete.size;
    } catch (error) {
      console.error('Error deleting messages:', error);
      break; // Break the loop on error to avoid infinite loops
    }

    // Wait to avoid hitting rate limits
    await wait(1500);
  }

  // Send a confirmation message
  successEmbed.setDescription(`\`${totalDeleted}\` messages deleted.`);

  const confirmationMessage = await message.channel.send({
    embeds: [successEmbed],
  });

  // Set timeout to delete the confirmation message
  setTimeout(() => confirmationMessage.delete().catch(() => {}), 5000); // Adjust DELETE_AFTER to 5000 ms if needed
  message.delete().catch(() => {});
}

async function purgeBots(message, amount) {
  const fetched = await message.channel.messages.fetch({
    limit: Math.min(100),
  });
  const botMessages = fetched.filter((msg) => msg.author.bot).first(amount);

  if (botMessages.size === 0) {
    errorEmbed.setDescription('no bot messages found');
    return message.reply({ embeds: [errorEmbed] });
  }

  await message.channel.bulkDelete(botMessages, true);

  successEmbed.setDescription(
    `\`${botMessages.length}\` bot messages deleted.`,
  );
  const confirmationMessage = await message.channel.send({
    embeds: [successEmbed],
  });

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
    errorEmbed.setDescription(`No messages from \`${user.tag}\` found`);
    return message.reply({ embeds: [errorEmbed] });
  }

  const messagesToDelete = userMessages.first(amount);

  await message.channel.bulkDelete(messagesToDelete, true);

  successEmbed.setDescription(
    `\`${messagesToDelete.length}\` messages from \`${user.tag}\` deleted.`,
  );
  const confirmationMessage = await message.channel.send({
    embeds: [successEmbed],
  });

  setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
  message.delete().catch(() => {});
}
