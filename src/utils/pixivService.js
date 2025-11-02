import PixivApi from 'pixiv-api-client';
import dotenv from 'dotenv';
import { logger } from './logger.js';
import { imageHistory } from './imageHistory.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PixivService {
  constructor() {
    this.client = null;
    this.isAuthenticated = false;
    this.rateLimitDelay = 1000; // 1 second between requests
    this.lastRequestTime = 0;
  }

  async initialize() {
    try {
      if (!process.env.PIXIV_REFRESH_TOKEN) {
        logger.error('PIXIV_REFRESH_TOKEN not found in environment variables');
        throw new Error('Pixiv refresh token is required');
      }

      this.client = new PixivApi();

      // Authenticate with refresh token
      const authInfo = await this.client.refreshAccessToken(process.env.PIXIV_REFRESH_TOKEN);
      this.isAuthenticated = true;
      logger.info('✅ Successfully authenticated with Pixiv');
      logger.debug('Access token expires in:', authInfo.expires_in);
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize Pixiv client:', error.message || error);
      this.isAuthenticated = false;
      throw error;
    }
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async searchIllustrations(tags, options = {}) {
    try {
      if (!this.isAuthenticated) {
        await this.initialize();
      }

      await this.waitForRateLimit();

      const {
        limit = 30,
        sort = 'date_desc',
        searchTarget = 'partial_match_for_tags',
        channelFilters = null,
        startOffset = 0, // NEW: Starting offset for pagination
      } = options;

      logger.info(`Searching Pixiv for tags: ${tags} (sort: ${sort}, offset: ${startOffset})`);
      
      // Collect illustrations from multiple pages if needed
      let allIllusts = [];
      let nextUrl = null;
      let pageCount = 0;
      const maxPages = 5; // Fetch up to 5 pages to find enough unique images
      
      // Skip to the starting offset if specified
      if (startOffset > 0) {
        logger.info(`Skipping to offset ${startOffset}...`);
        let result = await this.client.searchIllust(tags, {
          sort,
          search_target: searchTarget,
        });
        
        for (let i = 0; i < startOffset && result.next_url; i++) {
          await this.waitForRateLimit();
          result = await this.client.requestUrl(result.next_url);
          logger.info(`Skipped page ${i + 1}/${startOffset}`);
        }
        
        nextUrl = result.next_url;
      }
      
      do {
        pageCount++;
        
        const result = nextUrl 
          ? await this.client.requestUrl(nextUrl)
          : await this.client.searchIllust(tags, {
              sort,
              search_target: searchTarget,
            });

        if (!result.illusts || result.illusts.length === 0) {
          break;
        }

        allIllusts.push(...result.illusts);
        nextUrl = result.next_url;
        
        // Filter and dedupe after each page
        const contentFiltered = allIllusts.filter(illust => 
          this.filterIllustration(illust, channelFilters)
        );
        const deduped = imageHistory.filterDuplicates(contentFiltered);
        const duplicatesRemoved = contentFiltered.length - deduped.length;
        
        logger.info(`Page ${pageCount}: Collected ${deduped.length}/${limit} unique images (${allIllusts.length} fetched, ${allIllusts.length - contentFiltered.length} filtered, ${duplicatesRemoved} duplicates)`);
        
        // If we have enough unique images, stop fetching
        if (deduped.length >= limit) {
          const limited = deduped.slice(0, limit);
          logger.info(`Found ${limited.length} illustrations matching criteria`);
          return limited;
        }
        
        // Wait between pages to avoid rate limiting
        if (nextUrl && pageCount < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.waitForRateLimit();
        }
        
      } while (nextUrl && pageCount < maxPages);

      // Return whatever we collected
      const contentFiltered = allIllusts.filter(illust => 
        this.filterIllustration(illust, channelFilters)
      );
      const deduped = imageHistory.filterDuplicates(contentFiltered);
      const limited = deduped.slice(0, limit);

      logger.info(`Found ${limited.length} illustrations after ${pageCount} pages (${allIllusts.length} total fetched)`);
      return limited;

    } catch (error) {
      logger.error('Error searching Pixiv illustrations:', error.message || error);
      throw error;
    }
  }

  async getRankingIllustrations(mode = 'day', options = {}) {
    try {
      if (!this.isAuthenticated) {
        await this.initialize();
      }

      await this.waitForRateLimit();

      const { limit = 30, channelFilters = null } = options;

      logger.info(`Fetching Pixiv ranking: ${mode}`);
      
      const result = await this.client.illustRanking({ mode });

      if (!result.illusts || result.illusts.length === 0) {
        logger.warn('No ranking results found');
        return [];
      }

      // Filter by content/tags, then remove duplicates
      const contentFiltered = result.illusts.filter(illust => this.filterIllustration(illust, channelFilters));
      const deduped = imageHistory.filterDuplicates(contentFiltered);
      const limited = deduped.slice(0, limit);

      logger.info(`Found ${limited.length} ranking illustrations (${result.illusts.length} total, ${result.illusts.length - limited.length} filtered)`);
      return limited;

    } catch (error) {
      logger.error('Error fetching Pixiv rankings:', error);
      throw error;
    }
  }

  filterIllustration(illust, channelFilters = null) {
    // Filter out ugoira (animated)
    if (illust.type === 'ugoira') {
      logger.debug(`Filtered ugoira: ${illust.id}`);
      return false;
    }
    
    // Use channel-specific filters if provided, otherwise use env vars
    const nsfwFilter = channelFilters?.nsfwFilter ?? (process.env.NSFW_FILTER === 'true');
    const nsfwOnly = channelFilters?.nsfwOnly ?? false; // NEW: NSFW-only mode
    const allowAI = channelFilters?.allowAI ?? (process.env.ALLOW_AI_GENERATED !== 'false');
    const minViews = channelFilters?.minViews ?? parseInt(process.env.MIN_VIEWS || '0');
    const minBookmarks = channelFilters?.minBookmarks ?? parseInt(process.env.MIN_BOOKMARKS || '0');
    const blacklistedTags = channelFilters?.blacklistedTags ?? 
      (process.env.BLACKLISTED_TAGS?.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) || []);
    const whitelistedTags = channelFilters?.whitelistedTags ?? 
      (process.env.WHITELISTED_TAGS?.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0) || []);
    
    // Log filter criteria for debugging
    logger.debug(`Checking ${illust.id}: views=${illust.total_view}, bookmarks=${illust.total_bookmarks}, minViews=${minViews}, minBookmarks=${minBookmarks}`);
    
    // STRICT MODE: Enforce exclusive content types
    if (nsfwOnly) {
      // NSFW-only mode: MUST have x_restrict > 0 (be marked as NSFW by Pixiv)
      if (illust.x_restrict === 0) {
        logger.debug(`Filtered SFW artwork in NSFW-only channel: ${illust.id}`);
        return false;
      }
    } else if (nsfwFilter) {
      // SFW mode: MUST have x_restrict = 0 (be marked as safe by Pixiv)
      if (illust.x_restrict > 0) {
        logger.debug(`Filtered NSFW artwork in SFW channel: ${illust.id}`);
        return false;
      }
      
      // Additional safety: check for NSFW-related tags
      const illustTags = illust.tags.map(tag => tag.name.toLowerCase());
      const nsfwIndicators = [
        'nsfw', 'r-18', 'r18', '18+', 'adult', 'ecchi', 'エッチ',
        'hentai', 'エロ', 'ero', 'lewd', 'sexy', 'nude', 'naked'
      ];
      
      if (illustTags.some(tag => nsfwIndicators.some(indicator => tag.includes(indicator)))) {
        logger.debug(`Filtered artwork with NSFW tags in SFW channel: ${illust.id}`);
        return false;
      }
    }
    
    // Filter AI-generated art
    if (!allowAI) {
      const tags = illust.tags.map(tag => tag.name.toLowerCase());
      const aiTags = ['ai', 'ai-generated', 'ai生成', 'ai絵', 'stablediffusion', 'midjourney', 'novelai'];
      if (tags.some(tag => aiTags.some(aiTag => tag.includes(aiTag)))) {
        logger.debug(`Filtered AI-generated artwork: ${illust.id}`);
        return false;
      }
    }
    
    // Filter by minimum views
    if (minViews > 0 && illust.total_view < minViews) {
      logger.debug(`Filtered low-view artwork: ${illust.id} (${illust.total_view} views < ${minViews})`);
      return false;
    }
    
    // Filter by minimum bookmarks
    if (minBookmarks > 0 && illust.total_bookmarks < minBookmarks) {
      logger.debug(`Filtered low-bookmark artwork: ${illust.id} (${illust.total_bookmarks} bookmarks < ${minBookmarks})`);
      return false;
    }
    
    // Blacklist tags
    if (blacklistedTags.length > 0) {
      const illustTags = illust.tags.map(tag => tag.name.toLowerCase());
      if (illustTags.some(tag => blacklistedTags.includes(tag))) {
        logger.debug(`Filtered blacklisted artwork: ${illust.id}`);
        return false;
      }
    }
    
    // Whitelist tags (if specified, only allow illustrations with these tags)
    if (whitelistedTags.length > 0) {
      const illustTags = illust.tags.map(tag => tag.name.toLowerCase());
      const hasWhitelistedTag = illustTags.some(tag => 
        whitelistedTags.some(whiteTag => tag.includes(whiteTag.toLowerCase()))
      );
      if (!hasWhitelistedTag) {
        logger.debug(`Filtered non-whitelisted artwork: ${illust.id} (tags: ${illustTags.slice(0, 5).join(', ')}... | looking for: ${whitelistedTags.join(', ')})`);
        return false;
      }
    }
    
    return true;
  }

  async getIllustrationDetail(illustId) {
    try {
      if (!this.isAuthenticated) {
        await this.initialize();
      }

      await this.waitForRateLimit();

      logger.info(`Fetching illustration detail: ${illustId}`);
      
      const result = await this.client.illustDetail(illustId);

      return result.illust;

    } catch (error) {
      logger.error(`Error fetching illustration detail for ${illustId}:`, error.message || error);
      throw error;
    }
  }

  getImageUrl(illust, quality = 'original') {
    if (quality === 'original' && illust.meta_single_page?.original_image_url) {
      return illust.meta_single_page.original_image_url;
    }
    
    if (quality === 'large' && illust.image_urls?.large) {
      return illust.image_urls.large;
    }

    if (illust.image_urls?.medium) {
      return illust.image_urls.medium;
    }

    return null;
  }

  formatIllustrationInfo(illust) {
    return {
      id: illust.id,
      title: illust.title,
      caption: illust.caption?.replace(/<[^>]*>/g, '') || 'No description',
      artist: {
        id: illust.user.id,
        name: illust.user.name,
        account: illust.user.account,
      },
      tags: illust.tags.map(tag => tag.name),
      url: `https://www.pixiv.net/artworks/${illust.id}`,
      imageUrl: this.getImageUrl(illust),
      createdAt: illust.create_date,
      totalBookmarks: illust.total_bookmarks,
      totalView: illust.total_view,
      isNsfw: illust.x_restrict > 0,
    };
  }
}

// Create and export a singleton instance
export const pixivService = new PixivService();
