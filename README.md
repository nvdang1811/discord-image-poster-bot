# Discord Anime Image Bot 🎨# Discord Pixiv Image Bot 🎨



A Discord bot that fetches and posts anime images from waifu.pics to your Discord server. Features automatic posting, multi-channel support, and SFW/NSFW category selection.A Discord bot that fetches and posts beautiful images from Pixiv to your Discord server. Features automatic posting, customizable search, and ranking support.



## Features ✨## Features ✨



- 🔍 **Multiple Categories**: Choose from 30+ SFW and 4 NSFW anime image categories- 🔍 **Search by Tags**: Find and post images based on Pixiv tags

- 🤖 **Auto-Posting**: Automatically post images at scheduled intervals to multiple channels- 🏆 **Ranking Support**: Get top ranking illustrations (daily, weekly, monthly)

- 🎯 **Multi-Channel Support**: Configure separate channels with different categories (SFW/NSFW)- 🤖 **Auto-Posting**: Automatically post images at scheduled intervals

- 📊 **Rich Embeds**: Beautiful Discord embeds with category and source information- 🎯 **Customizable**: Filter by content rating, configure posting frequency

- 🔒 **Admin Controls**: Permission-based commands for server management- 📊 **Rich Embeds**: Beautiful Discord embeds with artist info, stats, and tags

- 🚫 **GIF Filtering**: Automatically filters out animated GIFs, posts only static images- 🔒 **Admin Controls**: Permission-based commands for server management

- 🎲 **Random Selection**: Gets different random images each time from waifu.pics pool

## Prerequisites 📋

## Prerequisites 📋

- Node.js 18+ installed

- Node.js 18+ installed- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))

- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))- A Pixiv Refresh Token (see setup instructions below)

- A Discord server where you have admin permissions- A Discord server where you have admin permissions



## Installation 🚀## Installation 🚀



### 1. Clone or Download this Repository### 1. Clone or Download this Repository



```bash```bash

git clone https://github.com/nvdang1811/discord-image-poster-bot.gitgit clone <your-repo-url>

cd discord-image-poster-botcd DiscordImageBot

``````



### 2. Install Dependencies### 2. Install Dependencies



```bash```bash

npm installnpm install

``````



### 3. Configure Environment Variables### 3. Configure Environment Variables



Copy the `.env.example` file to `.env`:Copy the `.env.example` file to `.env`:



```bash```bash

cp .env.example .envcp .env.example .env

``````



Edit `.env` with your credentials:Edit `.env` with your credentials:



```env```env

# Discord Bot Configuration# Discord Bot Configuration

DISCORD_TOKEN=your_discord_bot_token_hereDISCORD_TOKEN=your_discord_bot_token_here

DISCORD_CLIENT_ID=your_discord_client_id_hereDISCORD_CLIENT_ID=your_discord_client_id_here

TARGET_CHANNEL_ID=your_target_channel_id_hereTARGET_CHANNEL_ID=your_target_channel_id_here



# Optional Configuration# Pixiv Configuration

PREFIX=!PIXIV_REFRESH_TOKEN=your_pixiv_refresh_token_here

AUTO_POST_ENABLED=false

AUTO_POST_INTERVAL=3600000# Optional Configuration

DEFAULT_TAGS=illustrationPREFIX=!

NSFW_FILTER=trueAUTO_POST_ENABLED=false

```AUTO_POST_INTERVAL=3600000

DEFAULT_TAGS=illustration

## Getting Your Credentials 🔑NSFW_FILTER=true

```

### Discord Bot Token

## Getting Your Credentials 🔑

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)

2. Click "New Application" and give it a name### Discord Bot Token

3. Go to the "Bot" section and click "Add Bot"

4. Copy your bot token (click "Reset Token" if needed)1. Go to [Discord Developer Portal](https://discord.com/developers/applications)

5. Enable these **Privileged Gateway Intents**:2. Click "New Application" and give it a name

   - Server Members Intent3. Go to the "Bot" section and click "Add Bot"

   - Message Content Intent4. Copy your bot token (click "Reset Token" if needed)

6. Go to OAuth2 → URL Generator5. Enable these **Privileged Gateway Intents**:

7. Select scopes: `bot`   - Server Members Intent

8. Select permissions:   - Message Content Intent

   - Send Messages6. Go to OAuth2 → URL Generator

   - Embed Links7. Select scopes: `bot`

   - Attach Files8. Select permissions:

   - Read Message History   - Send Messages

9. Copy the generated URL and invite the bot to your server   - Embed Links

   - Attach Files

### Target Channel ID   - Read Message History

9. Copy the generated URL and invite the bot to your server

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)

