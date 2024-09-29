const {
  EmbedBuilder,
  userMention,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  PermissionsBitField
} = require('discord.js');
const { EMBED_COLOR, EMOJIS } = require('../../constants');

module.exports = {
  name: 'serverinfo',
  aliases: ['si'],
  description: 'Provides detailed information about the current server.',
  async execute(message) {
    const { guild, author } = message;

    try {
      // Fetch the server owner with error handling
      const owner = await guild.fetchOwner().catch(() => null);
      if (!owner) {
        return message.channel.send('Unable to fetch server owner information.');
      }

      const totalChannels = guild.channels.cache.size;
      const categoryChannels = guild.channels.cache.filter(channel => channel.type === 4).size;
      const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size;
      const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size;
      const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
      const totalMembers = guild.memberCount;

      const members = guild.members.cache;
      const onlineCount = members.filter(member => member.presence?.status === 'online').size;
      const idleCount = members.filter(member => member.presence?.status === 'idle').size;
      const dndCount = members.filter(member => member.presence?.status === 'dnd').size;
      const offlineCount = totalMembers - (onlineCount + idleCount + dndCount);

      const totalRoles = guild.roles.cache.size;
      const boostLevel = guild.premiumTier || 'None';
      const boostCount = guild.premiumSubscriptionCount || 0;
      const serverIcon = guild.iconURL({ dynamic: true, size: 1024 });
      const vanityURL = guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : 'No Vanity URL';

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.DISCORD} Server Information`)
        .setDescription(`Here are the details for **${guild.name}**:`)
        .setThumbnail(serverIcon || null)
        .addFields(
          { name: `${EMOJIS.INFO} Channels`, value: `**Category:** ${categoryChannels}\n**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Total:** ${totalChannels}`, inline: true },
          { name: `${EMOJIS.USERS} Members`, value: `**Total Members:** ${totalMembers}\n**Online:** ${onlineCount}\n**Idle:** ${idleCount}\n**Do Not Disturb:** ${dndCount}\n**Offline:** ${offlineCount}`, inline: true },
          { name: `${EMOJIS.HEART} Boost Information`, value: `**Level:** ${boostLevel}\n**Boosts:** ${boostCount}`, inline: true },
          { name: `${EMOJIS.INFO} Created At`, value: createdAt, inline: true },
          { name: `${EMOJIS.USER} Server Owner`, value: `${userMention(owner.id)} (ID: ${owner.id})`, inline: true },
          { name: `${EMOJIS.SETTINGS} Roles`, value: `${totalRoles}`, inline: true },
          { name: `${EMOJIS.INFO} Vanity URL`, value: vanityURL, inline: true }
        )
        .setFooter({ text: `Requested by ${author.tag}`, iconURL: author.displayAvatarURL({ dynamic: true }) });

      const rolesButton = new ButtonBuilder()
        .setCustomId('show_roles')
        .setLabel('Show Roles')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles));

      const iconButton = new ButtonBuilder()
        .setCustomId('show_icon')
        .setLabel('Server Icon')
        .setStyle(ButtonStyle.Secondary);

      const bannerButton = new ButtonBuilder()
        .setCustomId('show_banner')
        .setLabel('Server Banner')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(rolesButton, iconButton, bannerButton);
      const msg = await message.channel.send({ embeds: [embed], components: [row] });

      const filter = i => i.user.id === author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async (interaction) => {
        await interaction.deferUpdate();
        
        if (interaction.customId === 'show_icon') {
          const iconEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle('Server Icon')
            .setImage(serverIcon || null)
            .setFooter({ text: `Requested by ${author.tag}`, iconURL: author.displayAvatarURL({ dynamic: true }) });
          
          await interaction.followUp({ embeds: [iconEmbed], ephemeral: true });
        } else if (interaction.customId === 'show_banner') {
          const bannerURL = guild.bannerURL({ dynamic: true, size: 1024 });
          const bannerEmbed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle('Server Banner')
            .setImage(bannerURL || null)
            .setFooter({ text: `Requested by ${author.tag}`, iconURL: author.displayAvatarURL({ dynamic: true }) });
          
          await interaction.followUp({ embeds: [bannerEmbed], ephemeral: true });
        }
      });

      // Disable buttons after the collector ends
      collector.on('end', () => {
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            rolesButton.setDisabled(true),
            iconButton.setDisabled(true),
            bannerButton.setDisabled(true)
          );
        msg.edit({ components: [disabledRow] });
      });

    } catch (error) {
      console.error('Error fetching server info:', error);
      message.channel.send('An error occurred while fetching server information. Please try again later.');
    }
  },
};
