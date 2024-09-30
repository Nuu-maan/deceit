const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR, EMOJIS } = require('../../constants'); // Make sure to include EMOJIS if used in embeds

const infoEmbed = createEmbed(
  `${EMOJIS.INFO} Unban`,
  'Unbans a user from the server.',
  'unban',
  'BAN_MEMBERS',
  'unban <user_id> <reason>'
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'unban',
  description: 'Unbans a user from the server.',
  aliases: ['pardon'],

  async execute(message, args) {
    const userId = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!userId) {
      infoEmbed.setFooter({
        text: 'Provide the user ID to unban.',
        iconURL: message.guild.iconURL({ dynamic: true }),
      });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Check if the command user has ban permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      errorEmbed.setDescription('You need the `BAN_MEMBERS` permission to use this command.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if the bot has ban permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      errorEmbed.setDescription('I don’t have the `BAN_MEMBERS` permission to unban this user.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Ensure the user is valid
    try {
      const bannedUser = await message.client.users.fetch(userId);

      // Check if the user is trying to unban themselves
      if (bannedUser.id === message.author.id) {
        errorEmbed.setDescription('You cannot unban yourself.');
        return message.channel.send({ embeds: [errorEmbed] });
      }

      // Attempt to unban the user
      await message.guild.members.unban(userId, reason);

      successEmbed
        .setTitle(`${EMOJIS.BOLT} User Unbanned`)
        .setDescription(`\`${bannedUser.tag}\` has been unbanned from the server.`)
        .setFields(
          { name: `${EMOJIS.INFO} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false },
        )
        .setFooter({
          text: `Unban executed  by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [successEmbed] });

      // Delete the command message if possible
      message.delete().catch(() => {});
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription('There was an error trying to unban the user. They may not be banned or the ID is incorrect.');
      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
