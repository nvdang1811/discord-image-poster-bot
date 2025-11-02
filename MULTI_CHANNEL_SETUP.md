# Multi-Channel Setup Guide

## Overview
The bot supports posting to multiple channels simultaneously, each with its own content filters. This allows you to have separate SFW and NSFW channels with different quality thresholds and tag filters.

## Configuration

### Step 1: Edit `config/config.json`

Replace the channel IDs and enable the channels you want to use:

```json
{
  "channels": [
    {
      "id": "YOUR_SFW_CHANNEL_ID",
      "name": "SFW Channel",
      "enabled": true,
      "nsfwFilter": true,           // true = blocks NSFW content
      "tags": ["illustration", "anime"],
      "minViews": 5000,
      "minBookmarks": 500,
      "allowAI": false,
      "blacklistedTags": ["gore", "violence", "guro"],
      "whitelistedTags": []
    },
    {
      "id": "YOUR_NSFW_CHANNEL_ID",
      "name": "NSFW Channel",
      "enabled": true,
      "nsfwFilter": false,          // false = allows NSFW content
      "tags": ["illustration"],
      "minViews": 1000,
      "minBookmarks": 100,
      "allowAI": false,
      "blacklistedTags": ["gore", "violence", "guro"],
      "whitelistedTags": []
    }
  ]
}
```

### Step 2: Get Channel IDs

1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click on your SFW channel → Copy Channel ID
3. Right-click on your NSFW channel → Copy Channel ID
4. Paste the IDs into `config.json`

### Step 3: Configure Each Channel

#### SFW Channel Settings:
```json
{
  "id": "123456789012345678",
  "name": "SFW Pixiv Art",
  "enabled": true,
  "nsfwFilter": true,              // ✅ Block NSFW content
  "tags": ["illustration", "cute", "wholesome"],
  "minViews": 10000,               // Higher quality threshold
  "minBookmarks": 1000,
  "allowAI": false,
  "blacklistedTags": ["nsfw", "ecchi", "gore", "violence"],
  "whitelistedTags": []
}
```

#### NSFW Channel Settings:
```json
{
  "id": "987654321098765432",
  "name": "NSFW Pixiv Art",
  "enabled": true,
  "nsfwFilter": false,             // ✅ Allow NSFW content
  "tags": ["illustration"],
  "minViews": 1000,                // Lower threshold for more variety
  "minBookmarks": 100,
  "allowAI": false,
  "blacklistedTags": ["gore", "violence", "guro"],
  "whitelistedTags": []
}
```

### Step 4: Restart the Bot

```bash
npm start
```

## Channel Configuration Options

### Required Fields:
- `id` - Discord channel ID (string)
- `enabled` - Whether to post to this channel (boolean)

### Content Filters:
- `nsfwFilter` - `true` = block NSFW, `false` = allow NSFW
- `allowAI` - `true` = allow AI art, `false` = block AI art
- `tags` - Array of search tags (e.g., `["illustration", "anime"]`)

### Quality Thresholds:
- `minViews` - Minimum view count (number)
- `minBookmarks` - Minimum bookmark count (number)

### Tag Filters:
- `blacklistedTags` - Array of tags to exclude (e.g., `["gore", "violence"]`)
- `whitelistedTags` - Array of tags to require (empty = allow all)

## Example Configurations

### 1. Strict SFW + Relaxed NSFW
```json
{
  "channels": [
    {
      "id": "SFW_CHANNEL_ID",
      "name": "Safe For Work",
      "enabled": true,
      "nsfwFilter": true,
      "tags": ["illustration", "cute"],
      "minViews": 20000,
      "minBookmarks": 2000,
      "allowAI": false,
      "blacklistedTags": ["nsfw", "ecchi", "suggestive", "gore"],
      "whitelistedTags": []
    },
    {
      "id": "NSFW_CHANNEL_ID",
      "name": "NSFW Art",
      "enabled": true,
      "nsfwFilter": false,
      "tags": ["illustration"],
      "minViews": 500,
      "minBookmarks": 50,
      "allowAI": false,
      "blacklistedTags": ["gore", "guro"],
      "whitelistedTags": []
    }
  ]
}
```

### 2. Multiple Themed Channels
```json
{
  "channels": [
    {
      "id": "ANIME_CHANNEL_ID",
      "name": "Anime Art",
      "enabled": true,
      "nsfwFilter": true,
      "tags": ["anime", "fanart"],
      "minViews": 5000,
      "minBookmarks": 500,
      "allowAI": false,
      "blacklistedTags": [],
      "whitelistedTags": []
    },
    {
      "id": "ORIGINAL_CHANNEL_ID",
      "name": "Original Art",
      "enabled": true,
      "nsfwFilter": true,
      "tags": ["original", "オリジナル"],
      "minViews": 5000,
      "minBookmarks": 500,
      "allowAI": false,
      "blacklistedTags": [],
      "whitelistedTags": []
    },
    {
      "id": "NSFW_CHANNEL_ID",
      "name": "NSFW",
      "enabled": true,
      "nsfwFilter": false,
      "tags": ["illustration"],
      "minViews": 1000,
      "minBookmarks": 100,
      "allowAI": false,
      "blacklistedTags": ["gore"],
      "whitelistedTags": []
    }
  ]
}
```

## How It Works

1. **Scheduler runs** every 5 minutes (or configured interval)
2. **Each enabled channel** gets processed sequentially
3. **Channel-specific filters** are applied:
   - SFW channel blocks NSFW images
   - NSFW channel allows NSFW images
   - Each has its own quality thresholds
4. **Images are posted** to each channel
5. **Wait 5 seconds** between channels to avoid rate limiting

## Logs

Watch for these log messages:

```
[INFO] Multi-channel mode: 2 channel(s) configured
[INFO] 📤 Posting to SFW Channel (NSFW: false)
[INFO] Selected 5 random images from 15 available
[INFO] ✅ Auto-posted 5 illustrations to sfw-pixiv
[INFO] 📤 Posting to NSFW Channel (NSFW: true)
[INFO] Selected 5 random images from 12 available
[INFO] ✅ Auto-posted 5 illustrations to nsfw-pixiv
```

## Disabling Channels

To temporarily disable a channel without deleting it:

```json
{
  "id": "CHANNEL_ID",
  "enabled": false,  // ← Set to false
  // ... rest of config
}
```

## Fallback to Single Channel

If you don't configure the `channels` array in `config.json`, the bot will use the legacy single-channel mode with `TARGET_CHANNEL_ID` from `.env`.

## Tips

1. **Set appropriate NSFW filtering**: Make sure your Discord channels are marked as age-restricted for NSFW content
2. **Different quality for different channels**: Use higher thresholds for SFW to ensure safe content
3. **Test first**: Enable one channel at a time to verify settings
4. **Monitor logs**: Check logs to see filtering statistics
5. **Separate histories**: Each channel shares the same duplicate history to avoid reposting across channels

## Troubleshooting

### No images posted to NSFW channel
- Check `nsfwFilter: false` is set
- Lower `minViews` and `minBookmarks` thresholds
- Remove restrictive blacklisted tags

### NSFW images in SFW channel
- Verify `nsfwFilter: true` is set
- Add more tags to `blacklistedTags`
- Increase quality thresholds

### Channel not found error
- Verify channel ID is correct
- Make sure bot has access to the channel
- Check bot permissions (View Channel, Send Messages, Embed Links, Attach Files)
