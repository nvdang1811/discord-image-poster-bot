import { PermissionFlagsBits } from 'discord.js';
import { pixivService } from '../utils/pixivService.js';
import { discordPoster } from '../utils/discordPoster.js';
import { logger } from '../utils/logger.js';

export default {
  data: {
    name: 'pixivranking',
    description: 'Fetch and post top ranking images from Pixiv',
    usage: '!pixivranking [mode] [count]',
  },
  async execute(message, args, client) {
    try {
      // Parse arguments
      let mode = 'day';
      let count = 5;

      if (args.length > 0) {
        const validModes = ['day', 'week', 'month', 'day_male', 'day_female', 'week_rookie'];
        if (validModes.includes(args[0])) {
          mode = args[0];
          if (args.length > 1 && !isNaN(args[1])) {
            count = Math.min(parseInt(args[1]), 10);
          }
        } else if (!isNaN(args[0])) {
          count = Math.min(parseInt(args[0]), 10);
        }
      }

      await message.reply(`🏆 Fetching Pixiv ${mode} ranking (${count} images)...`);

      // Get ranking illustrations
      const illusts = await pixivService.getRankingIllustrations(mode, { limit: count });

      if (illusts.length === 0) {
        return message.reply(`❌ No ranking illustrations found for mode: **${mode}**`);
      }

      // Format illustration info
      const illustInfos = illusts.map(illust => 
        pixivService.formatIllustrationInfo(illust)
      );

      await message.reply(`✅ Found ${illustInfos.length} ranking illustration(s). Posting now...`);

      // Post to current channel
      const results = await discordPoster.postMultipleToChannel(
        message.channel,
        illustInfos,
        3000
      );

      const successCount = results.filter(r => r.success).length;
      logger.info(`Posted ${successCount}/${results.length} illustrations from ${mode} ranking`);

    } catch (error) {
      logger.error('Error in pixivranking command:', error);
      await message.reply('❌ An error occurred while fetching ranking images from Pixiv. Please try again later.');
    }
  },
};
