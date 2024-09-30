const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { EMBED_COLOR, EMOJIS } = require('../../constants');
const { createEmbed } = require('../../helpers/commandInfoEmbed');

const infoEmbed = createEmbed(
  'Roles',
  'Manage roles (create, delete, add, remove)',
  'role',
  'MANAGE_ROLES',
  'role create <rolename>\n,,role remove @mention <rolename>\n,,role add @mention <rolename>\n,,role delete <rolename>',
);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'role',
  description: 'Manage roles (create, delete, add, remove)',
  async execute(message, args) {
    // Check if the user has permission to manage roles
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
      errorEmbed.setDescription(
        `${EMOJIS.ERROR} You do not have permission to manage roles.`,
      );
      return message.reply({
        embeds: [errorEmbed],
      });
    }

    // Check for missing arguments
    if (args.length < 2) {
      return message.reply({ embeds: [infoEmbed] });
    }

    const action = args[0].toLowerCase(); // create, delete, add, remove
    const roleName = args.slice(1).join(' '); // role name

    // Handle role management commands
    if (action === 'create') {
      try {
        const role = await message.guild.roles.create({ name: roleName });
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.SUCCESS} Role \`${role.name}\` created successfully.`,
              ),
          ],
        });
      } catch (error) {
        console.error('Error creating role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.ERROR} There was an error creating the role.`,
              ),
          ],
        });
      }
    }

    if (action === 'delete') {
      const role = message.guild.roles.cache.find((r) => r.name === roleName);
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.ERROR} Role \`${roleName}\` not found.`,
              ),
          ],
        });
      }
      try {
        await role.delete();
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.SUCCESS} Role \`${role.name}\` deleted successfully.`,
              ),
          ],
        });
      } catch (error) {
        console.error('Error deleting role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.ERROR} There was an error deleting the role.`,
              ),
          ],
        });
      }
    }

    if (action === 'add') {
      const userMention = message.mentions.members.first();

      if (!userMention) {
        return message.reply({
          embeds: [infoEmbed], // Send infoEmbed for incorrect usage
        });
      }

      // Split the message content and extract the role name
      const args = message.content.split(' ');
      const roleName = args.slice(3).join(' '); // Assuming the role name starts from the 4th argument

      const role = message.guild.roles.cache.find((r) => r.name === roleName);

      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.ERROR} Role \`${roleName}\` not found.`,
              ),
          ],
        });
      }

      try {
        await userMention.roles.add(role);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.SUCCESS} Role \`${role.name}\` given to ${userMention.user.username}.`,
              ),
          ],
        });
      } catch (error) {
        console.error('Error giving role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.ERROR} There was an error giving the role.`,
              ),
          ],
        });
      }
    }

    if (action === 'remove') {
      const userMention = message.mentions.members.first();
      if (!userMention) {
        return message.reply({
          embeds: [infoEmbed], // Send infoEmbed for incorrect usage
        });
      }
      const role = message.guild.roles.cache.find((r) => r.name === roleName);
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.ERROR} Role \`${roleName}\` not found.`,
              ),
          ],
        });
      }
      try {
        await userMention.roles.remove(role);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.SUCCESS} Role \`${role.name}\` removed from ${userMention.user.username}.`,
              ),
          ],
        });
      } catch (error) {
        console.error('Error removing role:', error);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(
                `${EMOJIS.ERROR} There was an error removing the role.`,
              ),
          ],
        });
      }
    }

    // If none of the above actions match, send the info embed.
    return message.reply({ embeds: [infoEmbed] });
  },
};
