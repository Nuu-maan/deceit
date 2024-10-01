const {
    EmbedBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js');
  const { EMBED_COLOR, EMOJIS } = require('../../constants');
  
  module.exports = {
    name: 'unbanall',
    description: 'Unbans all banned users in the guild.',
    async execute(message) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.ERROR} You need the \`BAN_MEMBERS\` permission to use this command.`),
          ],
        });
      }
  
      const bans = await message.guild.bans.fetch();
      const banCount = bans.size;
  
      if (banCount === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.INFO} There are no banned users in this guild.`),
          ],
        });
      }
  
      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.WARNING} Confirmation Required`)
        .setDescription(`You are about to unban \`${banCount}\` users in this guild.\n\n**Are you sure you want to proceed?**`);
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
      );
  
      const confirmationMessage = await message.channel.send({ embeds: [embed], components: [row] });
  
      const collector = confirmationMessage.createMessageComponentCollector({ time: 15000 });
  
      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: `${EMOJIS.ERROR} You are not authorized to confirm this action.`,
            ephemeral: true,
          });
        }
  
        if (interaction.customId === 'confirm') {
          try {
            for (const ban of bans.values()) {
              await message.guild.members.unban(ban.user);
            }
  
            const successEmbed = new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`${EMOJIS.SUCCESS} Unbanned \`${banCount}\` users.`)
              .setFooter({
                text: `Action confirmed by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp();
  
            await interaction.update({ embeds: [successEmbed], components: [] });
            collector.stop();
          } catch (error) {
            console.error(error);
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(EMBED_COLOR)
                  .setDescription(`${EMOJIS.ERROR} There was an error while unbanning the users.`),
              ],
              ephemeral: true,
            });
          }
        } else if (interaction.customId === 'cancel') {
          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`${EMOJIS.INFO} Action cancelled. No users were unbanned.`),
            ],
            components: [],
          });
          collector.stop();
        }
      });
  
      collector.on('end', async (collected) => {
        if (collected.size === 0) {
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
  