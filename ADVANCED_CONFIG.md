# Advanced Configuration Guide

## New Features Added

### 1. Notification Suppression
Prevents bot posts from sending push notifications to channel members.

**Configuration (.env):**
```env
SUPPRESS_NOTIFICATIONS=true
```
- `true` = Silent posts (no notifications)
- `false` = Normal posts (with notifications)

---

### 2. AI-Generated Art Filter
Toggle whether to allow AI-generated artwork from Pixiv.

**Configuration (.env):**
```env
ALLOW_AI_GENERATED=false
```
- `false` = Blocks AI art (filters out tags like: ai, ai-generated, AI生成, stablediffusion, etc.)
- `true` = Allows AI art

**Detected AI Tags:**
- `ai`, `ai-generated`, `ai生成`, `ai絵`
- `stablediffusion`, `midjourney`, `novelai`

---

### 3. Tag Blacklist
Block specific tags from being posted.

**Configuration (.env):**
```env
BLACKLISTED_TAGS=gore,violence,tag3
```

**Format:**
- Comma-separated list of tags
- Case-insensitive
- Leave empty to disable

**Example:**
```env
BLACKLISTED_TAGS=mecha,robot,nsfw
```

---

### 4. Tag Whitelist
Only allow illustrations with specific tags (stricter filtering).

**Configuration (.env):**
```env
WHITELISTED_TAGS=landscape,scenery,nature
```

**Format:**
- Comma-separated list of tags
- Case-insensitive
- Leave empty to disable
- If set, ONLY illustrations with these tags will be posted

**Example:**
```env
WHITELISTED_TAGS=cat,dog,animal
```

**⚠️ Note:** If whitelist is active, blacklist is still applied first.

---

### 5. Auto-Post Interval
Changed from 1 hour to 5 minutes.

**Configuration (.env):**
```env
AUTO_POST_INTERVAL=300000
```

**Common intervals:**
- `60000` = 1 minute
- `300000` = 5 minutes (current)
- `600000` = 10 minutes
- `1800000` = 30 minutes
- `3600000` = 1 hour

---

## Complete .env Configuration Example

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_token_here
DISCORD_CLIENT_ID=your_client_id_here
TARGET_CHANNEL_ID=your_channel_id_here

# Pixiv Configuration
PIXIV_REFRESH_TOKEN=your_refresh_token_here

# Basic Configuration
PREFIX=!
AUTO_POST_ENABLED=true
AUTO_POST_INTERVAL=300000
DEFAULT_TAGS=illustration
NSFW_FILTER=true

# Advanced Filters
SUPPRESS_NOTIFICATIONS=true
ALLOW_AI_GENERATED=false
BLACKLISTED_TAGS=
WHITELISTED_TAGS=
```

---

## How Filters Work Together

### Filter Priority (in order):
1. **Type filter** - Removes animated (ugoira) images
2. **NSFW filter** - Removes adult content if enabled
3. **AI filter** - Removes AI-generated art if disabled
4. **Blacklist** - Removes posts with blacklisted tags
5. **Whitelist** - If set, only keeps posts with whitelisted tags

### Example Scenarios:

**Scenario 1: Block AI art and violence**
```env
ALLOW_AI_GENERATED=false
BLACKLISTED_TAGS=violence,gore,blood
WHITELISTED_TAGS=
```
Result: No AI art, no violence, allows everything else

**Scenario 2: Only post nature/landscape photos**
```env
ALLOW_AI_GENERATED=false
BLACKLISTED_TAGS=
WHITELISTED_TAGS=landscape,scenery,nature,photography
```
Result: Only natural landscape images, no AI

**Scenario 3: Allow everything except specific tags**
```env
ALLOW_AI_GENERATED=true
BLACKLISTED_TAGS=mecha,robot
WHITELISTED_TAGS=
```
Result: AI allowed, but no mecha/robot images

---

## Testing Your Configuration

1. Save changes to `.env`
2. Restart the bot: `npm start`
3. Test manually: `!fetchpixiv <tags> 5`
4. Check logs for filtered artwork messages

---

## Logs

When images are filtered, you'll see debug messages like:
```
[DEBUG] Filtered AI-generated artwork: 123456789
[DEBUG] Filtered blacklisted artwork: 123456789
[DEBUG] Filtered non-whitelisted artwork: 123456789
```

Enable debug logging in `.env`:
```env
LOG_LEVEL=debug
```

---

## Notes

- All tag matching is **case-insensitive**
- Filters apply to both manual commands and auto-posting
- Whitelist overrides default search behavior
- Empty whitelist = no whitelist filtering (all tags allowed)
- Notifications are suppressed using Discord's MessageFlags (4096)
