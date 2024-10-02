const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { EMBED_COLOR, EMOJIS } = require('../../constants');

const cooldowns = new Map();

module.exports = {
  name: 'userinfo',
  aliases: ['ui'],
  description: 'Get user information by user ID or mention.',
  async execute(message, args) {
    const userId = message.mentions.users.first()?.id || args[0] || message.author.id;
    const now = Date.now();
    const cooldownAmount = 10000;

    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(EMBED_COLOR)
              .setDescription(`Please wait ${timeLeft.toFixed(1)} more seconds before using this command again.`),
          ],
        });
      }
    }

    cooldowns.set(message.author.id, now);
    setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

    try {
      const user = await message.client.users.fetch(userId, { force: true });
      if (!user) throw new Error('User not found');
      
      const profileResponse = await fetch(`https://dcdn.n0step.xyz/profile/${userId}`);
      if (!profileResponse.ok) {
        if (profileResponse.status === 429) {
          const retryAfter = profileResponse.headers.get('Retry-After') || 1;
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`You are being rate limited. Please wait ${retryAfter} seconds before trying again.`),
            ],
          });
        }
        throw new Error('Profile not found');
      }
      const profileData = await profileResponse.json();

      const member = message.guild.members.cache.get(userId);
      const joinedAt = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A';
      const registeredAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
      const roles = member ? member.roles.cache.map(role => `<@&${role.id}>`) : [];
      const displayedRoles = roles.length > 5 
        ? `${roles.slice(0, 5).join(', ')}, and ${roles.length - 5} more`
        : roles.join(', ') || 'None';
      
      const keyPerms = member && member.permissions ? member.permissions.toArray().join(', ') || 'None' : 'None';
      
      const embedPage1 = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.USER} ${user.username}#${user.discriminator} - Server Info`)
        .addFields(
          { name: `${EMOJIS.INFO} | Joined `, value: joinedAt || 'N/A', inline: true },
          { name: `${EMOJIS.INFO} | Registered `, value: registeredAt || 'N/A', inline: true },
          { name: `${EMOJIS.KEY} | Roles `, value: displayedRoles || 'None', inline: true },
          { name: `${EMOJIS.KEY} | Key Permissions`, value: `\`\`\`${keyPerms || 'None'}\`\`\``, inline: true }
        )
        .setFooter({ text: 'Page 1/2' });
      
      const bannerURL = user.bannerURL({ dynamic: true, size: 1024 }) || 'None';
      const connectedAccounts = Array.isArray(profileData.connected_accounts) ? profileData.connected_accounts : [];
      
      const bio = profileData.user_profile?.bio || 'No bio available'; 
      
      const embedPage2 = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.USER} ${user.username}#${user.discriminator} - User Info`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: `${EMOJIS.INFO} | ID `, value: user.id || 'Unknown', inline: false },
          { name: `${EMOJIS.PICTURE} | Avatar `, value: `[Avatar Link](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`, inline: false },
          { name: `${EMOJIS.PICTURE} | Banner `, value: bannerURL !== 'None' ? `[Banner Link](${bannerURL})` : 'None', inline: false },
          { name: `${EMOJIS.INFO} | Global Name `, value: user.global_name || 'None', inline: false },
          { name: `${EMOJIS.INFO} | Bio `, value: bio ? `||${bio}||` : 'No bio available', inline: false }, // Updated to display bio correctly
          { name: `${EMOJIS.INFO} | Connected Accounts `, value: connectedAccounts.length > 0 ? connectedAccounts.map(account => `${account.type}: \`${account.name}\``).join('\n') : 'None' }
        )
        .setFooter({ text: 'Page 2/2' });
    
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('previous').setLabel('Previous').setEmoji('◀️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('next').setLabel('Next').setEmoji('▶️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('avatar').setLabel(`Avatar`).setEmoji('🖼️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('banner').setLabel(`Banner`).setEmoji('🖼️').setStyle(ButtonStyle.Secondary)
      );

      const msg = await message.channel.send({ embeds: [embedPage1], components: [row] });

      const filter = (i) => i.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        await interaction.deferUpdate();

        if (interaction.customId === 'next') {
          await msg.edit({ embeds: [embedPage2] });
        } else if (interaction.customId === 'previous') {
          await msg.edit({ embeds: [embedPage1] });
        } else if (interaction.customId === 'avatar') {
          await interaction.followUp({
            embeds: [
              new EmbedBuilder().setColor(EMBED_COLOR).setImage(user.displayAvatarURL({ dynamic: true, size: 1024 })),
            ],
            ephemeral: true,
          });
        } else if (interaction.customId === 'banner' && bannerURL !== 'None') {
          await interaction.followUp({
            embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setImage(bannerURL)],
            ephemeral: true,
          });
        } else if (interaction.customId === 'banner' && bannerURL === 'None') {
          await interaction.followUp({
            embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setDescription('This user does not have a banner.')],
            ephemeral: true,
          });
        }
      });

    } catch (error) {
      console.error('Error fetching user info:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription('An error occurred while fetching user information. Please try again later.'),
        ],
      });
    }
  },
};
