import cron from 'node-cron';
import { waifuService } from './waifuService.js';
import { discordPoster } from './discordPoster.js';
import { logger } from './logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoPostScheduler {
  constructor() {
    this.task = null;
    this.dailyRankingTask = null;
    this.isRunning = false;
    this.isExecutingAutoPost = false;
    this.isExecutingDailyRanking = false;
    this.client = null;
  }

  async start(client) {
    try {
      if (this.isRunning) {
        logger.warn('Scheduler is already running');
        return;
      }

      this.client = client;

      // Load config to check for multi-channel setup
      const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Get configuration
      const interval = parseInt(process.env.AUTO_POST_INTERVAL) || 3600000; // Default 1 hour

      // Check if using multi-channel config or legacy single channel
      const usingMultiChannel = config.channels && config.channels.length > 0;
      
      if (!usingMultiChannel) {
        const targetChannelId = process.env.TARGET_CHANNEL_ID;
        if (!targetChannelId) {
          logger.error('TARGET_CHANNEL_ID not set. Cannot start auto-posting.');
          return;
        }
      }

      // Convert interval to cron expression
      const cronExpression = this.intervalToCron(interval);

      logger.info(`Starting auto-post scheduler with cron: ${cronExpression}`);
      if (usingMultiChannel) {
        const enabledChannels = config.channels.filter(c => c.enabled);
        logger.info(`Multi-channel mode: ${enabledChannels.length} channel(s) configured`);
      }

      this.task = cron.schedule(cronExpression, async () => {
        await this.executeAutoPost();
      });

      this.isRunning = true;
      logger.info('✅ Auto-post scheduler started');

    } catch (error) {
      logger.error('Error starting scheduler:', error);
      throw error;
    }
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.isRunning = false;
      logger.info('Auto-post scheduler stopped');
    }
  }

  intervalToCron(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    
    if (minutes < 60) {
      // Every X minutes
      return `*/${minutes} * * * *`;
    } else if (minutes < 1440) {
      // Every X hours
      const hours = Math.floor(minutes / 60);
      return `0 */${hours} * * *`;
    } else {
      // Daily at midnight
      return '0 0 * * *';
    }
  }

  async executeAutoPost() {
    if (this.isExecutingAutoPost) {
      logger.warn('Auto-post already in progress, skipping...');
      return;
    }

    try {
      this.isExecutingAutoPost = true;
      logger.info('🤖 Executing auto-post...');

      // Load config
      const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Check if using multi-channel config
      const usingMultiChannel = config.channels && config.channels.length > 0;

      if (usingMultiChannel) {
        // Multi-channel mode: post to each enabled channel
        const enabledChannels = config.channels.filter(c => c.enabled);
        
        for (const channelConfig of enabledChannels) {
          try {
            await this.postToChannel(channelConfig, config);
          } catch (error) {
            logger.error(`Error posting to channel ${channelConfig.name}:`, error);
          }
          
          // Wait between channels to avoid rate limiting
          if (enabledChannels.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      } else {
        // Legacy single channel mode
        const targetChannelId = process.env.TARGET_CHANNEL_ID;
        if (!targetChannelId) {
          logger.error('TARGET_CHANNEL_ID not set');
          return;
        }

        await this.postToChannel({
          id: targetChannelId,
          tags: process.env.DEFAULT_TAGS?.split(',') || config.defaultTags || ['illustration'],
          nsfwFilter: process.env.NSFW_FILTER === 'true',
          allowAI: process.env.ALLOW_AI_GENERATED !== 'false',
          minViews: parseInt(process.env.MIN_VIEWS || '0'),
          minBookmarks: parseInt(process.env.MIN_BOOKMARKS || '0'),
          blacklistedTags: process.env.BLACKLISTED_TAGS?.split(',').map(t => t.trim()).filter(t => t) || [],
          whitelistedTags: process.env.WHITELISTED_TAGS?.split(',').map(t => t.trim()).filter(t => t) || []
        }, config);
      }

    } catch (error) {
      logger.error('Error in auto-post execution:', error);
    } finally {
      this.isExecutingAutoPost = false;
    }
  }

  async postToChannel(channelConfig, config) {
    const channel = await this.client.channels.fetch(channelConfig.id);
    if (!channel) {
      logger.error(`Could not find channel: ${channelConfig.id}`);
      return;
    }

    logger.info(`📤 Posting to ${channelConfig.name || channel.name} (NSFW: ${!channelConfig.nsfwFilter})`);

    // Get batch size
    const batchSize = parseInt(process.env.BATCH_POST_COUNT) || config.batchPostCount || 5;

    // Use waifu.pics as image source
    logger.info(`🎨 Using waifu.pics as image source`);

    // Get category from randomWhitelistTags or use default
    let category = 'waifu';
    if (channelConfig.randomWhitelistTags && channelConfig.randomWhitelistTags.length > 0) {
      const randomIndex = Math.floor(Math.random() * channelConfig.randomWhitelistTags.length);
      category = channelConfig.randomWhitelistTags[randomIndex];
      logger.info(`🎲 Random category selected: "${category}"`);
    }

    // Fetch images from waifu.pics
    const images = await waifuService.getMultipleImages(
      category,
      channelConfig.nsfwOnly,
      batchSize
    );

    if (images.length === 0) {
      logger.warn(`No images found for ${channelConfig.name || channel.name}`);
      return;
    }

    // Format for Discord
    const illustInfos = images.map(img => waifuService.formatImageInfo(img));
    logger.info(`✅ Fetched ${illustInfos.length} images from waifu.pics`);

    // Post all images
    await discordPoster.postMultipleToChannel(channel, illustInfos, 3000);

    logger.info(`✅ Auto-posted ${illustInfos.length} illustrations to ${channel.name}`);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      hasTask: this.task !== null,
    };
  }
}

// Create and export singleton instance
export const autoPostScheduler = new AutoPostScheduler();
