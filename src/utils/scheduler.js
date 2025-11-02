import cron from 'node-cron';
import { pixivService } from './pixivService.js';
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

      // Schedule daily ranking post if enabled
      if (config.dailyRanking && config.dailyRanking.enabled) {
        const [hours, minutes] = config.dailyRanking.time.split(':');
        const rankingCron = `${minutes} ${hours} * * *`;
        
        this.dailyRankingTask = cron.schedule(rankingCron, async () => {
          await this.executeDailyRanking();
        });

        logger.info(`✅ Daily ranking scheduler started (${config.dailyRanking.time} every day)`);
      } else {
        logger.info('ℹ️ Daily ranking is disabled in config');
      }

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
    if (this.dailyRankingTask) {
      this.dailyRankingTask.stop();
      this.dailyRankingTask = null;
      logger.info('Daily ranking scheduler stopped');
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

    // Use channel-specific search query if available, otherwise fallback to tags
    let searchTags = channelConfig.searchQuery || 
      (Array.isArray(channelConfig.tags) 
        ? channelConfig.tags.join(' ') 
        : channelConfig.tags || 'illustration');

    // Randomly select one tag from randomWhitelistTags if available and ADD it to search
    let activeWhitelistTag = null;
    if (channelConfig.randomWhitelistTags && channelConfig.randomWhitelistTags.length > 0) {
      const randomIndex = Math.floor(Math.random() * channelConfig.randomWhitelistTags.length);
      activeWhitelistTag = channelConfig.randomWhitelistTags[randomIndex];
      searchTags = `${searchTags} ${activeWhitelistTag}`;
      logger.info(`🎲 Random theme tag selected: "${activeWhitelistTag}" (searching for: "${searchTags}")`);
    } else {
      logger.info(`🔍 Searching with base query: "${searchTags}"`);
    }

    // Create channel-specific filters WITHOUT whitelist requirement
    const channelFilters = {
      nsfwFilter: channelConfig.nsfwFilter,
      nsfwOnly: channelConfig.nsfwOnly || false,
      allowAI: channelConfig.allowAI,
      minViews: channelConfig.minViews,
      minBookmarks: channelConfig.minBookmarks,
      blacklistedTags: channelConfig.blacklistedTags,
      whitelistedTags: [] // Don't filter by whitelist, we added it to search query
    };

    // Generate random seed parameters for variety
    const sortMethods = ['popular_desc', 'date_desc', 'popular_male_desc', 'popular_female_desc'];
    const randomSort = sortMethods[Math.floor(Math.random() * sortMethods.length)];
    const randomOffset = Math.floor(Math.random() * 3); // Random offset: 0, 1, or 2 pages
    
    logger.info(`🎲 Random search params: sort=${randomSort}, offset=${randomOffset}`);

    // Fetch MORE than needed, then randomly select
    const fetchMultiplier = 3;
    const illusts = await pixivService.searchIllustrations(searchTags, { 
      limit: batchSize * fetchMultiplier,
      sort: randomSort,
      startOffset: randomOffset,
      channelFilters
    });

    if (illusts.length === 0) {
      logger.warn(`No new illustrations found for ${channelConfig.name || channel.name}`);
      return;
    }

    // Shuffle and take only what we need
    const shuffled = illusts.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, batchSize);
    
    logger.info(`Selected ${selected.length} random images from ${illusts.length} available`);

    // Format illustrations
    const illustInfos = selected.map(illust => pixivService.formatIllustrationInfo(illust));

    // Post all images
    await discordPoster.postMultipleToChannel(channel, illustInfos, 3000);

    logger.info(`✅ Auto-posted ${illustInfos.length} illustrations to ${channel.name}`);
  }

  async executeDailyRanking() {
    if (this.isExecutingDailyRanking) {
      logger.warn('Daily ranking already in progress, skipping...');
      return;
    }

    try {
      this.isExecutingDailyRanking = true;
      logger.info('🏆 Executing daily ranking post...');

      // Load config
      const configPath = path.join(__dirname, '..', '..', 'config', 'config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Check if using multi-channel config
      const usingMultiChannel = config.channels && config.channels.length > 0;

      if (usingMultiChannel) {
        const enabledChannels = config.channels.filter(c => c.enabled);
        
        for (const channelConfig of enabledChannels) {
          try {
            await this.postDailyRankingToChannel(channelConfig, config);
          } catch (error) {
            logger.error(`Error posting daily ranking to channel ${channelConfig.name}:`, error);
          }
          
          // Wait between channels to avoid rate limiting
          if (enabledChannels.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

    } catch (error) {
      logger.error('Error in daily ranking execution:', error);
    } finally {
      this.isExecutingDailyRanking = false;
    }
  }

  async postDailyRankingToChannel(channelConfig, config) {
    const channel = await this.client.channels.fetch(channelConfig.id);
    if (!channel) {
      logger.error(`Could not find channel: ${channelConfig.id}`);
      return;
    }

    logger.info(`🏆 Posting daily ranking to ${channelConfig.name || channel.name}`);

    // Determine ranking mode based on channel type
    const mode = channelConfig.nsfwOnly ? 'day_r18' : 'day';
    const rankingType = channelConfig.nsfwOnly ? 'NSFW' : 'SFW';

    logger.info(`Fetching ${rankingType} daily ranking (mode: ${mode})`);

    // Create channel-specific filters
    const channelFilters = {
      nsfwFilter: channelConfig.nsfwFilter,
      nsfwOnly: channelConfig.nsfwOnly || false,
      allowAI: channelConfig.allowAI,
      minViews: 0, // No view filtering for rankings
      minBookmarks: 0, // No bookmark filtering for rankings
      blacklistedTags: channelConfig.blacklistedTags,
      whitelistedTags: [] // No whitelist filtering for rankings
    };

    // Fetch top 10 from daily ranking
    const topCount = config.dailyRanking?.topCount || 10;
    const illusts = await pixivService.getRankingIllustrations(mode, { 
      limit: topCount,
      channelFilters
    });

    if (illusts.length === 0) {
      logger.warn(`No ranking illustrations found for ${channelConfig.name || channel.name}`);
      return;
    }

    logger.info(`Found ${illusts.length} ${rankingType} ranking images`);

    // Format illustrations
    const illustInfos = illusts.map(illust => pixivService.formatIllustrationInfo(illust));

    // Post with a special header message
    const headerEmbed = {
      color: 0xFFD700, // Gold color for rankings
      title: `🏆 Top ${rankingType} Illustrations of the Day`,
      description: `Here are today's top ${illusts.length} ${rankingType.toLowerCase()} illustrations from Pixiv!`,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Daily Ranking'
      }
    };

    await channel.send({ embeds: [headerEmbed], flags: 4096 }); // Suppress notifications
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Post all ranking images
    await discordPoster.postMultipleToChannel(channel, illustInfos, 3000);

    logger.info(`✅ Posted ${illustInfos.length} daily ranking illustrations to ${channel.name}`);
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
