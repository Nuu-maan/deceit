const {
  EmbedBuilder,
  PermissionsBitField,
  AllowedMentionsTypes,
} = require('discord.js');
const { EMBED_COLOR, DELETE_AFTER } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed(
  'purge',
  'deletes a specified number of messages',
  'clear, p',
  'MANAGE_MESSAGES',
  'purge <amount> filter \nfilters: bots, user, @user',
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
    // Show infoEmbed when no arguments are provided
    if (args.length === 0) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    ) {
      errorEmbed.setDescription('`MANAGE_MESSAGES` permission required.');
      return message.reply({ embeds: [errorEmbed] });
    }

    const amount = args[0] ? parseInt(args[0]) : null;
    const filterType = args[1] || (args[0] === 'bots' ? 'bots' : null);

    // If no amount is specified and the filter is bots, delete all bot messages.
    if (!amount && filterType === 'bots') {
      await purgeBots(message, 100);
      return;
    }

    if (amount && (isNaN(amount) || amount < 1)) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Check for filter type
    if (filterType && filterType !== 'bots' && !message.mentions.users.size) {
      return message.reply({
        embeds: [infoEmbed],
        allowedMentions: { repliedUser: false },
      });
    }

    try {
      switch (filterType) {
        case 'bots':
          await purgeBots(message, amount || 100);
          break;
        default:
          const user = message.mentions.users.first();
          if (user) {
            await purgeUser(message, user, amount || 100);
          } else {
            await purgeAll(message, amount + 1);
          }
          break;
      }
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription(
        'an error occurred while trying to delete messages.',
      );
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};

async function purgeBots(message, amount) {
  const fetched = await message.channel.messages.fetch({ limit: 100 });
  const botMessages = fetched.filter((msg) => msg.author.bot).first(amount);

  if (!botMessages.length) {
    errorEmbed.setDescription('no bot messages found.');
    return message.reply({ embeds: [errorEmbed] });
  }

  await message.channel.bulkDelete(botMessages, true);
  successEmbed.setDescription(
    `\`${botMessages.length}\` bot messages deleted.`,
  );
  await sendConfirmation(message, successEmbed);
}

async function purgeUser(message, user, amount) {
  const fetched = await message.channel.messages.fetch({ limit: 100 });
  const userMessages = fetched
    .filter((msg) => msg.author.id === user.id && msg.id !== message.id)
    .first(amount);

  if (!userMessages.length) {
    errorEmbed.setDescription(`no messages from \`${user}\` found.`);
    return message.reply({ embeds: [errorEmbed] });
  }

  await message.channel.bulkDelete(userMessages, true);
  successEmbed.setDescription(
    `\`${userMessages.length}\` messages from ${user} deleted.`,
  );
  await sendConfirmation(message, successEmbed);
}

async function purgeAll(message, amount) {
  const fetched = await message.channel.messages.fetch({
    limit: Math.min(100, amount),
  });
  const messagesToDelete = fetched.first(amount);

  if (!messagesToDelete.length) {
    errorEmbed.setDescription('No messages found to delete.');
    return message.reply({ embeds: [errorEmbed] });
  }

  await message.channel.bulkDelete(messagesToDelete, true);
  successEmbed.setDescription(
    `\`${messagesToDelete.length - 1}\` messages deleted.`,
  );
  await sendConfirmation(message, successEmbed);
}

async function sendConfirmation(message, embed) {
  const confirmationMessage = await message.channel.send({ embeds: [embed] });
  setTimeout(() => confirmationMessage.delete().catch(() => {}), DELETE_AFTER);
  message.delete().catch(() => {});
}
