const axios = require('axios');
const cheerio = require('cheerio');
const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        const instagramRegex = /https:\/\/www\.instagram\.com\/p\/([a-zA-Z0-9_\/?=-]+)/g;
        const match = instagramRegex.exec(message.content);
        
        if (match) {
            const instagramUrl = match[0];
            const apiUrl = `https://instagram-videos.vercel.app/api/video?postUrl=${instagramUrl}`;
            
            try {
                const response = await axios.get(apiUrl);
                if (response.data.status === 'success') {
                    const videoData = response.data.data;
                    const videoUrl = videoData.videoUrl;

                    const ddinstagramUrl = instagramUrl.replace("https://www.instagram.com", "https://www.ddinstagram.com");
                    const htmlResponse = await axios.get(ddinstagramUrl);
                    const $ = cheerio.load(htmlResponse.data);
                    
                    const username = $('meta[property="og:title"]').attr('content').split(' on ')[1] || 'Unknown'; 
                    const postDetails = $('meta[property="og:description"]').attr('content') || 'No Description Found';

                    const likesMatch = postDetails.match(/(\d[\d,]*)\s+likes/);
                    const commentsMatch = postDetails.match(/(\d[\d,]*)\s+comments/);
                    const likes = likesMatch ? likesMatch[1] : 'N/A';
                    const comments = commentsMatch ? commentsMatch[1] : 'N/A';
                    const caption = postDetails.match(/- (.+)/)?.[1] || 'No caption available';

                    const embed = new EmbedBuilder()
                        .setColor('#CE0071')
                        .setAuthor({ 
                            name: username, 
                            iconURL: 'https://cdn.discordapp.com/attachments/1283785090656239679/1291070630405345300/600px-Instagram_icon.png'
                        })
                        .setDescription(caption) 
                        .addFields(
                            { name: 'Likes', value: likes, inline: true },
                            { name: 'Comments', value: comments, inline: true },
                            { name: 'Watch Video', value: `[Watch video](${videoUrl})`, inline: true } 
                        )
                        .setTimestamp();

                    await message.delete(); 
                    await message.channel.send({ embeds: [embed] });

                    await message.channel.send({ content: `[⠀](${videoUrl})` });
                } else {
                    console.error('API response was not successful:', response.data);
                    message.channel.send('Could not retrieve video.');
                }
            } catch (error) {
                console.error('Error fetching video or post info:', error);
                message.channel.send('An error occurred while fetching the video or post info.');
            }
        }
    });
};
