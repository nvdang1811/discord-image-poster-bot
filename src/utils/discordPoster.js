import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import axios from 'axios';
import { logger } from './logger.js';
import { imageHistory } from './imageHistory.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory for image downloads
const tempDir = path.join(__dirname, '..', '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

class DiscordPoster {
  constructor(maxFileSize = 8388608) { // 8MB default
    this.maxFileSize = maxFileSize;
    this.embedColor = 0x0096FA; // Pixiv blue
  }

  async downloadImage(url, referer = 'https://www.pixiv.net/') {
    try {
      logger.debug(`Downloading image from: ${url}`);
      
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'arraybuffer',
        headers: {
          'Referer': referer,
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);
      
      if (buffer.length > this.maxFileSize) {
        logger.warn(`Image size (${buffer.length}) exceeds max file size (${this.maxFileSize})`);
        return null;
      }

      return buffer;
    } catch (error) {
      logger.error('Error downloading image:', error);
      throw error;
    }
  }

  createEmbed(illustInfo) {
    const embed = new EmbedBuilder()
      .setColor(this.embedColor)
      .setTitle(illustInfo.title || 'Untitled')
      .setURL(illustInfo.url)
      .setAuthor({
        name: illustInfo.artist.name,
        url: `https://www.pixiv.net/users/${illustInfo.artist.id}`,
      })
      .setDescription(
        illustInfo.caption?.length > 200 
          ? illustInfo.caption.substring(0, 200) + '...' 
          : illustInfo.caption
      )
      .addFields(
        { 
          name: '👁️ Views', 
          value: illustInfo.totalView?.toLocaleString() || 'N/A', 
          inline: true 
        },
        { 
          name: '❤️ Bookmarks', 
          value: illustInfo.totalBookmarks?.toLocaleString() || 'N/A', 
          inline: true 
        },
        { 
          name: '🏷️ Tags', 
          value: illustInfo.tags.slice(0, 5).join(', ') || 'None', 
          inline: false 
        }
      )
      .setTimestamp(new Date(illustInfo.createdAt))
      .setFooter({ text: `Pixiv ID: ${illustInfo.id}` });

    return embed;
  }

  async postToChannel(channel, illustInfo) {
    try {
      logger.info(`Posting illustration ${illustInfo.id} to channel ${channel.id}`);

      const embed = this.createEmbed(illustInfo);

      // Download image
      const imageBuffer = await this.downloadImage(illustInfo.imageUrl);

      if (!imageBuffer) {
        // If image is too large or failed to download, post without attachment
        const suppressNotifications = process.env.SUPPRESS_NOTIFICATIONS === 'true';
        await channel.send({ 
          embeds: [embed],
          flags: suppressNotifications ? 4096 : undefined // 4096 = SUPPRESS_NOTIFICATIONS flag
        });
        logger.warn(`Posted illustration ${illustInfo.id} without image attachment`);
        imageHistory.markAsPosted(illustInfo.id);
        return;
      }

      // Determine file extension
      const ext = illustInfo.imageUrl.split('.').pop().split('?')[0] || 'jpg';
      const filename = `pixiv_${illustInfo.id}.${ext}`;

      // Create attachment
      const attachment = new AttachmentBuilder(imageBuffer, { name: filename });
      
      // Set image in embed
      embed.setImage(`attachment://${filename}`);

      // Send message with optional notification suppression
      const suppressNotifications = process.env.SUPPRESS_NOTIFICATIONS === 'true';
      await channel.send({ 
        embeds: [embed],
        files: [attachment],
        flags: suppressNotifications ? 4096 : undefined // MessageFlags.SuppressNotifications
      });

      logger.info(`✅ Successfully posted illustration ${illustInfo.id}`);
      imageHistory.markAsPosted(illustInfo.id);
      return true;

    } catch (error) {
      logger.error(`Error posting illustration ${illustInfo.id} to Discord:`, error);
      
      // Try to post without image as fallback
      try {
        const embed = this.createEmbed(illustInfo);
        const suppressNotifications = process.env.SUPPRESS_NOTIFICATIONS === 'true';
        await channel.send({ 
          embeds: [embed],
          flags: suppressNotifications ? 4096 : undefined
        });
        logger.warn(`Posted illustration ${illustInfo.id} without image due to error`);
        imageHistory.markAsPosted(illustInfo.id);
      } catch (fallbackError) {
        logger.error('Fallback post also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async postMultipleToChannel(channel, illustInfos, delay = 2000) {
    const results = [];
    
    for (let i = 0; i < illustInfos.length; i++) {
      try {
        await this.postToChannel(channel, illustInfos[i]);
        results.push({ success: true, id: illustInfos[i].id });
        
        // Add delay between posts to avoid rate limiting
        if (i < illustInfos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        results.push({ success: false, id: illustInfos[i].id, error: error.message });
      }
    }

    return results;
  }
}

// Create and export a singleton instance
export const discordPoster = new DiscordPoster();
