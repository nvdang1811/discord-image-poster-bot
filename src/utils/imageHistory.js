import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageHistory {
  constructor() {
    this.historyFile = path.join(__dirname, '..', '..', 'posted_images.json');
    this.postedImages = new Set();
    this.maxHistorySize = 1000; // Keep track of last 1000 images
    this.loadHistory();
  }

  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf8');
        const history = JSON.parse(data);
        this.postedImages = new Set(history.images || []);
        logger.info(`Loaded ${this.postedImages.size} posted images from history`);
      } else {
        logger.info('No image history found, starting fresh');
      }
    } catch (error) {
      logger.error('Error loading image history:', error);
      this.postedImages = new Set();
    }
  }

  saveHistory() {
    try {
      // Convert Set to Array, keep only the most recent entries
      const imagesArray = Array.from(this.postedImages);
      const recentImages = imagesArray.slice(-this.maxHistorySize);
      
      const data = {
        images: recentImages,
        lastUpdated: new Date().toISOString(),
      };
      
      fs.writeFileSync(this.historyFile, JSON.stringify(data, null, 2));
      logger.debug('Saved image history');
    } catch (error) {
      logger.error('Error saving image history:', error);
    }
  }

  hasBeenPosted(illustId) {
    return this.postedImages.has(String(illustId));
  }

  markAsPosted(illustId) {
    this.postedImages.add(String(illustId));
    
    // Trim history if it gets too large
    if (this.postedImages.size > this.maxHistorySize) {
      const imagesArray = Array.from(this.postedImages);
      this.postedImages = new Set(imagesArray.slice(-this.maxHistorySize));
    }
    
    this.saveHistory();
  }

  filterDuplicates(illusts) {
    const filtered = illusts.filter(illust => {
      const isDuplicate = this.hasBeenPosted(illust.id);
      if (isDuplicate) {
        logger.debug(`Filtered duplicate image: ${illust.id}`);
      }
      return !isDuplicate;
    });

    const duplicateCount = illusts.length - filtered.length;
    if (duplicateCount > 0) {
      logger.info(`Filtered ${duplicateCount} duplicate image(s)`);
    }

    return filtered;
  }

  clearHistory() {
    this.postedImages.clear();
    this.saveHistory();
    logger.info('Cleared image history');
  }

  getStats() {
    return {
      totalPosted: this.postedImages.size,
      maxSize: this.maxHistorySize,
    };
  }
}

// Create and export a singleton instance
export const imageHistory = new ImageHistory();
