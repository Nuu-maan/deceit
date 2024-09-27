const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
        const channelId = '1279636071981776976';
        const channel = member.guild.channels.cache.get(channelId);

        // Check if channel exists
        if (!channel) {
            console.error(`Channel with ID ${channelId} not found in guild ${member.guild.id}.`);
            return;
        }

        // Check if the channel is a text channel
        if (channel.type !== 'GUILD_TEXT') {
            console.error(`Channel with ID ${channelId} is not a text channel.`);
            return;
        }

        const embed = new EmbedBuilder()
            .setDescription(`Chole Bhature or Golgappa? 🍲 Just you and me <3 <a:Chat:1281330306271416352>`)
            .setColor('#a9e6b7')
            .setAuthor({
                name: `Welcome to Delhi | Gaaliyon ki Awaaz`,
                iconURL: member.user.displayAvatarURL({ size: 64 })
            })
            .setFooter({ text: 'Enjoy your time with us!' });

        try {
            await channel.send({
                content: `<@${member.id}>`,
                embeds: [embed]
            });
            console.log(`Welcome message sent to ${member.user.tag} in channel ${channel.name}`);
        } catch (error) {
            console.error(`Failed to send welcome message: ${error.message}`);
        }
    }
};
