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
const { PREFIX, EMBED_COLOR } = require('./constants');
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

  // Fetch and save server data
  fetchAndSaveServerData();
});

const fetchAndSaveServerData = () => {
  const serversData = [];

  client.guilds.cache.forEach((guild) => {
    serversData.push({
      serverID: guild.id,
      serverName: guild.name,
      memberCount: guild.memberCount,
    });
  });

  // Define the path to save data
  const dataDir = path.join(__dirname, 'sites');
  const dataPath = path.join(dataDir, 'data.json');

  // Create the 'sites' directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Read existing data if it exists
  let existingData = [];
  if (fs.existsSync(dataPath)) {
    existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  // Compare existing data with new data
  if (JSON.stringify(existingData) !== JSON.stringify(serversData)) {
    // Write data to JSON file
    fs.writeFileSync(dataPath, JSON.stringify(serversData, null, 2), 'utf-8');
    console.log('Server data saved to sites/data.json');
  } else {
    console.log('No changes detected in server data, skipping save.');
  }
};

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // Check if the message is a reply
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
          .setTitle('Hello there!')
          .setDescription(
            `Hey ${message.author}, thanks for pinging me!\n\nMy prefixes are: \`${PREFIX}\` & \`${customPrefix}\`\nServer ID: \`${message.guild.id}\`\nWebsite: [Visit my site](https://deceit.site)`,
          )
          .setFooter({
            text: 'Type ,,help for assistance!',
            iconURL: client.user.displayAvatarURL(),
          })
          .setTimestamp();

        // Create buttons
        const buttonRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Support Server')
            .setURL('https://discord.gg/MscCWUP8') // Replace with your support server link
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Visit Site')
            .setURL('https://deceit.site') // Replace with your site link
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Invite Bot')
            .setURL(
              'https://discord.com/oauth2/authorize?client_id=1272138809110433853&permissions=137941486839&scope=bot',
            ) // Replace with your bot invite link
            .setStyle(ButtonStyle.Link),
        );

        return message.channel.send({
          embeds: [embed],
          components: [buttonRow],
        }); // Send embed with buttons
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
