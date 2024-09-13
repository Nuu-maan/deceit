const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMBED_COLOR, DELETE_AFTER } = require('../../constants');

const infoEmbed = createEmbed(
  ' ', 
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
      infoEmbed.setFooter({ text: 'Provide the user ID to unban.', iconURL: message.guild.iconURL({ dynamic: true }) });
      return message.channel.send({ embeds: [infoEmbed] });
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      errorEmbed.setDescription('You need the `BAN_MEMBERS` permission to use this command.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      errorEmbed.setDescription('I don’t have the `BAN_MEMBERS` permission to unban this user.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    try {
      const bannedUser = await message.client.users.fetch(userId);

      await message.guild.members.unban(userId, reason);

      successEmbed
        .setTitle('✅ User Unbanned')
        .setDescription(`\`${bannedUser.tag}\` has been unbanned from the server.`)
        .addFields(
          { name: 'Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
          { name: 'Unbanned By', value: `${message.author}`, inline: true },
          { name: 'User ID', value: `${userId}`, inline: true }
        )
        .setFooter({ text: `Unban executed successfully by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const sentMessage = await message.channel.send({ embeds: [successEmbed] });

      setTimeout(() => {
        sentMessage.delete().catch(() => {});
      }, DELETE_AFTER);

      message.delete().catch(() => {});
      
    } catch (error) {
      console.error(error);

      errorEmbed.setDescription('There was an error trying to unban the user. They may not be banned or the ID is incorrect.');
      return message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
