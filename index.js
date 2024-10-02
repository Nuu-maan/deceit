require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Events,
  ActivityType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { PREFIX, EMBED_COLOR, EMOJIS } = require('./constants');
const db = require('./database/database');
const os = require('os');
const messageListener = require('./events/social-embed-fixer/instagram')

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

messageListener(client);

const fetchAndSaveServerData = () => {
  const serversData = [];

  client.guilds.cache.forEach((guild) => {
    serversData.push({
      serverID: guild.id,
      serverName: guild.name,
      memberCount: guild.memberCount,
    });
  });

  const dataDir = path.join(__dirname, 'sites');
  const dataPath = path.join(dataDir, 'data.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  let existingData = [];
  if (fs.existsSync(dataPath)) {
    existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  if (JSON.stringify(existingData) !== JSON.stringify(serversData)) {
    fs.writeFileSync(dataPath, JSON.stringify(serversData, null, 2), 'utf-8');
    console.log('Server data saved to sites/data.json');
  } else {
    console.log('No changes detected in server data, skipping save.');
  }
};

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Set bot presence
  client.user.setPresence({
    activities: [
      {
        name: '🔗 discord.gg/deceitbot', // Add your emoji and text here
        type: ActivityType.Custom, // Custom type to show text only
      },
    ],
    status: 'online',
  });

  // Diagnostic checks
  runDiagnostics();

  // Fetch and save server data
  fetchAndSaveServerData();
});

// Diagnostic checks
const runDiagnostics = () => {
  console.log('Running diagnostics...');

  // Check WebSocket ping
  const wsPing = client.ws.ping;
  if (wsPing >= 0) {
    console.log(`WebSocket Ping: ${wsPing}ms`);
  } else {
    console.error('WebSocket not connected.');
  }

  // Check CPU and memory usage
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory Usage: ${memoryUsage.toFixed(2)} MB`);

  const cpuUsage = os.loadavg()[0];
  console.log(`CPU Load: ${cpuUsage.toFixed(2)}`);

  // Check all commands are loaded
  if (commands.size > 0) {
    console.log(`Commands Loaded: ${commands.size}`);
  } else {
    console.error('No commands found. Check the commands directory.');
  }

  // Shard check (if sharding is enabled)
  if (client.shard) {
    console.log(`Shards: ${client.shard.count} shards active.`);
  } else {
    console.log('Sharding not enabled.');
  }

  // Check guild cache
  if (client.guilds.cache.size > 0) {
    console.log(`Connected to ${client.guilds.cache.size} guilds.`);
  } else {
    console.error('Not connected to any guilds.');
  }
};

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user) && !message.reference) {
    const serverId = message.guild.id;
    let customPrefix = 'null';

    db.get(
      'SELECT prefix FROM prefixes WHERE server_id = ?',
      [serverId],
      async (err, row) => {
        if (err) {
          console.error('Error fetching prefix:', err);
          return;
        }

        if (row) {
          customPrefix = row.prefix;
        }

        const embed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setDescription(
            `prefixes: \`${PREFIX}\` \`${customPrefix}\`. try \`,,help\` for more info`,
          );

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
            .setURL(
              'https://discord.com/oauth2/authorize?client_id=1272138809110433853',
            )
            .setStyle(ButtonStyle.Link),
        );

        return message.reply({
          embeds: [embed],
          components: [buttonRow],
          allowedMentions: { repliedUser: false }, // Prevent ping
        });
      },
    );
  }

  const serverId = message.guild.id;
  let customPrefix = PREFIX;

  db.get(
    'SELECT prefix FROM prefixes WHERE server_id = ?',
    [serverId],
    async (err, row) => {
      if (err) {
        console.error('Error fetching prefix:', err);
        return;
      }

      if (row) {
        customPrefix = row.prefix;
      }

      const prefixUsed = message.content.startsWith(PREFIX)
        ? PREFIX
        : message.content.startsWith(customPrefix)
        ? customPrefix
        : null;

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
    },
  );
});

client.login(process.env.DISCORD_TOKEN);
