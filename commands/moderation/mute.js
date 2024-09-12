const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const ms = require('ms'); // npm install ms to handle time duration
const { EMBED_COLOR } = require('../../constants');

// Create the info embed for the mute command
const infoEmbed = createEmbed('mute', 'Mutes a user for a specified amount of time.', 'timeout', 'MUTE_MEMBERS', 'mute @user <duration> <reason>');

// Function to create error embed
const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

// Function to create success embed
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'mute',
  aliases: ['timeout'],
  description: 'Mutes a user for a specified amount of time.',

  async execute(message, args) {
    const memberToMute = message.mentions.members.first();

    // Check if a member is mentioned
    if (!memberToMute) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Check if user has MUTE_MEMBERS permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      errorEmbed.setDescription('`MUTE_MEMBERS` permission required');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if the bot has the necessary permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      errorEmbed.setDescription('bot lack the `MUTE_MEMBERS` permission.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if the bot can manage roles of the member to mute
    if (message.guild.members.me.roles.highest.comparePositionTo(memberToMute.roles.highest) <= 0) {
      errorEmbed.setDescription('I cannot mute this member due to role hierarchy.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if user has a role that is higher than or equal to the role of the member they are trying to mute
    if (message.member.roles.highest.comparePositionTo(memberToMute.roles.highest) <= 0) {
      errorEmbed.setDescription('You cannot mute a member with a higher or equal role.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // check ig youre muting someone with admin perms
    if (memberToMute.permissions.has(PermissionsBitField.Flags.Administrator)) {
      errorEmbed.setDescription('You cannot mute administrators.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if duration is provided and valid
    const duration = args[1];
    if (!duration || isNaN(ms(duration))) {
      errorEmbed.setDescription('Please provide a valid duration. Example: `1d`, `1h`, `1m`');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if reason is provided
    const reason = args.slice(2).join(' ') || 'No reason provided';

    // Convert duration to milliseconds
    const durationMs = ms(duration);

    try {
      await memberToMute.timeout(durationMs, reason);
      successEmbed.setDescription(`\`${memberToMute.user.tag}\` has been muted for \`${duration}\`. \n\`\`\`reason: ${reason}\`\`\``);
      message.channel.send({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
      message.reply({ content: 'There was an error trying to mute the user.' });
    }
  },
};
