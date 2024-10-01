const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

const infoEmbed = createEmbed(
  `kick`,
  `to kick someone from server`,
  'kick',
  'KICK_MEMBERS',
  `kick @user <reason>\n,,kick <user_id> <reason>`,
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'kick',
  description: 'Kicks a user from the server.',
  aliases: ['kickout'],

  async execute(message, args) {
    if (!message.guild) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} This command can only be used in a server.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (args.length === 0) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    const memberToKick =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(args[0]).catch(() => null));
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!memberToKick) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} You need the \`KICK_MEMBERS\` permission to use this command.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.Flags.KickMembers,
      )
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} I don’t have the \`KICK_MEMBERS\` permission to kick this user.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (memberToKick.id === message.author.id) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} You cannot kick yourself.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (memberToKick.id === message.guild.members.me.id) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} I cannot kick myself.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      message.member.roles.highest.comparePositionTo(
        memberToKick.roles.highest,
      ) <= 0
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} You cannot kick a member with a higher or equal role.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      message.guild.members.me.roles.highest.comparePositionTo(
        memberToKick.roles.highest,
      ) <= 0
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} I cannot kick this member due to role hierarchy.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      await memberToKick.kick(reason);
      successEmbed
        .setTitle(`User Kicked`)
        .setDescription(
          `\`${memberToKick.user.tag}\` has been kicked from the server by ${message.author.tag}`,
        )
        .addFields({
          name: `Reason`,
          value: `\`\`\`${reason}\`\`\``,
          inline: false,
        });

      await message.channel.send({ embeds: [successEmbed] });
      message.delete().catch(() => {});
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} There was an error trying to kick the user.`,
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
