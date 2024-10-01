const {
    EmbedBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js');
  const { EMBED_COLOR, EMOJIS } = require('../../constants');
  
  module.exports = {
    name: 'untimeoutall',
    description: 'Removes timeout from all users in the guild.',
    async execute(message) {
      // Check if the user has the required permissions
      if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} You need the \`MUTE_MEMBERS\` permission to use this command.`),
          ],
        });
      }
  
      // Fetch all members who are timed out
      const members = message.guild.members.cache.filter((member) => member.communicationDisabledUntil);
      const timeoutCount = members.size;
  
      if (timeoutCount === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.INFO} There are no members currently timed out in this guild.`),
          ],
        });
      }
  
      // Embed to show the confirmation message
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.WARNING} Confirmation Required`)
        .setDescription(
          `You are about to remove timeout from \`${timeoutCount}\` users in this guild.\n\n**Are you sure you want to proceed?**`
        );
  
      // Action row with confirm and cancel buttons
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
      );
  
      const confirmationMessage = await message.channel.send({ embeds: [embed], components: [row] });
  
      let actionConfirmed = false; // Flag to track if action was confirmed
  
      // Create a collector for button interactions
      const collector = confirmationMessage.createMessageComponentCollector({ time: 15000 });
  
      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: `${EMOJIS.ERROR} You are not authorized to confirm this action.`,
            ephemeral: true,
          });
        }
  
        if (interaction.customId === 'confirm') {
          actionConfirmed = true; // Set flag to true when confirmed
  
          try {
            // Remove timeouts for all members
            for (const member of members.values()) {
              await member.timeout(null);
            }
  
            // Success message
            const successEmbed = new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} Removed timeout from \`${timeoutCount}\` users.`)
              .setFooter({
                text: `Action confirmed by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp();
  
            await interaction.update({ embeds: [successEmbed], components: [] });
            collector.stop(); // Stop the collector after completing the action
          } catch (error) {
            console.error(error);
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(EMBED_COLOR)
                  .setDescription(`${EMOJIS.ERROR} There was an error while removing the timeouts.`),
              ],
              ephemeral: true,
            });
          }
        } else if (interaction.customId === 'cancel') {
          actionConfirmed = true; // Set flag to true when cancelled
  
          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.INFO} Action cancelled. No users were unmuted.`),
            ],
            components: [],
          });
          collector.stop(); // Stop the collector after cancelling
        }
      });
  
      collector.on('end', async () => {
        // Only send the timeout message if no action was confirmed
        if (!actionConfirmed) {
          await confirmationMessage.edit({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.WARNING} Confirmation timed out. No action was taken.`),
            ],
            components: [],
          });
        }
      });
    },
  };
  