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
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      errorEmbed.setDescription(`${EMOJIS.ERROR} You do not have permission to manage roles.`);
      return message.reply({ embeds: [errorEmbed] });
    }

    if (args.length < 2) {
      return message.reply({ embeds: [infoEmbed] });
    }

    const action = args[0].toLowerCase();
    const userMention = message.mentions.members.first();

    let roleName;
    if (action === 'add' || action === 'remove') {
      if (!userMention) {
        return message.reply({ embeds: [infoEmbed] });
      }
      // Extract role name from arguments after the mention
      roleName = args.slice(2).join(' ').trim(); 
    } else {
      roleName = args.slice(1).join(' ').trim(); // For create and delete actions
    }

    try {
      switch (action) {
        case 'create':
          const createdRole = await message.guild.roles.create({ name: roleName });
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.SUCCESS} Role \`${createdRole.name}\` created successfully.`),
            ],
          });

        case 'delete':
          const roleToDelete = message.guild.roles.cache.find(r => r.name === roleName || r.id === roleName);
          if (!roleToDelete) {
            console.log(`Role search failed for: "${roleName}"`);
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(EMBED_COLOR)
                  .setDescription(`${EMOJIS.ERROR} Role \`${roleName}\` not found.`),
              ],
            });
          }

          const botMember = message.guild.members.me;
          if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(EMBED_COLOR)
                  .setDescription(`${EMOJIS.ERROR} I do not have permission to delete this role.`),
              ],
            });
          }

          if (botMember.roles.highest.position <= roleToDelete.position) {
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(EMBED_COLOR)
                  .setDescription(`${EMOJIS.ERROR} My role is not high enough to delete this role.`),
              ],
            });
          }

          await roleToDelete.delete();
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.SUCCESS} Role \`${roleToDelete.name}\` deleted successfully.`),
            ],
          });

        case 'add':
          const roleToAdd = message.guild.roles.cache.find(r => r.name === roleName || r.id === roleName);
          if (!roleToAdd) {
            console.log(`Role search failed for: "${roleName}"`);
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(EMBED_COLOR)
                  .setDescription(`${EMOJIS.ERROR} Role \`${roleName}\` not found.`),
              ],
            });
          }

          await userMention.roles.add(roleToAdd);
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.SUCCESS} Role \`${roleToAdd.name}\` given to ${userMention.user.username}.`),
            ],
          });

        case 'remove':
          const roleToRemove = message.guild.roles.cache.find(r => r.name === roleName || r.id === roleName);
          if (!roleToRemove) {
            console.log(`Role search failed for: "${roleName}"`);
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(EMBED_COLOR)
                  .setDescription(`${EMOJIS.ERROR} Role \`${roleName}\` not found.`),
              ],
            });
          }

          await userMention.roles.remove(roleToRemove);
          return message.reply({
            embeds: [
              new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} Role \`${roleToRemove.name}\` removed from ${userMention.user.username}.`),
            ],
          });

        default:
          return message.reply({ embeds: [infoEmbed] });
      }
    } catch (error) {
      console.error('Error handling role command:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`${EMOJIS.ERROR} An unexpected error occurred.`),
    ],
  });
}
},
};
