const { EmbedBuilder } = require('discord.js');
const { BOT_ADMINS } = require('../../constants');

const embed = new EmbedBuilder().setColor('#2B2D31');

module.exports = {
  name: 'perms',
  aliases: ['checkpermissions'],
  description: 'checks what permission a user has',
  async execute(message, args) {
    try {
      // Ensure the command is used in a server
      if (!message.guild) {
        return message.reply('This command can only be used in a server.');
      }

      // Ensure the user has the necessary permissions
      if (!BOT_ADMINS.includes(message.author.id)) {
        return;
      }

      // Get the member from the mention or ID
      let member;
      if (message.mentions.members.size) {
        member = message.mentions.members.first();
      } else if (args[0]) {
        try {
          member = await message.guild.members.fetch(args[0]);
        } catch (error) {
          return message.reply('Invalid member ID.');
        }
      } else {
        return message.reply('Please mention a valid member or provide their ID.');
      }

      // Get permissions and format them
      const permissions = member.permissions.toArray();
      const permissionsList = permissions.map((perm) => `\`\`\`${perm}\`\`\``).join(' ');

      // Create an embed with the permissions
      embed.setTitle(`${member.user.tag}'s Permissions`).setDescription(permissionsList);

      // Send the embed to the channel
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error in pingu command:', error);
    }
  },
};
