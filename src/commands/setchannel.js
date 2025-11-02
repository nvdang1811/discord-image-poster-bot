import { PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: {
    name: 'setchannel',
    description: 'Set the target channel for automatic Pixiv posts',
    usage: '!setchannel [channel_id or mention]',
  },
  async execute(message, args, client) {
    try {
      // Check permissions
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('❌ You need Administrator permission to use this command.');
      }

      let targetChannel;

      if (args.length === 0) {
        // Use current channel
        targetChannel = message.channel;
      } else if (message.mentions.channels.size > 0) {
        // Use mentioned channel
        targetChannel = message.mentions.channels.first();
      } else {
        // Try to get channel by ID
        try {
          targetChannel = await client.channels.fetch(args[0]);
        } catch (error) {
          return message.reply('❌ Invalid channel ID or mention.');
        }
      }

      if (!targetChannel) {
        return message.reply('❌ Could not find the specified channel.');
      }

      // Check if bot has permissions in target channel
      if (!targetChannel.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) {
        return message.reply(`❌ I don't have permission to send messages in ${targetChannel}.`);
      }

      // Update .env file
      const envPath = path.join(__dirname, '..', '..', '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update or add TARGET_CHANNEL_ID
      if (envContent.includes('TARGET_CHANNEL_ID=')) {
        envContent = envContent.replace(
          /TARGET_CHANNEL_ID=.*/,
          `TARGET_CHANNEL_ID=${targetChannel.id}`
        );
      } else {
        envContent += `\nTARGET_CHANNEL_ID=${targetChannel.id}`;
      }

      fs.writeFileSync(envPath, envContent);

      // Update process.env
      process.env.TARGET_CHANNEL_ID = targetChannel.id;

      logger.info(`Target channel set to: ${targetChannel.name} (${targetChannel.id})`);
      await message.reply(`✅ Target channel set to: ${targetChannel}`);

    } catch (error) {
      logger.error('Error in setchannel command:', error);
      await message.reply('❌ An error occurred while setting the channel.');
    }
  },
};
