const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const ms = require('ms');
const { EMBED_COLOR } = require('../../constants');

const infoEmbed = createEmbed(
  'mute',
  `Mutes a user for a specified amount of time.`,
  'timeout',
  'MUTE_MEMBERS',
  'mute @user <duration> <reason>',
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'mute',
  aliases: ['timeout'],
  description: 'Mutes a user for a specified amount of time.',

  async execute(message, args) {
    const memberToMute = message.mentions.members.first();

    if (!memberToMute) {
      infoEmbed.setFooter({
        text: 'Use this command to mute members in your server.',
        iconURL: message.guild.iconURL({ dynamic: true }),
      });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)
    ) {
      errorEmbed.setDescription(
        'You need `MUTE_MEMBERS` permission to mute members.',
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.Flags.MuteMembers,
      )
    ) {
      errorEmbed.setDescription('The bot lacks the `MUTE_MEMBERS` permission.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      message.guild.members.me.roles.highest.comparePositionTo(
        memberToMute.roles.highest,
      ) <= 0
    ) {
      errorEmbed.setDescription(
        'I cannot mute this member due to role hierarchy.',
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (
      message.member.roles.highest.comparePositionTo(
        memberToMute.roles.highest,
      ) <= 0
    ) {
      errorEmbed.setDescription(
        'You cannot mute a member with a higher or equal role.',
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (memberToMute.permissions.has(PermissionsBitField.Flags.Administrator)) {
      errorEmbed.setDescription('You cannot mute administrators.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    const duration = args[1];
    if (!duration || isNaN(ms(duration))) {
      errorEmbed.setDescription(
        'Please provide a valid duration (e.g., `1d`, `1h`, `1m`).',
      );
      return message.channel.send({ embeds: [errorEmbed] });
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';
    const durationMs = ms(duration);

    try {
      await memberToMute.timeout(durationMs, reason);

      successEmbed
        .setTitle(`User Muted`)
        .setDescription(
          `\`${memberToMute.user.tag}\` has been muted for \`${duration}\`.`,
        )
        .setFields(
          { name: 'Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
          { name: 'Muted By', value: `${message.author}`, inline: true },
          {
            name: 'Muted Until',
            value: `<t:${Math.floor(Date.now() / 1000) + durationMs / 1000}:F>`,
            inline: true,
          },
        );

      const sentMessage = await message.channel.send({
        embeds: [successEmbed],
      });
    } catch (error) {
      console.error(error);
      message.reply({ content: 'There was an error trying to mute the user.' });
    }
  },
};
