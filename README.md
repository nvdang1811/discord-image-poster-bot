# Discord Pixiv Image Bot 🎨

A Discord bot that fetches and posts beautiful images from Pixiv to your Discord server. Features automatic posting, customizable search, and ranking support.

## Features ✨

- 🔍 **Search by Tags**: Find and post images based on Pixiv tags
- 🏆 **Ranking Support**: Get top ranking illustrations (daily, weekly, monthly)
- 🤖 **Auto-Posting**: Automatically post images at scheduled intervals
- 🎯 **Customizable**: Filter by content rating, configure posting frequency
- 📊 **Rich Embeds**: Beautiful Discord embeds with artist info, stats, and tags
- 🔒 **Admin Controls**: Permission-based commands for server management

## Prerequisites 📋

- Node.js 18+ installed
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- A Pixiv Refresh Token (see setup instructions below)
- A Discord server where you have admin permissions

## Installation 🚀

### 1. Clone or Download this Repository

```bash
git clone <your-repo-url>
cd DiscordImageBot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
TARGET_CHANNEL_ID=your_target_channel_id_here

# Pixiv Configuration
PIXIV_REFRESH_TOKEN=your_pixiv_refresh_token_here

# Optional Configuration
PREFIX=!
AUTO_POST_ENABLED=false
AUTO_POST_INTERVAL=3600000
DEFAULT_TAGS=illustration
NSFW_FILTER=true
```

## Getting Your Credentials 🔑

### Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy your bot token (click "Reset Token" if needed)
5. Enable these **Privileged Gateway Intents**:
   - Server Members Intent
   - Message Content Intent
6. Go to OAuth2 → URL Generator
7. Select scopes: `bot`
8. Select permissions:
   - Send Messages
   - Embed Links
   - Attach Files
   - Read Message History
9. Copy the generated URL and invite the bot to your server

### Pixiv Refresh Token

**⚠️ Important: Username/password login is no longer supported by Pixiv API.**

See [PIXIV_TOKEN_GUIDE.md](PIXIV_TOKEN_GUIDE.md) for detailed instructions.

#### Quick Method: Browser DevTools (Recommended)

1. Go to https://app-api.pixiv.net/web/v1/login
2. Open Browser DevTools (F12) → Network tab → Enable "Preserve log"
3. Login with your Pixiv account
4. Look for POST request to `https://oauth.secure.pixiv.net/auth/token`
5. In the Response tab, find and copy the `refresh_token` value
6. Paste it in your `.env` file

#### Alternative: Using Node.js Package

```bash
npm install -g @book000/pixivts-oauth-login
pixiv-oauth-login
```

Follow the prompts to get your refresh token.

**Note**: Store your refresh token securely. It doesn't expire unless you change your password.

### Target Channel ID

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on the channel you want the bot to post in
3. Click "Copy ID"
4. Paste it as `TARGET_CHANNEL_ID` in your `.env` file

## Usage 🎮

### Starting the Bot

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

### Bot Commands

All commands use the prefix `!` by default (configurable in `.env`).

#### `!help`
Display all available commands and their usage.

```
!help
```

#### `!fetchpixiv <tags> [count]`
Search and post Pixiv illustrations by tags.

```
!fetchpixiv landscape 5
!fetchpixiv anime girl 3
!fetchpixiv cat
```

- `tags`: Search terms (required)
- `count`: Number of images (1-10, default: 5)

#### `!pixivranking [mode] [count]`
Fetch top ranking images from Pixiv.

```
!pixivranking day 5
!pixivranking week
!pixivranking month 3
```

**Available modes**:
- `day`: Daily ranking (default)
- `week`: Weekly ranking
- `month`: Monthly ranking
- `day_male`: Daily male ranking
- `day_female`: Daily female ranking
- `week_rookie`: Weekly rookie ranking

#### `!setchannel [channel]` ⚠️ Admin Only
Set the target channel for automatic posts.

