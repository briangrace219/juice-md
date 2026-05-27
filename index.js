const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands from .md files instead of .js
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.md'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse frontmatter (--- metadata ---)
        const { data, content } = matter(fileContent);
        
        if (data.name && data.description) {
            // Convert the Markdown content into an executable function safely
            client.commands.set(data.name, {
                data: { name: data.name, description: data.description },
                // Execute the content as a simple reply
                execute: async (interaction) => {
                    await interaction.reply(content.trim());
                }
            });
            console.log(`Loaded .md command: ${data.name}`);
        }
    }
}

client.once('ready', () => {
    console.log(`Juice-MD Bot is online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply('An error occurred while executing that command.');
    }
});

client.login(process.env.TOKEN);
