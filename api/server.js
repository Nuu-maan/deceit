require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const app = express();
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const commands = new Map();  // Ensure commands is defined at the top level

client.login(process.env.TOKEN);

// Recursive function to load commands from a directory and its subdirectories
function loadCommands(basePath) {
    fs.readdirSync(basePath).forEach(file => {
        const filePath = path.join(basePath, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            loadCommands(filePath);  // Recursive call for directories
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                commands.set(command.name, command);
                if (command.aliases) {
                    command.aliases.forEach(alias => commands.set(alias, command));
                }
                console.log(`Loaded command: ${command.name}`);
            } catch (error) {
                console.error(`Error loading command at ${filePath}: ${error}`);
            }
        }
    });
}

client.once('ready', () => {
    console.log('Bot is ready!');
    loadCommands(path.join(__dirname, '..', 'commands'));  // Start loading from the root commands directory
    console.log(`Total commands loaded: ${commands.size}`);
});

app.get('/api/bot-info', (req, res) => {
    const botInfo = {
        totalCommands: commands.size,
        totalUsers: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        totalGuilds: client.guilds.cache.size
    };
    res.json(botInfo);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
