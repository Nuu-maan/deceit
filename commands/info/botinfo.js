const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PREFIX, EMBED_COLOR } = require('../../constants');
const packageJson = require('../../package.json');
const { aliases } = require('./userinfo');

module.exports = {
  name: 'botinfo',
  aliases: ['bi'],
  description: 'displays information about the bot.',
  execute(message, args) {
    const { username } = message.client.user;
    const totalServers = message.client.guilds.cache.size;
    const totalUsers = message.client.users.cache.size;
    const botUptime = process.uptime();
    const botVersion = packageJson.version;

    const startTime = new Date(Date.now() - botUptime * 1000);

    // Add developer info at the top of the info text with a link to their profile
    const infoText = `
**__devs:__** [anish](https://discord.com/users/1247843122160074782) & [numan](https://discord.com/users/877082451850178642)
**name:** ${username}
**version:** v${botVersion}
**servers:** ${totalServers}
**users:** ${totalUsers}
**uptime:** <t:${Math.floor(startTime.getTime() / 1000)}:R>
`;

    // Create the button row
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('server')
        .setURL('https://discord.gg/deceitbot')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('site')
        .setURL('https://deceit.site')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('bot')
        .setURL('https://discord.com/oauth2/authorize?client_id=1272138809110433853')
        .setStyle(ButtonStyle.Link),
    );

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setThumbnail(message.client.user.displayAvatarURL())
      .setDescription(infoText);

    // Send the embed along with the button row
    message.channel.send({ embeds: [embed], components: [buttonRow] });
  },
};