2. Right-click on the channel you want the bot to post in### Pixiv Refresh Token

3. Click "Copy ID"

4. Paste it as `TARGET_CHANNEL_ID` in your `.env` file**⚠️ Important: Username/password login is no longer supported by Pixiv API.**



## Usage 🎮See [PIXIV_TOKEN_GUIDE.md](PIXIV_TOKEN_GUIDE.md) for detailed instructions.



### Starting the Bot#### Quick Method: Browser DevTools (Recommended)



```bash1. Go to https://app-api.pixiv.net/web/v1/login

npm start2. Open Browser DevTools (F12) → Network tab → Enable "Preserve log"

```3. Login with your Pixiv account

4. Look for POST request to `https://oauth.secure.pixiv.net/auth/token`

For development with auto-restart:5. In the Response tab, find and copy the `refresh_token` value

6. Paste it in your `.env` file

```bash

npm run dev#### Alternative: Using Node.js Package

```

```bash

### Bot Commandsnpm install -g @book000/pixivts-oauth-login

pixiv-oauth-login

All commands use the prefix `!` by default (configurable in `.env`).```



#### `!help`Follow the prompts to get your refresh token.

Display all available commands and their usage.

**Note**: Store your refresh token securely. It doesn't expire unless you change your password.

```

!help### Target Channel ID

```

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)

#### `!setchannel [channel]` ⚠️ Admin Only2. Right-click on the channel you want the bot to post in

Set the target channel for automatic posts.3. Click "Copy ID"

4. Paste it as `TARGET_CHANNEL_ID` in your `.env` file

```

!setchannel #anime-art## Usage 🎮

!setchannel 123456789012345678

!setchannel### Starting the Bot

```

```bash

- Use without arguments to set current channelnpm start

- Mention a channel or provide channel ID```



#### `!autopost <on|off>` ⚠️ Admin OnlyFor development with auto-restart:

Enable or disable automatic posting.

```bash

```npm run dev

!autopost on```

!autopost off

```### Bot Commands



## Configuration ⚙️All commands use the prefix `!` by default (configurable in `.env`).



### `config/config.json`#### `!help`

Display all available commands and their usage.

