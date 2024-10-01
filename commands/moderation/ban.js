const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR, EMOJIS, PREFIX } = require('../../constants'); // Ensure PREFIX is defined

const infoEmbed = createEmbed(
  `${EMOJIS.INFO} Ban`,
  `This command is used to ban a user from the server.`,
  'banish',
  'BAN_MEMBERS',
  `ban @user <reason>\n,,ban <user_id> <reason>`
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);
const successEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'ban',
  description: 'Bans a user from the server.',
  aliases: ['banish'],

  async execute(message, args) {
    // Ensure the command is executed in a guild
    if (!message.guild) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} This command can only be used in a server.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if the command was executed without any arguments
    if (args.length === 0) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Support for banning by mention or user ID
    const memberToBan = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    // Security check: ensure the member to ban is found
    if (!memberToBan) {
      return message.channel.send({ embeds: [infoEmbed] });
    }

    // Check if the command user has ban permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} You need the \`BAN_MEMBERS\` permission to use this command.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Check if the bot has ban permissions
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} I don’t have the \`BAN_MEMBERS\` permission to ban this user.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Ensure both members are defined before checking roles
    if (message.member && memberToBan && message.member.roles && memberToBan.roles) {
      // Check if the user is trying to ban themselves or the bot
      if (memberToBan.id === message.author.id) {
        errorEmbed.setDescription(`${EMOJIS.ERROR} You cannot ban yourself.`);
        return message.channel.send({ embeds: [errorEmbed] });
      }
      if (memberToBan.id === message.guild.members.me.id) {
        errorEmbed.setDescription(`${EMOJIS.ERROR} I cannot ban myself.`);
        return message.channel.send({ embeds: [errorEmbed] });
      }

      // Role hierarchy checks
      if (message.member.roles.highest.comparePositionTo(memberToBan.roles.highest) <= 0) {
        errorEmbed.setDescription(`${EMOJIS.ERROR} You cannot ban a member with a higher or equal role.`);
        return message.channel.send({ embeds: [errorEmbed] });
      }

      if (message.guild.members.me.roles.highest.comparePositionTo(memberToBan.roles.highest) <= 0) {
        errorEmbed.setDescription(`${EMOJIS.ERROR} I cannot ban this member due to role hierarchy.`);
        return message.channel.send({ embeds: [errorEmbed] });
      }
    } else {
      errorEmbed.setDescription(`${EMOJIS.ERROR} Unable to retrieve role information. Please ensure the members are valid.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      // Attempt to ban the user
      await memberToBan.ban({ reason });

      successEmbed
        .setTitle(`${EMOJIS.BOLT} User Banned`)
        .setDescription(`\`${memberToBan.user.tag}\` has been banned from the server.`)
        .addFields(
          { name: `${EMOJIS.INFO} Reason`, value: `\`\`\`${reason}\`\`\``, inline: false },
        )

      await message.channel.send({ embeds: [successEmbed] });

      message.delete().catch(() => {});
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription(`${EMOJIS.ERROR} There was an error trying to ban the user.`);
      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
