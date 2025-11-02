import { PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { autoPostScheduler } from '../utils/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: {
    name: 'autopost',
    description: 'Enable or disable automatic Pixiv posting',
    usage: '!autopost <on|off>',
  },
  async execute(message, args, client) {
    try {
      // Check permissions
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('❌ You need Administrator permission to use this command.');
      }

      if (args.length === 0) {
        const currentState = process.env.AUTO_POST_ENABLED === 'true' ? 'enabled' : 'disabled';
        return message.reply(`ℹ️ Auto-posting is currently **${currentState}**. Use \`!autopost on\` or \`!autopost off\` to change.`);
      }

      const action = args[0].toLowerCase();

      if (action !== 'on' && action !== 'off') {
        return message.reply('❌ Invalid argument. Use `!autopost on` or `!autopost off`.');
      }

      const enable = action === 'on';

      // Check if target channel is set
      if (enable && !process.env.TARGET_CHANNEL_ID) {
        return message.reply('❌ Please set a target channel first using `!setchannel` command.');
      }

      // Update .env file
      const envPath = path.join(__dirname, '..', '..', '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (envContent.includes('AUTO_POST_ENABLED=')) {
        envContent = envContent.replace(
          /AUTO_POST_ENABLED=.*/,
          `AUTO_POST_ENABLED=${enable}`
        );
      } else {
        envContent += `\nAUTO_POST_ENABLED=${enable}`;
      }

      fs.writeFileSync(envPath, envContent);
      process.env.AUTO_POST_ENABLED = enable.toString();

      // Start or stop scheduler
      if (enable) {
        await autoPostScheduler.start(client);
        logger.info('Auto-posting enabled');
        await message.reply('✅ Auto-posting has been **enabled**. The bot will automatically post images to the configured channel.');
      } else {
        autoPostScheduler.stop();
        logger.info('Auto-posting disabled');
        await message.reply('✅ Auto-posting has been **disabled**.');
      }

    } catch (error) {
      logger.error('Error in autopost command:', error);
      await message.reply('❌ An error occurred while toggling auto-posting.');
    }
  },
};
