require('dotenv').config();

const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { PREFIX } = require('./constants');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildPresences, // Optional, for tracking presence updates
    GatewayIntentBits.GuildMembers, // For managing members
  ],
});

// Load commands
const commands = new Map();
const loadCommands = (dir) => {
  const commandsPath = path.join(__dirname, 'commands', dir);
  fs.readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => {
      const command = require(path.join(commandsPath, file));
      commands.set(command.name, command);
      if (command.aliases) {
        command.aliases.forEach((alias) => commands.set(alias, command));
      }
    });
};

// Load commands from subdirectories
fs.readdirSync(path.join(__dirname, 'commands')).forEach((dir) => {
  if (fs.statSync(path.join(__dirname, 'commands', dir)).isDirectory()) {
    loadCommands(dir);
  }
});

// Event handler when the bot is ready
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activities: [
      {
        name: '.gg/side', // Set the bot's activity
        type: ActivityType.Playing, // Or use ActivityType.Streaming, ActivityType.Listening, ActivityType.Watching as needed
      },
    ],
    status: 'online', // Options: 'online', 'idle', 'dnd', 'invisible'
  });
});

// Event handler for incoming messages
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  // Respond to mentions
  if (message.mentions.has(client.user)) {
    // Check if the message is a reply
    if (message.reference) return;

    // Check if the message contains only the bot mention
    const mentionPattern = new RegExp(`<@!?${message.client.user.id}>`);
    if (mentionPattern.test(message.content.trim()) && !message.content.trim().match(/\s/)) {
      return message.reply({ content: `prefixes: \`${PREFIX}\``, allowedMentions: { repliedUser: false } });
    } else {
      return;
    }
  }

  // Ignore messages without the prefix
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = commands.get(commandName);

  if (command) {
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error trying to execute that command.'); // Use reply here for errors
    }
  }
});

// Log in to Discord with the app's token
client.login(process.env.DISCORD_TOKEN);
