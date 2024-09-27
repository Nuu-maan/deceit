const axios = require('axios');
const fs = require('fs');

const DISCORD_BOT_TOKEN = 'MTI3MjEzODgwOTExMDQzMzg1Mw.G4Y23r.dKGKPxXm9M60A7vQegUdTFrgPNcg54aRmY3Jv8'; // Replace with your bot token

async function fetchGuilds() {
    try {
        const response = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        // Log the response to see its structure
        console.log(response.data);

        // Process the guild data
        const guildsData = response.data.map(guild => ({
            serverID: guild.id,
            serverName: guild.name,
            memberCount: guild.approximate_member_count,
            creationDate: guild.created_at ? new Date(guild.created_at).toISOString() : 'Unknown', // Validate date
            region: guild.region || 'Unknown', // Discord no longer provides regions via API
            description: guild.description || 'No description available.', // May require additional fetching
        }));

        // Write to data.json
        fs.writeFileSync('data.json', JSON.stringify(guildsData, null, 2));
        console.log('Server data fetched and saved to data.json');
    } catch (error) {
        console.error('Error fetching guilds:', error);
    }
}

fetchGuilds();