```
!setchannel #pixiv-art
!setchannel 123456789012345678
!setchannel
```

- Use without arguments to set current channel
- Mention a channel or provide channel ID

#### `!autopost <on|off>` ⚠️ Admin Only
Enable or disable automatic posting.

```
!autopost on
!autopost off
```

## Configuration ⚙️

### `config/config.json`

```json
{
  "defaultTags": ["illustration"],
  "maxImagesPerFetch": 5,
  "imageQuality": "original",
  "autoPostInterval": 3600000,
  "embedColor": "#0096FA",
  "maxFileSize": 8388608,
  "allowedContentRating": ["safe"],
  "logLevel": "info"
}
```

- `defaultTags`: Default tags for auto-posting
- `maxImagesPerFetch`: Maximum images per auto-post (1-10)
- `imageQuality`: Image quality (`original`, `large`, `medium`)
- `autoPostInterval`: Interval in milliseconds (3600000 = 1 hour)
- `embedColor`: Hex color for Discord embeds
- `maxFileSize`: Max file size in bytes (8388608 = 8MB)
- `allowedContentRating`: Content filter (`["safe"]` or `["safe", "r18"]`)
- `logLevel`: Logging level (`error`, `warn`, `info`, `debug`)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Your Discord bot token | Required |
| `DISCORD_CLIENT_ID` | Your Discord application ID | Required |
| `TARGET_CHANNEL_ID` | Channel ID for auto-posts | Required |
| `PIXIV_REFRESH_TOKEN` | Your Pixiv refresh token | Required |
| `PREFIX` | Command prefix | `!` |
| `AUTO_POST_ENABLED` | Enable auto-posting | `false` |
| `AUTO_POST_INTERVAL` | Posting interval (ms) | `3600000` |
| `DEFAULT_TAGS` | Default search tags | `illustration` |
| `NSFW_FILTER` | Filter NSFW content | `true` |
| `LOG_LEVEL` | Logging level | `info` |

## Project Structure 📁

```
DiscordImageBot/
├── src/
│   ├── commands/           # Bot commands
│   │   ├── autopost.js
│   │   ├── fetchpixiv.js
│   │   ├── help.js
│   │   ├── pixivranking.js
│   │   └── setchannel.js
│   ├── utils/              # Utility modules
│   │   ├── discordPoster.js
│   │   ├── logger.js
│   │   ├── pixivService.js
│   │   └── scheduler.js
│   └── index.js            # Main bot file
├── config/
│   └── config.json         # Configuration file
├── logs/                   # Log files (auto-generated)
├── temp/                   # Temporary image storage
├── .env                    # Environment variables
├── .env.example            # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Troubleshooting 🔧

### Bot doesn't respond to commands

- Ensure the bot has the "Message Content Intent" enabled
- Check that the bot has permissions to read and send messages in the channel
- Verify you're using the correct command prefix

### "Failed to initialize Pixiv service" error

- Check that your `PIXIV_REFRESH_TOKEN` is valid
- Try generating a new refresh token
- Ensure you have internet connectivity

### Images not posting

- Check bot has permission to attach files and embed links
- Verify image file size is under Discord's limit (8MB for standard servers)
- Check logs in `logs/` directory for detailed error messages

### Auto-posting not working

- Ensure `AUTO_POST_ENABLED=true` in `.env`
- Verify `TARGET_CHANNEL_ID` is set correctly
- Use `!autopost on` command to enable
- Check bot has permissions in the target channel

## Deployment 🌐

### Local Deployment

Simply run:

```bash
npm start
```

Keep the terminal open. The bot will stay online as long as the process runs.

### Cloud Deployment Options

#### Heroku

1. Create a new Heroku app
2. Add Node.js buildpack
3. Set environment variables in Heroku dashboard
4. Deploy via Git or GitHub integration

#### Railway.app

1. Create new project from GitHub repo
2. Add environment variables
3. Deploy automatically

#### VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo-url>
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
