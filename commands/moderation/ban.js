const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

const infoEmbed = createEmbed(
  `${EMOJIS.INFO} Ban`,
  `${EMOJIS.INFO} Bans a user from the server.`,
  'ban',
  'BAN_MEMBERS',
  'ban @user <reason> or ban <user_id> <reason>',
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'ban',
  description: 'Bans a user from the server.',
  aliases: ['banish'],

  async execute(message, args) {
    // Support for banning by mention or user ID
    const memberToBan = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!memberToBan) {
      infoEmbed.setFooter({
        text: `Mention a user or provide their user ID to ban.`,
        iconURL: message.guild.iconURL({ dynamic: true }),
      });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} You need the \`BAN_MEMBERS\` permission to use this command.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.Flags.BanMembers,
      )
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} I don’t have the \`BAN_MEMBERS\` permission to ban this user.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      message.member.roles.highest.comparePositionTo(
        memberToBan.roles.highest,
      ) <= 0
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} You cannot ban a member with a higher or equal role.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      message.guild.members.me.roles.highest.comparePositionTo(
        memberToBan.roles.highest,
      ) <= 0
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} I cannot ban this member due to role hierarchy.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      await memberToBan.ban({ reason });

      successEmbed
        .setTitle(`${EMOJIS.BOLT} User Banned`)
        .setDescription(
          `\`${memberToBan.user.tag}\` has been banned from the server.`,
        )
        .setFields(
          { name: `${EMOJIS.INFO} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false },
          { name: `${EMOJIS.USERS} Banned By`, value: `${message.author}`, inline: true },
          { name: `${EMOJIS.USER} User ID`, value: `${memberToBan.id}`, inline: true },
        )
        .setFooter({
          text: `Ban executed successfully by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await message.channel.send({
        embeds: [successEmbed],
      });

      message.delete().catch(() => {});
    } catch (error) {
      console.error(error);
      message.reply({ content: `${EMOJIS.ERROR} There was an error trying to ban the user.` });
    }
  },
};
