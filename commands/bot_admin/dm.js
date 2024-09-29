const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { BOT_ADMINS } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const embed = new EmbedBuilder().setColor('#2B2D31');
const errorEmbed = new EmbedBuilder().setColor('#2B2D31');
const infoEmbed = createEmbed(
  'dm',
  'dms a user',
  'none',
  'BOT_ADMIN',
  'dm <user> <message>',
);

module.exports = {
  name: 'dm',
  description: 'DMs member in the server',

  async execute(message, args) {
    try {
      // Ensure the command is used in a server
      const guild = message.guild;
      errorEmbed.setDescription('This command can only be used in a server.');
      if (!guild) return message.channel.send({ embeds: [errorEmbed] });

      // Ensure the user has the necessary permissions
      if (!BOT_ADMINS.includes(message.author.id)) {
        return;
      }

      // Ensure the bot has the required permissions
      const botMember = guild.members.me;
      if (!botMember) {
        return message.reply('Could not find the bot member in this server.');
      }

      if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
        errorEmbed.setDescription(
          'The bot does not have permission to send messages.',
        );
        return message.channel.send({ embeds: [errorEmbed] });
      }

      const dmMessage = args.join(' ');
      const sanitizedMessage = dmMessage
        .replace(/<@!?(\d+)>/g, '')
        .replace(/\d+/g, ''); // Replace mentions with a placeholder or just remove them

      if (!dmMessage) {
        return message.channel.send({ embeds: [infoEmbed] });
      }

      // fetch the member
      const userId = args[0];
      const member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(userId);

      if (!member) {
        return message.channel.send({ embeds: [infoEmbed] });
      }

      try {
        await member.send(sanitizedMessage);
        embed.setDescription(`dm sent to \`${member.user.tag}\``);
        return message.channel.send({ embeds: [embed] });
      } catch (err) {
        errorEmbed.setDescription(`could not dm \`${member.user.tag}\``);
        return message.channel.send({ embeds: [errorEmbed] });
      }
    } catch (err) {
      console.error(`Error in dm command: ${err}`);
    }
  },
};
