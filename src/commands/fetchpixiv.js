import { PermissionFlagsBits } from 'discord.js';
import { pixivService } from '../utils/pixivService.js';
import { discordPoster } from '../utils/discordPoster.js';
import { logger } from '../utils/logger.js';

export default {
  data: {
    name: 'fetchpixiv',
    description: 'Fetch and post images from Pixiv based on tags',
    usage: '!fetchpixiv <tags> [count]',
  },
  async execute(message, args, client) {
    try {
      // Check if tags are provided
      if (args.length === 0) {
        return message.reply('❌ Please provide tags to search for. Usage: `!fetchpixiv <tags> [count]`');
      }

      // Extract count from last argument if it's a number
      let count = 5;
      let tags = args.join(' ');

      const lastArg = args[args.length - 1];
      if (!isNaN(lastArg) && parseInt(lastArg) > 0) {
        count = Math.min(parseInt(lastArg), 10); // Max 10 images
        tags = args.slice(0, -1).join(' ');
      }

      await message.reply(`🔍 Searching Pixiv for: **${tags}** (${count} images)...`);

      // Search for illustrations
      const illusts = await pixivService.searchIllustrations(tags, { limit: count });

      if (illusts.length === 0) {
        return message.reply(`❌ No illustrations found for tags: **${tags}**`);
      }

      // Format illustration info
      const illustInfos = illusts.map(illust => 
        pixivService.formatIllustrationInfo(illust)
      );

      await message.reply(`✅ Found ${illustInfos.length} illustration(s). Posting now...`);

      // Post to current channel
      const results = await discordPoster.postMultipleToChannel(
        message.channel,
        illustInfos,
        3000 // 3 second delay between posts
      );

      const successCount = results.filter(r => r.success).length;
      logger.info(`Posted ${successCount}/${results.length} illustrations from search: ${tags}`);

    } catch (error) {
      logger.error('Error in fetchpixiv command:', error);
      await message.reply('❌ An error occurred while fetching images from Pixiv. Please try again later.');
    }
  },
};
