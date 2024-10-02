require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const commands = new Map();

client.login(process.env.TOKEN);

function loadCommands(basePath) {
  fs.readdirSync(basePath).forEach((file) => {
    const filePath = path.join(basePath, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      loadCommands(filePath);
    } else if (file.endsWith('.js')) {
      try {
        const command = require(filePath);
        commands.set(command.name, command);
      } catch (error) {
        console.error(`Error loading command at ${filePath}: ${error}`);
      }
    }
  });
}

client.once('ready', () => {
  loadCommands(path.join(__dirname, '..', 'commands'));
});

app.use(helmet());
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/', apiLimiter);

app.get('/api/bot-info', (req, res) => {
  const botInfo = {
    totalCommands: commands.size,
    totalUsers: client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0,
    ),
    totalGuilds: client.guilds.cache.size,
  };
  res.json(botInfo);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
});

process.on('SIGINT', () => {
  client.destroy();
  process.exit();
});

process.on('SIGTERM', () => {
  client.destroy();
  process.exit();
});
