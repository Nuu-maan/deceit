const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR } = require('../../constants');

const infoEmbed = createEmbed(
  'unmute',
  'Removes timeout from a user (unmutes).',
  'unmute',
  'MUTE_MEMBERS',
  'unmute @user <reason>',
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'unmute',
  description: 'Removes timeout from a user (unmutes).',
  aliases: ['untimeout'],

  async execute(message, args) {
    const memberToUnmute = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!memberToUnmute) {
      infoEmbed.setFooter({
        text: 'Mention a user to unmute.',
        iconURL: message.guild.iconURL({ dynamic: true }),
      });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)
    ) {
      errorEmbed.setDescription(
        'You need the `MUTE_MEMBERS` permission to use this command.',
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.Flags.MuteMembers,
      )
    ) {
      errorEmbed.setDescription(
        'I don’t have the `MUTE_MEMBERS` permission to unmute this user.',
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      message.guild.members.me.roles.highest.comparePositionTo(
        memberToUnmute.roles.highest,
      ) <= 0
    ) {
      errorEmbed.setDescription(
        'I cannot unmute this member due to role hierarchy.',
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      if (!memberToUnmute.communicationDisabledUntil) {
        errorEmbed.setDescription('This user is not currently muted.');
        return message.channel.send({ embeds: [errorEmbed] });
      }

      await memberToUnmute.timeout(null, reason);

      successEmbed
        .setTitle('🔊 User Unmuted')
        .setDescription(`\`${memberToUnmute.user.tag}\` has been unmuted.`)
        .setFields(
          { name: 'Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
          { name: 'Unmuted By', value: `${message.author}`, inline: true },
          { name: 'User ID', value: `${memberToUnmute.id}`, inline: true },
        )
        .setFooter({
          text: `Unmute executed successfully by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const sentMessage = await message.channel.send({
        embeds: [successEmbed],
      });

      message.delete().catch(() => {});
    } catch (error) {
      console.error(error);
      message.reply({
        content: 'There was an error trying to unmute the user.',
      });
    }
  },
};
