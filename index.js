require('dotenv').config();
const { Client, GatewayIntentBits, Events, ActivityType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { PREFIX, EMBED_COLOR, EMOJIS } = require('./constants'); // Corrected 'prefix' to 'PREFIX'
const db = require('./database/database'); // Update to match the new path

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
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
        name: ',,help',
        type: ActivityType.Playing,
      },
    ],
    status: 'online',
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // Check if the message is a direct mention of the bot
  if (message.mentions.has(client.user)) {
    const serverId = message.guild.id;
    let customPrefix = 'null'; // Default to 'null' if no custom prefix is found

    // Fetch the custom prefix from the database
    db.get('SELECT prefix FROM prefixes WHERE server_id = ?', [serverId], async (err, row) => {
      if (err) {
        console.error('Error fetching prefix:', err);
        return; // Exit if there was an error
      }
      
      if (row) {
        customPrefix = row.prefix; // Update customPrefix if found
      }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle('Hello there!')
        .setDescription(`Hey ${message.author}, thanks for pinging me!\n\nMy prefixes are: \`${PREFIX}\` & \`${customPrefix}\`\nServer ID: \`${message.guild.id}\`\nWebsite: [Visit my site](https://deceit.site)`)
        .setFooter({ 
          text: 'type ,,help for assistance!', 
          iconURL: client.user.displayAvatarURL() // Use bot's profile picture
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    });
  }

  // Command handling code
  const serverId = message.guild.id;
  let customPrefix = PREFIX;

  // Fetch the custom prefix from the database
  db.get('SELECT prefix FROM prefixes WHERE server_id = ?', [serverId], async (err, row) => {
    if (err) {
      console.error('Error fetching prefix:', err);
      return; // Exit if there was an error
    }
    
    if (row) {
      customPrefix = row.prefix; // Update customPrefix if found
    }

    const prefixUsed = message.content.startsWith(PREFIX) ? PREFIX : 
                       message.content.startsWith(customPrefix) ? customPrefix : null;

    if (!prefixUsed) return; // Exit if no valid prefix is used

    const args = message.content.slice(prefixUsed.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands.get(commandName);

    if (command) {
      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command.');
      }
    }
  });
});

// Log in to Discord with the app's token
client.login(process.env.DISCORD_TOKEN);
