const { EmbedBuilder } = require('discord.js');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { EMBED_COLOR } = require('../../constants');

module.exports = {
  name: 'userinfo',
  aliases: ['ui'],
  description: 'Get user information by user ID or mention.',
  async execute(message, args) {
    const userId = message.mentions.users.first()?.id || message.author.id;

    try {
      // Fetch user data from the API
      const userResponse = await fetch(
        `https://dcdn.n0step.xyz/users/${userId}`,
      );
      const userData = await userResponse.json();

      // Fetch user profile data from the API
      const profileResponse = await fetch(
        `https://dcdn.n0step.xyz/profile/${userId}`,
      );
      const profileData = await profileResponse.json();

      const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.png`;
      const bannerUrl = profileData.user.banner
        ? `https://cdn.discordapp.com/banners/${userId}/${profileData.user.banner}.png`
        : 'None';

      const connectedAccounts =
        profileData.connected_accounts.length > 0
          ? profileData.connected_accounts
              .map((account) => `${account.type}: \`${account.name}\``)
              .join('\n')
          : 'None';

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`${userData.username}#${userData.discriminator}`)
        .setThumbnail(avatarUrl)
        .addFields(
          { name: 'ID', value: userData.id, inline: false },
          { name: 'Avatar', value: `[Link](${avatarUrl})`, inline: false },
          {
            name: 'Banner',
            value: bannerUrl !== 'None' ? `[Link](${bannerUrl})` : 'None',
            inline: false,
          },
          {
            name: 'Global Name',
            value: userData.global_name || 'None',
            inline: false,
          },
          {
            name: 'Bio',
            value: `||${profileData.user_profile.bio}||` || 'None',
            inline: false,
          },
        )
        .addFields({ name: 'Connected Accounts', value: connectedAccounts })
        .setFooter({
          text: 'Powered by n0step.xyz',
          iconURL:
            'https://cdn.discordapp.com/avatars/853620650592567304/1fa5daa2aaa94a01b3a656d178122e3c.webp?size=1024&animated=true&width=0&height=240',
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching user info:', error);
      return message.reply(
        'An error occurred while fetching user information. Please try again later.',
      );
    }
  },
};
