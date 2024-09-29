const { EmbedBuilder } = require('discord.js');
const { EMBED_COLOR, BOT_ADMINS, EMOJIS } = require('../../constants');

function infoEmbed(action, roleName, userMention) {
  let description = '';
  switch (action) {
    case 'create':
      description = `${EMOJIS.SUCCESS} Role "${roleName}" created successfully.`;
      break;
    case 'delete':
      description = `${EMOJIS.SUCCESS} Role "${roleName}" deleted successfully.`;
      break;
    case 'give':
      description = `${EMOJIS.SUCCESS} Role "${roleName}" given to ${userMention.user.username} successfully.`;
      break;
    case 'remove':
      description = `${EMOJIS.SUCCESS} Role "${roleName}" removed from ${userMention.user.username} successfully.`;
      break;
    default:
      description = `${EMOJIS.WARNING} Invalid action.`;
  }

  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setDescription(description);
}

module.exports = {
  name: 'role',
  description: 'Manage roles (create, delete, give, remove)',
  async execute(message, args) {
    // Check if the user has permission to manage roles
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`${EMOJIS.ERROR} You do not have permission to manage roles.`),
        ],
      });
    }

    // Command parsing
    const action = args[0]; // create, delete, give, remove
    const roleName = args[1]; // role name
    const userMention = message.mentions.members.first(); // user to give/remove role to

    // Create role
    if (action === 'create') {
      if (!roleName) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.WARNING} Please specify a role name to create.`),
          ],
        });
      }

      try {
        const newRole = await message.guild.roles.create({
          name: roleName,
          color: 'BLUE', // You can customize the color as needed
        });

        return message.reply({ embeds: [infoEmbed('create', newRole.name)] });
      } catch (error) {
        console.error('Error creating role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} There was an error creating the role.`),
          ],
        });
      }
    }

    // Delete role
    if (action === 'delete') {
      if (!roleName) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.WARNING} Please specify a role name to delete.`),
          ],
        });
      }

      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} Role "${roleName}" not found.`),
          ],
        });
      }

      try {
        await role.delete();
        return message.reply({ embeds: [infoEmbed('delete', role.name)] });
      } catch (error) {
        console.error('Error deleting role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} There was an error deleting the role.`),
          ],
        });
      }
    }

    // Give role to user
    if (action === 'give') {
      if (!roleName || !userMention) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.WARNING} Please specify a role name and a user to give the role to.`),
          ],
        });
      }

      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} Role "${roleName}" not found.`),
          ],
        });
      }

      try {
        await userMention.roles.add(role);
        return message.reply({ embeds: [infoEmbed('give', role.name, userMention)] });
      } catch (error) {
        console.error('Error giving role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} There was an error giving the role.`),
          ],
        });
      }
    }

    // Remove role from user
    if (action === 'remove') {
      if (!roleName || !userMention) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.WARNING} Please specify a role name and a user to remove the role from.`),
          ],
        });
      }

      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} Role "${roleName}" not found.`),
          ],
        });
      }

      try {
        await userMention.roles.remove(role);
        return message.reply({ embeds: [infoEmbed('remove', role.name, userMention)] });
      } catch (error) {
        console.error('Error removing role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} There was an error removing the role.`),
          ],
        });
      }
    }

    // Invalid action
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setDescription(`${EMOJIS.WARNING} Invalid action. Please use create, delete, give, or remove.`),
      ],
    });
  },
};
