require('dotenv').config();
const { Client, GatewayIntentBits, Events, ActivityType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { PREFIX, EMBED_COLOR, EMOJIS } = require('./constants'); 
const db = require('./database/database'); 

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

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

fs.readdirSync(path.join(__dirname, 'commands')).forEach((dir) => {
  if (fs.statSync(path.join(__dirname, 'commands', dir)).isDirectory()) {
    loadCommands(dir);
  }
});

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
  if (message.mentions.has(client.user)) {
    const serverId = message.guild.id;
    let customPrefix = 'null'; 

    db.get('SELECT prefix FROM prefixes WHERE server_id = ?', [serverId], async (err, row) => {
      if (err) {
        console.error('Error fetching prefix:', err);
        return; 
      }
      
      if (row) {
        customPrefix = row.prefix; 
      }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle('Hello there!')
        .setDescription(`Hey ${message.author}, thanks for pinging me!\n\nMy prefixes are: \`${PREFIX}\` & \`${customPrefix}\`\nServer ID: \`${message.guild.id}\`\nWebsite: [Visit my site](https://deceit.site)`)
        .setFooter({ 
          text: 'type ,,help for assistance!', 
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    });
  }

  const serverId = message.guild.id;
  let customPrefix = PREFIX;

  db.get('SELECT prefix FROM prefixes WHERE server_id = ?', [serverId], async (err, row) => {
    if (err) {
      console.error('Error fetching prefix:', err);
      return; 
    }
    
    if (row) {
      customPrefix = row.prefix; 
    }

    const prefixUsed = message.content.startsWith(PREFIX) ? PREFIX : 
                       message.content.startsWith(customPrefix) ? customPrefix : null;

    if (!prefixUsed) return;

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

client.login(process.env.DISCORD_TOKEN);
