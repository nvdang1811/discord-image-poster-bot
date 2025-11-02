import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { autoPostScheduler } from './utils/scheduler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Collection to store commands
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  
  if ('data' in command.default && 'execute' in command.default) {
    client.commands.set(command.default.data.name, command.default);
    logger.info(`Loaded command: ${command.default.data.name}`);
  } else {
    logger.warn(`Command at ${filePath} is missing required "data" or "execute" property.`);
  }
}

// Ready event
client.once(Events.ClientReady, async (readyClient) => {
  logger.info(`✅ Bot is ready! Logged in as ${readyClient.user.tag}`);
  logger.info(`📊 Serving ${readyClient.guilds.cache.size} guild(s)`);

  // Start auto-post scheduler if enabled
  if (process.env.AUTO_POST_ENABLED === 'true') {
    try {
      await autoPostScheduler.start(client);
    } catch (error) {
      logger.error('Failed to start auto-post scheduler:', error);
    }
  }
});

// Message event for prefix commands
client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  const prefix = process.env.PREFIX || '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    logger.error(`Error executing command ${commandName}:`, error);
    await message.reply('There was an error executing that command!');
  }
});

// Error handling
client.on(Events.Error, (error) => {
  logger.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  logger.error('Failed to login to Discord:', error);
  process.exit(1);
});

export default client;
