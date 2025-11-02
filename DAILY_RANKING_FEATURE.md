# Daily Ranking Feature

## Overview
The bot now automatically posts the top-ranked Pixiv illustrations of the day to your configured channels at the end of each day.

## How It Works

### SFW Channel
- Posts top **SFW** illustrations from Pixiv's daily ranking (`day` mode)
- Respects all SFW channel filters (NSFW filtering, blacklisted tags, etc.)
- Filters out NSFW content strictly

### NSFW Channel
- Posts top **R-18** illustrations from Pixiv's daily ranking (`day_r18` mode)
- Respects all NSFW channel filters and requirements
- Only includes R-18 content (nsfwOnly mode)

## Configuration

Edit `config/config.json` to configure the daily ranking feature:

```json
{
  "dailyRanking": {
    "enabled": true,        // Enable/disable daily ranking posts
    "time": "23:55",        // Time to post (HH:MM format, 24-hour)
    "topCount": 10          // Number of top illustrations to post
  }
}
```

### Settings

- **enabled**: Set to `true` to enable daily ranking posts, `false` to disable
- **time**: Time of day to post rankings in 24-hour format (e.g., "23:55" = 11:55 PM)
- **topCount**: How many top-ranked illustrations to post (default: 10)

## Features

### Channel-Specific Rankings
- Each channel gets rankings appropriate to its content type:
  - SFW channels: General daily rankings (safe content only)
  - NSFW channels: R-18 daily rankings (adult content only)

### Special Header
Each daily ranking post includes a gold-colored embed header:
- 🏆 Title indicating ranking type (SFW/NSFW)
- Description of the post
- Timestamp
- "Daily Ranking" footer

### Filtering
- Respects all channel-specific filters (blacklisted tags, AI filtering, etc.)
- **No quality thresholds** applied to ranking posts (views/bookmarks ignored)
- Removes duplicate images using history tracking

### Notifications
- Posts are sent with notification suppression to avoid disturbing users at night

## Scheduling

The feature uses cron scheduling:
- Default time: 23:55 (11:55 PM) every day
- Customizable via `time` config setting
- Runs independently from regular auto-post interval

## Logs

The bot logs daily ranking activities:
```
🏆 Executing daily ranking post...
🏆 Posting daily ranking to SFW Channel
Fetching SFW daily ranking (mode: day)
Found 10 SFW ranking images
✅ Posted 10 daily ranking illustrations to sfw-art
```

## Example

With default config (`time: "23:55"`, `topCount: 10`):
1. At 11:55 PM, the bot fetches top 10 SFW illustrations for SFW channel
2. At 11:55 PM, the bot fetches top 10 R-18 illustrations for NSFW channel
3. Posts header embed: "🏆 Top SFW/NSFW Illustrations of the Day"
4. Posts all 10 illustrations to each respective channel
5. Waits 5 seconds between channels to avoid rate limits

## Disabling

To disable daily ranking posts, set `enabled: false` in config:

```json
{
  "dailyRanking": {
    "enabled": false
  }
}
```

The bot will log: `ℹ️ Daily ranking is disabled in config`
