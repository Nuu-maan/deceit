const {
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');
const { EMBED_COLOR, DELETE_AFTER } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed(
  'purge',
  'Deletes a specified number of messages',
  'clear, p',
  'MANAGE_MESSAGES',
  'purge <amount>\n,,purge <amount> bots\n,,purge <amount> @mentionuser',
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
    if (filterType && filterType !== 'bots' && !message.mentions.users.size) {
      errorEmbed.setDescription(
        'You must mention a user to purge their messages.\n```,,purge <amount> @mentionuser```',
      );
      return message.reply({ embeds: [errorEmbed] });
    }

    switch (filterType) {
      case 'bots':
        await purgeBots(message, amount);
        break;

      default:
        const user = message.mentions.users.first();
        await purgeUser(message, user, amount);
        break;
    }
  },
};

async function purgeBots(message, amount) {
  const fetched = await message.channel.messages.fetch({
    limit: Math.min(100, amount), // Fetch up to 100 messages or the requested amount
  });

  const botMessages = fetched.filter((msg) => msg.author.bot); // Filter bot messages

  const messagesToDelete = botMessages.first(amount); // Get the specified amount of bot messages

  if (messagesToDelete.size === 0) {
    errorEmbed.setDescription('No bot messages found.');
    return message.reply({ embeds: [errorEmbed] });
  }

  await message.channel.bulkDelete(messagesToDelete, true); // Bulk delete the filtered messages

  successEmbed.setDescription(
    `\`${messagesToDelete.size}\` bot messages deleted.`, // Correctly show the count
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
    errorEmbed.setDescription(`No messages from \`${user.tag}\` found.`);
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