```json

{```

  "defaultTags": ["illustration"],!help

  "maxImagesPerFetch": 5,```

  "batchPostCount": 5,

  "imageQuality": "original",#### `!fetchpixiv <tags> [count]`

  "autoPostInterval": 300000,Search and post Pixiv illustrations by tags.

  "embedColor": "#0096FA",

  "maxFileSize": 8388608,```

  "allowedContentRating": ["safe"],!fetchpixiv landscape 5

  "logLevel": "info",!fetchpixiv anime girl 3

  "suppressNotifications": true,!fetchpixiv cat

  "channels": [```

    {

      "id": "your_sfw_channel_id",- `tags`: Search terms (required)

      "name": "SFW Channel",- `count`: Number of images (1-10, default: 5)

      "categories": ["waifu", "neko", "shinobu", "megumin"],

      "nsfw": false,#### `!pixivranking [mode] [count]`

      "enabled": trueFetch top ranking images from Pixiv.

    },

    {```

      "id": "your_nsfw_channel_id",!pixivranking day 5

      "name": "NSFW Channel",!pixivranking week

      "categories": ["waifu", "neko"],!pixivranking month 3

      "nsfw": true,```

      "enabled": true

    }**Available modes**:

  ]- `day`: Daily ranking (default)

}- `week`: Weekly ranking

```- `month`: Monthly ranking

- `day_male`: Daily male ranking

**Available SFW Categories:**- `day_female`: Daily female ranking

waifu, neko, shinobu, megumin, bully, cuddle, cry, hug, awoo, kiss, lick, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe- `week_rookie`: Weekly rookie ranking



**Available NSFW Categories:**#### `!setchannel [channel]` ⚠️ Admin Only

waifu, neko, trap, blowjobSet the target channel for automatic posts.



- `maxImagesPerFetch`: Maximum images per auto-post (1-10)```

- `batchPostCount`: Number of images to post per batch!setchannel #pixiv-art

- `autoPostInterval`: Interval in milliseconds (300000 = 5 minutes)!setchannel 123456789012345678

- `embedColor`: Hex color for Discord embeds!setchannel

- `maxFileSize`: Max file size in bytes (8388608 = 8MB)```

- `logLevel`: Logging level (`error`, `warn`, `info`, `debug`)

- `suppressNotifications`: Suppress @mentions in posted messages- Use without arguments to set current channel

- Mention a channel or provide channel ID

### Environment Variables

#### `!autopost <on|off>` ⚠️ Admin Only

| Variable | Description | Default |Enable or disable automatic posting.

|----------|-------------|---------|

| `DISCORD_TOKEN` | Your Discord bot token | Required |```

| `DISCORD_CLIENT_ID` | Your Discord application ID | Required |!autopost on

| `TARGET_CHANNEL_ID` | Channel ID for auto-posts | Required |!autopost off

| `PREFIX` | Command prefix | `!` |```

| `AUTO_POST_ENABLED` | Enable auto-posting | `false` |

| `AUTO_POST_INTERVAL` | Posting interval (ms) | `3600000` |## Configuration ⚙️

| `DEFAULT_TAGS` | Default search tags | `illustration` |

| `NSFW_FILTER` | Filter NSFW content | `true` |### `config/config.json`

| `LOG_LEVEL` | Logging level | `info` |

```json

## Project Structure 📁{

  "defaultTags": ["illustration"],

```  "maxImagesPerFetch": 5,

DiscordImageBot/  "imageQuality": "original",

├── src/  "autoPostInterval": 3600000,

│   ├── commands/           # Bot commands  "embedColor": "#0096FA",

│   │   ├── autopost.js  "maxFileSize": 8388608,

│   │   ├── help.js  "allowedContentRating": ["safe"],

│   │   └── setchannel.js  "logLevel": "info"

│   ├── utils/              # Utility modules}

│   │   ├── discordPoster.js```

│   │   ├── waifuService.js

│   │   ├── imageHistory.js- `defaultTags`: Default tags for auto-posting

│   │   ├── logger.js- `maxImagesPerFetch`: Maximum images per auto-post (1-10)

│   │   └── scheduler.js- `imageQuality`: Image quality (`original`, `large`, `medium`)

│   └── index.js            # Main bot file- `autoPostInterval`: Interval in milliseconds (3600000 = 1 hour)

├── config/- `embedColor`: Hex color for Discord embeds

│   └── config.json         # Configuration file- `maxFileSize`: Max file size in bytes (8388608 = 8MB)

├── logs/                   # Log files (auto-generated)- `allowedContentRating`: Content filter (`["safe"]` or `["safe", "r18"]`)

├── posted_images.json      # Image history tracking- `logLevel`: Logging level (`error`, `warn`, `info`, `debug`)

├── .env                    # Environment variables

├── .env.example            # Environment template### Environment Variables

├── .gitignore

├── package.json| Variable | Description | Default |

└── README.md|----------|-------------|---------|

```| `DISCORD_TOKEN` | Your Discord bot token | Required |

| `DISCORD_CLIENT_ID` | Your Discord application ID | Required |

## Troubleshooting 🔧| `TARGET_CHANNEL_ID` | Channel ID for auto-posts | Required |

| `PIXIV_REFRESH_TOKEN` | Your Pixiv refresh token | Required |

### Bot doesn't respond to commands| `PREFIX` | Command prefix | `!` |

| `AUTO_POST_ENABLED` | Enable auto-posting | `false` |

- Ensure the bot has the "Message Content Intent" enabled| `AUTO_POST_INTERVAL` | Posting interval (ms) | `3600000` |

- Check that the bot has permissions to read and send messages in the channel| `DEFAULT_TAGS` | Default search tags | `illustration` |

- Verify you're using the correct command prefix| `NSFW_FILTER` | Filter NSFW content | `true` |

| `LOG_LEVEL` | Logging level | `info` |

### Images not posting

## Project Structure 📁

- Check bot has permission to attach files and embed links

- Verify image file size is under Discord's limit (8MB for standard servers)```

- Check logs in `logs/` directory for detailed error messagesDiscordImageBot/

- Ensure channel IDs in config.json are correct├── src/

│   ├── commands/           # Bot commands

### Auto-posting not working│   │   ├── autopost.js

│   │   ├── fetchpixiv.js

- Ensure `AUTO_POST_ENABLED=true` in `.env`│   │   ├── help.js

- Verify channel IDs are set correctly in `config/config.json`│   │   ├── pixivranking.js

- Use `!autopost on` command to enable│   │   └── setchannel.js

- Check bot has permissions in the target channels│   ├── utils/              # Utility modules

- Review logs for any error messages│   │   ├── discordPoster.js

│   │   ├── logger.js

### Only getting a few images or GIFs showing│   │   ├── pixivService.js

│   │   └── scheduler.js

- The bot automatically filters out GIFs (checks for .gif extension)│   └── index.js            # Main bot file

- Requests 2x the needed amount to account for filtered GIFs├── config/

- Slices result to exact count specified in config│   └── config.json         # Configuration file

├── logs/                   # Log files (auto-generated)

## Deployment 🌐├── temp/                   # Temporary image storage

├── .env                    # Environment variables

### Local Deployment├── .env.example            # Environment template

├── .gitignore

Simply run:├── package.json

└── README.md

```bash```

npm start

```## Troubleshooting 🔧



Keep the terminal open. The bot will stay online as long as the process runs.### Bot doesn't respond to commands



### Cloud Deployment Options- Ensure the bot has the "Message Content Intent" enabled

- Check that the bot has permissions to read and send messages in the channel

#### Railway.app- Verify you're using the correct command prefix



1. Create new project from GitHub repo### "Failed to initialize Pixiv service" error

2. Add environment variables in Railway dashboard

3. Deploy automatically from GitHub- Check that your `PIXIV_REFRESH_TOKEN` is valid

- Try generating a new refresh token

#### VPS (Ubuntu/Debian)- Ensure you have internet connectivity



```bash### Images not posting

# Install Node.js

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -- Check bot has permission to attach files and embed links

sudo apt-get install -y nodejs- Verify image file size is under Discord's limit (8MB for standard servers)

- Check logs in `logs/` directory for detailed error messages

# Clone and setup

git clone https://github.com/nvdang1811/discord-image-poster-bot.git### Auto-posting not working

cd discord-image-poster-bot

npm install- Ensure `AUTO_POST_ENABLED=true` in `.env`

- Verify `TARGET_CHANNEL_ID` is set correctly

# Use PM2 for process management- Use `!autopost on` command to enable

npm install -g pm2- Check bot has permissions in the target channel

pm2 start src/index.js --name anime-bot

pm2 save## Deployment 🌐

pm2 startup

```### Local Deployment



## Legal & Terms of Service ⚖️Simply run:



- **Respect Discord's Terms of Service**: Follow Discord's bot guidelines```bash

- **Content Ownership**: All images are sourced from waifu.pics APInpm start

- **NSFW Content**: Ensure NSFW content is only posted in age-restricted channels```

- **Rate Limiting**: The bot implements rate limiting to respect API limits

Keep the terminal open. The bot will stay online as long as the process runs.

## Contributing 🤝

### Cloud Deployment Options

Contributions are welcome! Please feel free to submit a Pull Request.

#### Heroku

## License 📄

1. Create a new Heroku app

This project is licensed under the ISC License.2. Add Node.js buildpack

3. Set environment variables in Heroku dashboard

## Acknowledgments 🙏4. Deploy via Git or GitHub integration



- [discord.js](https://discord.js.org/) - Discord API library#### Railway.app

- [waifu.pics](https://waifu.pics/) - Free anime image API

- All the amazing artists whose work is featured1. Create new project from GitHub repo

2. Add environment variables

## Support 💬3. Deploy automatically



If you encounter any issues or have questions:#### VPS (Ubuntu/Debian)



1. Check the troubleshooting section```bash

2. Review the logs in `logs/` directory# Install Node.js

3. Open an issue on GitHubcurl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

sudo apt-get install -y nodejs

---

# Clone and setup

**Disclaimer**: This bot is not affiliated with Discord or waifu.pics. Use responsibly and respect content creators' rights.git clone <repo-url>

cd DiscordImageBot
npm install

# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name pixiv-bot
pm2 save
pm2 startup
```

## Legal & Terms of Service ⚖️

- **Respect Pixiv's Terms of Service**: Do not abuse the API or scrape excessively
- **Respect Discord's Terms of Service**: Follow Discord's bot guidelines
- **Content Ownership**: All images belong to their respective artists on Pixiv
- **NSFW Content**: Ensure NSFW content is only posted in age-restricted channels
- **Rate Limiting**: The bot implements rate limiting to respect API limits

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the ISC License.

## Acknowledgments 🙏

- [discord.js](https://discord.js.org/) - Discord API library
- [pixiv.ts](https://www.npmjs.com/package/pixiv.ts) - Pixiv API library
- Pixiv for providing the artwork platform
- All the amazing artists on Pixiv

## Support 💬

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the logs in `logs/` directory
3. Open an issue on GitHub

---

**Disclaimer**: This bot is not affiliated with Pixiv or Discord. Use responsibly and respect content creators' rights.
