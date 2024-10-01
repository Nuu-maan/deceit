const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { EMBED_COLOR } = require('../../constants'); 

module.exports = {
    name: 'help',
    description: 'Shows the list of commands with pagination.',
    async execute(interaction) {
      const user = interaction.user || interaction.author;
  
      if (!user) {
        return console.error('User object is undefined.');
      }
  
      const commandsDir = path.join(__dirname, '../../commands');
      const categories = fs.readdirSync(commandsDir).filter((folder) => folder !== 'bot_admin'); 
  
      let currentPage = 0;
      const totalPages = categories.length + 1; 
  
      const homeEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle('Help Menu')
        .setDescription(`Welcome to the help menu. We have **${categories.length}** categories of commands.\n\nUse the dropdown below to navigate through different categories.`)
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setFooter({ text: `Page 1/${totalPages}` });
  
      const categoryEmbeds = categories.map((category, index) => {
        const categoryPath = path.join(commandsDir, category);
        const commandFiles = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.js'));
        
        const commandList = commandFiles.map((file) => path.parse(file).name).join(', ');
        
        return new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
          .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
          .setDescription(`Commands:\n\`\`\`${commandList}\`\`\``)
          .setFooter({ text: `Page ${index + 2}/${totalPages}` }); 
      });
  
      const allEmbeds = [homeEmbed, ...categoryEmbeds]; 
  
      const menuOptions = [{ label: 'Home', value: 'home' }, ...categories.map((category) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
      }))];
  
      const menu = new StringSelectMenuBuilder()
        .setCustomId('help_menu')
        .setPlaceholder('Select a category')
        .addOptions(menuOptions);
  
      const row = new ActionRowBuilder().addComponents(menu);
  
      const message = await interaction.reply({
        embeds: [homeEmbed],
        components: [row],
        fetchReply: true,
      });
  
      const filter = (i) => i.user.id === user.id;
      const collector = message.createMessageComponentCollector({ filter, time: 60000 });
  
      collector.on('collect', (i) => {
        const selectedValue = i.values[0];
        currentPage = selectedValue === 'home' ? 0 : categories.indexOf(selectedValue) + 1; 
  
        i.update({
          embeds: [allEmbeds[currentPage]],
        });
      });
  
      collector.on('end', () => {
        message.edit({ components: [] }).catch(() => {});
      });
    },
  };
  