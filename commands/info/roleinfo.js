const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../helpers/commandInfoEmbed');
const { EMOJIS, EMBED_COLOR } = require('../../constants');

const infoEmbed = createEmbed(
  'roleinfo',
  'Displays information about a specified role.',
  'None',
  'View Role',
  'roleinfo <role>',
).setColor(EMBED_COLOR);

const errorEmbed = new EmbedBuilder().setColor(EMBED_COLOR);

module.exports = {
  name: 'roleinfo',
  aliases: ['rinfo'],
  description: 'Displays information about a specified role.',
  
  async execute(message, args) {
    const roleMention = args[0]; // Get role from arguments

    // Check if a role is mentioned
    if (!roleMention) {
      return message.channel.send({ embeds: [infoEmbed] }); // Show info embed if no role is mentioned
    }

    // Try to get the role from the guild
    const role = message.guild.roles.cache.get(roleMention.replace(/[<@&>]/g, ''));

    if (!role) {
      errorEmbed.setDescription('Invalid role provided. Please mention a valid role.');
      return message.channel.send({ embeds: [errorEmbed] });
    }

    // Role info embed
    const roleInfoEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR) // Use embed color from constants
      .setTitle(`Role: ${role.name}`)
      .setDescription(`Here is the information for the role **${role.name}**.`)
      .addFields(
        { name: `${EMOJIS.USERS} Members`, value: `${role.members.size}`, inline: true },
        { name: `${EMOJIS.KEY} Role ID`, value: `${role.id}`, inline: true },
        { name: `${EMOJIS.SETTINGS} Color`, value: `${role.hexColor}`, inline: true },
        { name: `${EMOJIS.BOLT} Position`, value: `${role.position}`, inline: true },
        { name: `${EMOJIS.HEART} Mentionable`, value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: `${EMOJIS.STAR} Created At`, value: role.createdAt.toDateString(), inline: true },
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    // Add a button for role permissions (only for users with MANAGE_ROLES)
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('show_permissions')
        .setLabel('Show Role Permissions')
        .setEmoji(EMOJIS.SETTINGS)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) // Disable if no MANAGE_ROLES
    );

    // Send the role information embed with the button
    const msg = await message.channel.send({ embeds: [roleInfoEmbed], components: [row] });

    // Create a collector to handle button interaction
    const collector = msg.createMessageComponentCollector({
      componentType: 'BUTTON',
      time: 60000, // 1 minute collector
    });

    collector.on('collect', async (interaction) => {
      try {
        if (interaction.customId === 'show_permissions') {
          // Check if the user has MANAGE_ROLES and is the message author
          if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({
              content: 'You do not have permission to view the role permissions!',
              ephemeral: true,
            });
          }

          if (interaction.user.id !== message.author.id) {
            return interaction.reply({
              content: 'Only the command author can use this button!',
              ephemeral: true,
            });
          }

          // Send an aesthetic embed with role permissions
          const permissionsEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`Permissions for Role: ${role.name}`)
            .setDescription('Here are the permissions for this role:')
            .addFields(
              { name: 'Role Permissions', value: role.permissions.toArray().map(perm => `\`${perm}\``).join(', ') || 'No Permissions' }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

          await interaction.reply({ embeds: [permissionsEmbed], ephemeral: true });
        }
      } catch (error) {
        console.error('Error handling interaction:', error);
        await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
      }
    });

    collector.on('end', collected => {
      row.components[0].setDisabled(true);
      msg.edit({ components: [row] });
    });
  },
};
