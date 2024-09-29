const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { EMBED_COLOR, EMOJIS } = require('../../constants');

const cooldowns = new Map();

module.exports = {
  name: 'userinfo',
  aliases: ['ui'],
  description: 'Get user information by user ID or mention.',
  async execute(message, args) {
    const userId = message.mentions.users.first()?.id || args[0] || message.author.id;

    // Check if the user is on cooldown
    const now = Date.now();
    const cooldownAmount = 10000; // 10 seconds in milliseconds

    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply({ embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setDescription(`Please wait ${timeLeft.toFixed(1)} more seconds before using this command again.`)] });
      }
    }

    // Set the cooldown for the user
    cooldowns.set(message.author.id, now);
    setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

    try {
      // Fetch user data from the API
      const userResponse = await fetch(`https://dcdn.n0step.xyz/users/${userId}`);
      if (!userResponse.ok) {
        // Handle rate limit or error responses
        if (userResponse.status === 429) {
          const retryAfter = userResponse.headers.get('Retry-After') || 1; // Default to 1 second if not provided
          return message.reply({ embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setDescription(`You are being rate limited. Please wait ${retryAfter} seconds before trying again.`)] });
        }
        throw new Error('User not found');
      }
      const userData = await userResponse.json();

      // Fetch user profile data from the API
      const profileResponse = await fetch(`https://dcdn.n0step.xyz/profile/${userId}`);
      if (!profileResponse.ok) {
        // Handle rate limit or error responses
        if (profileResponse.status === 429) {
          const retryAfter = profileResponse.headers.get('Retry-After') || 1; // Default to 1 second if not provided
          return message.reply({ embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setDescription(`You are being rate limited. Please wait ${retryAfter} seconds before trying again.`)] });
        }
        throw new Error('Profile not found');
      }
      const profileData = await profileResponse.json();

      // Check if user is a member of the guild
      const member = message.guild.members.cache.get(userId);
      const joinedAt = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A';
      const registeredAt = userData.created_at ? `<t:${Math.floor(new Date(userData.created_at).getTime() / 1000)}:R>` : 'N/A';
      const roles = member ? member.roles.cache.map(role => role.name).join(', ') || 'None' : 'None';
      const keyPerms = member ? member.permissions.toArray().join(', ') || 'None' : 'None';

      const embedPage1 = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.USER} ${userData.username}#${userData.discriminator} - Server Info`)
        .addFields(
          { name: `${EMOJIS.INFO} | Joined `, value: joinedAt, inline: true },
          { name: `${EMOJIS.INFO} | Registered `, value: registeredAt, inline: true },
          { name: `${EMOJIS.KEY} | Roles `, value: roles, inline: true },
          { name: `${EMOJIS.KEY} | Key Permissions`, value: `\`\`\`${keyPerms}\`\`\``, inline: true }
        )
        .setFooter({ text: 'Page 1/2' });

      const connectedAccounts = Array.isArray(profileData.connected_accounts) ? profileData.connected_accounts : [];
      const bannerUrl = profileData.user?.banner 
        ? `https://cdn.discordapp.com/banners/${userId}/${profileData.user.banner}.png` 
        : 'None';

      const embedPage2 = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${EMOJIS.USER} ${userData.username}#${userData.discriminator} - User Info`)
        .setThumbnail(`https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.png`)
        .addFields(
          { name: `${EMOJIS.INFO} | ID `, value: userData.id, inline: false },
          { name: `${EMOJIS.PICTURE} | Avatar `, value: `[Link](https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.png)`, inline: false },
          { name: `${EMOJIS.PICTURE} | Banner `, value: bannerUrl, inline: false },
          { name: `${EMOJIS.INFO} | Global Name `, value: userData.global_name || 'None', inline: false },
          { name: `${EMOJIS.INFO} | Bio `, value: `||${profileData.user_profile?.bio || 'None'}||`, inline: false },
          { name: `${EMOJIS.INFO} | Connected Accounts `, value: connectedAccounts.length > 0 ? connectedAccounts.map(account => `${account.type}: \`${account.name}\``).join('\n') : 'None' }
        )
        .setFooter({ text: 'Page 2/2' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Previous')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('avatar')
            .setLabel(`Avatar`)
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('banner')
            .setLabel(`Banner`)
            .setEmoji('🖼️')
            .setStyle(ButtonStyle.Secondary)
        );

      const msg = await message.channel.send({ embeds: [embedPage1], components: [row] });

      const filter = i => i.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        await interaction.deferUpdate();

        if (interaction.customId === 'next') {
          await msg.edit({ embeds: [embedPage2] });
        } else if (interaction.customId === 'previous') {
          await msg.edit({ embeds: [embedPage1] });
        } else if (interaction.customId === 'avatar') {
          await interaction.followUp({ embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setDescription(`Avatar URL: https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.png`)], ephemeral: true });
        } else if (interaction.customId === 'banner') {
          await interaction.followUp({ embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setDescription(`Banner URL: ${bannerUrl}`)], ephemeral: true });
        }
      });

    } catch (error) {
      console.error('Error fetching user info:', error);
      return message.reply({ embeds: [new EmbedBuilder().setColor(EMBED_COLOR).setDescription('An error occurred while fetching user information. Please try again later.')] });
    }
  },
};
