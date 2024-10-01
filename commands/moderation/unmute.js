const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

const infoEmbed = createEmbed(
  'unmute',
  'Removes timeout from a user (unmutes).',
  'unmute',
  'MUTE_MEMBERS',
  'unmute @user <reason> \n,,unmute <user_id> <reason>',
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'unmute',
  description: 'Removes timeout from a user (unmutes).',
  aliases: ['untimeout'],

  async execute(message, args) {
    const userId = args[0]?.replace(/\D/g, '');
    const memberToUnmute = message.mentions.members.first() || message.guild.members.cache.get(userId);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!memberToUnmute) {
      infoEmbed.setFooter({
        text: 'Mention a user or provide a user ID to unmute.',
        iconURL: message.guild.iconURL({ dynamic: true }),
      });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Permission checks
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} You need the \`MUTE_MEMBERS\` permission to use this command.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} I don’t have the \`MUTE_MEMBERS\` permission to unmute this user.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (message.guild.members.me.roles.highest.comparePositionTo(memberToUnmute.roles.highest) <= 0) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} I cannot unmute this member due to role hierarchy.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Security check: ensure the user is currently muted
    if (!memberToUnmute.communicationDisabledUntil) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} This user is not currently muted.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      await memberToUnmute.timeout(null, reason);

      successEmbed.setDescription(`${EMOJIS.SUCCESS} ${memberToUnmute.user.tag} has been unmuted. \`\`\`Reason: ${reason}\`\`\``)

      await message.channel.send({ embeds: [successEmbed] });

      message.delete().catch(() => {});
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription(`${EMOJIS.ERROR} There was an error trying to unmute the user.`);
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};
