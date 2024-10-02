const fs = require('fs');
const path = require('path');

// Function to recursively read all command files
function getCommandFiles(dir) {
  const files = fs.readdirSync(dir);
  const commandData = {};

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.lstatSync(filePath);

    if (fileStat.isDirectory()) {
      // Recursively get command data from subdirectories
      const subCommandData = getCommandFiles(filePath);
      commandData[file] = subCommandData; // Use the folder name as category
    } else if (filePath.endsWith('.js')) {
      const command = require(filePath);
      const commandInfo = {
        name: command.name || 'Unnamed command',
        description: command.description || 'No description available',
        aliases: command.aliases ? command.aliases.join(', ') : 'none',
        requiredPermissions: command.requiredPermissions || [],
        usage: command.usage || 'No usage information',
      };
      
      if (!commandData.commands) {
        commandData.commands = [];
      }
      commandData.commands.push(commandInfo);
    }
  });

  return commandData;
}

// Main function to build the command data structure
function buildCommandStructure() {
  const commandsDir = path.join(__dirname, 'commands');
  const commandCategories = getCommandFiles(commandsDir);

  return commandCategories;
}

// Output the final data structure
const commandStructure = buildCommandStructure();
console.log(JSON.stringify(commandStructure, null, 2));
