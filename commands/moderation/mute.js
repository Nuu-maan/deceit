const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const ms = require('ms'); // npm install ms to handle time duration
const { EMBED_COLOR, EMOJIS } = require('../../constants');

// Create the info embed for the mute command
const infoEmbed = createEmbed(
  'mute',
  'Mutes a user for a specified amount of time.',
  'timeout',
  'MUTE_MEMBERS',
  'mute @user <duration> <reason> \n,,mute <user_id> <duration> <reason>'
);

// Create the error embed for permission issues
const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

// Success embed
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'mute',
  aliases: ['timeout'],
  description: 'Mutes a user for a specified amount of time.',

  async execute(message, args) {
    // Check if user has MUTE_MEMBERS permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply({ embeds: [errorEmbed.setDescription(`${EMOJIS.ERROR} \`MUTE_MEMBERS\` permission required.`)] });
    }

    // Get the user from mentions or ID
    const userId = args[0]?.replace(/\D/g, ''); // Remove any non-digit characters
    const user = message.mentions.members.first() || message.guild.members.cache.get(userId);

    if (!user) {
      return message.reply({ embeds: [infoEmbed] });
    }

    // Check if the member has a higher role
    if (message.member.roles.highest.comparePositionTo(user.roles.highest) <= 0) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} You cannot mute a member with a higher or equal role.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if duration is provided and valid
    const duration = args[1];
    if (!duration || isNaN(ms(duration)) || ms(duration) > ms('1w')) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} Please provide a valid duration (up to 1 week).`);
      return message.reply({ embeds: [errorEmbed] });
    }

    // Check if reason is provided
    const reason = args.slice(2).join(' ') || 'No reason provided';

    // Convert duration to milliseconds
    const durationMs = ms(duration);

    try {
      await user.timeout(durationMs, reason);
      successEmbed.setDescription(`${EMOJIS.SUCCESS} ${user.user.tag} has been muted for \`${duration}\`. \`\`\`Reason: ${reason}\`\`\``);
      message.channel.send({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription(`${EMOJIS.ERROR} There was an error trying to mute the user. They may not have the required role or permissions.`);
      return message.reply({ embeds: [errorEmbed] });
    }
  },
};
