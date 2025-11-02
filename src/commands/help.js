import { EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

export default {
  data: {
    name: 'help',
    description: 'Display help information about bot commands',
    usage: '!help',
  },
  async execute(message, args, client) {
    try {
      const prefix = process.env.PREFIX || '!';
      
      const embed = new EmbedBuilder()
        .setColor(0x0096FA)
        .setTitle('📚 Discord Pixiv Bot - Help')
        .setDescription('A bot that fetches and posts images from Pixiv')
        .addFields(
          {
            name: `${prefix}fetchpixiv <tags> [count]`,
            value: 'Search and post Pixiv illustrations by tags\n*Example: `!fetchpixiv landscape 3`*',
            inline: false,
          },
          {
            name: `${prefix}pixivranking [mode] [count]`,
            value: 'Fetch top ranking images from Pixiv\n*Modes: day, week, month, day_male, day_female, week_rookie*\n*Example: `!pixivranking day 5`*',
            inline: false,
          },
          {
            name: `${prefix}setchannel [channel]`,
            value: '**[Admin Only]** Set the target channel for automatic posts\n*Example: `!setchannel #pixiv-art`*',
            inline: false,
          },
          {
            name: `${prefix}autopost <on|off>`,
            value: '**[Admin Only]** Enable or disable automatic posting\n*Example: `!autopost on`*',
            inline: false,
          },
          {
            name: `${prefix}help`,
            value: 'Display this help message',
            inline: false,
          }
        )
        .setFooter({ text: 'Note: Some features require proper configuration in .env file' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      logger.info(`Help command executed by ${message.author.tag}`);

    } catch (error) {
      logger.error('Error in help command:', error);
      await message.reply('❌ An error occurred while displaying help.');
    }
  },
};
