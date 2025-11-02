import axios from 'axios';
import { logger } from './logger.js';

class WaifuService {
  constructor() {
    this.baseUrl = 'https://api.waifu.pics';
    this.categories = {
      sfw: ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'],
      nsfw: ['waifu', 'neko', 'trap', 'blowjob']
    };
  }

  /**
   * Get random anime images
   * @param {string} category - Category (e.g., 'waifu', 'neko')
   * @param {boolean} nsfw - Whether to get NSFW content
   * @param {number} count - Number of images to fetch (1-30)
   * @returns {Promise<Array>} Array of image URLs
   */
  async getRandomImages(category = 'waifu', nsfw = false, count = 1) {
    try {
      const type = nsfw ? 'nsfw' : 'sfw';
      const validCategories = this.categories[type];
      
      if (!validCategories.includes(category)) {
        logger.warn(`Invalid category "${category}" for ${type}. Using "waifu" instead.`);
        category = 'waifu';
      }

      logger.info(`Fetching ${count} ${type} ${category} images from waifu.pics`);

      const images = [];
      
      // Fetch images (waifu.pics returns one at a time)
      for (let i = 0; i < count; i++) {
        const response = await axios.get(`${this.baseUrl}/${type}/${category}`);
        
        if (response.data && response.data.url) {
          const url = response.data.url;
          
          // Skip GIF files
          if (url.toLowerCase().endsWith('.gif')) {
            logger.debug(`Skipping GIF: ${url}`);
            i--; // Don't count this iteration
            continue;
          }
          
          images.push({
            url: url,
            id: `waifu_${Date.now()}_${i}`,
            category: category,
            nsfw: nsfw,
            source: 'waifu.pics'
          });
        }
        
        // Small delay between requests
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      logger.info(`Fetched ${images.length} images from waifu.pics`);
      return images;

    } catch (error) {
      logger.error('Error fetching from waifu.pics:', error.message);
      throw error;
    }
  }

  /**
   * Get multiple random images at once
   * @param {string} category - Category
   * @param {boolean} nsfw - NSFW flag
   * @param {number} count - Number of images (max 30)
   * @returns {Promise<Array>} Array of image URLs
   */
  async getMultipleImages(category = 'waifu', nsfw = false, count = 5) {
    try {
      const type = nsfw ? 'nsfw' : 'sfw';
      
      logger.info(`Fetching ${count} ${type} ${category} images (bulk)`);

      // Request more images to account for GIF filtering (request 2x to be safe)
      const requestCount = Math.min(count * 2, 30);
      
      const response = await axios.post(`${this.baseUrl}/many/${type}/${category}`, {
        exclude: []
      }, {
        params: { count: requestCount }
      });

      if (response.data && response.data.files) {
        // Filter out GIF files
        const filteredUrls = response.data.files.filter(url => {
          const isGif = url.toLowerCase().endsWith('.gif');
          if (isGif) {
            logger.debug(`Skipping GIF: ${url}`);
          }
          return !isGif;
        });

        // Take only the requested count
        const limitedUrls = filteredUrls.slice(0, count);

        const images = limitedUrls.map((url, index) => ({
          url: url,
          id: `waifu_${Date.now()}_${index}`,
          category: category,
          nsfw: nsfw,
          source: 'waifu.pics'
        }));

        logger.info(`Fetched ${images.length} images (filtered ${response.data.files.length - filteredUrls.length} GIFs from ${response.data.files.length} total)`);
        return images;
      }

      return [];

    } catch (error) {
      logger.warn('Bulk fetch failed, falling back to single requests:', error.message);
      return await this.getRandomImages(category, nsfw, count);
    }
  }

  /**
   * Format image info for Discord posting
   * @param {Object} image - Image object
   * @returns {Object} Formatted info
   */
  formatImageInfo(image) {
    return {
      id: image.id,
      title: `${image.category.charAt(0).toUpperCase() + image.category.slice(1)} Artwork`,
      url: image.url,
      category: image.category,
      imageUrl: image.url,
      thumbnailUrl: image.url,
      tags: [image.category, image.nsfw ? 'nsfw' : 'sfw', 'anime'],
      source: 'waifu.pics',
      isNSFW: image.nsfw
    };
  }

  /**
   * Get available categories
   * @param {boolean} nsfw - Get NSFW categories
   * @returns {Array<string>} Available categories
   */
  getCategories(nsfw = false) {
    return nsfw ? this.categories.nsfw : this.categories.sfw;
  }
}

// Create and export singleton instance
export const waifuService = new WaifuService();
