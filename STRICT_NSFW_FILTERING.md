# Strict NSFW/SFW Filtering

## Overview
The bot now enforces **strict content separation** between SFW and NSFW channels. Each channel type has exclusive content filtering to prevent any crossover.

## How It Works

### 🟢 SFW Channel (Strict Safe Mode)
**Configuration:**
```json
{
  "nsfwFilter": true,
  "nsfwOnly": false
}
```

**Filters Applied:**
1. ✅ **Pixiv Rating Check**: MUST have `x_restrict = 0` (marked as safe by Pixiv)
2. ✅ **NSFW Tag Detection**: Blocks images with ANY of these tags:
   - `nsfw`, `r-18`, `r18`, `18+`, `adult`
   - `ecchi`, `エッチ`, `hentai`, `エロ`, `ero`
   - `lewd`, `sexy`, `nude`, `naked`
3. ✅ **Additional Blacklist**: Your custom blacklisted tags
4. ✅ **Result**: ONLY truly safe images

### 🔴 NSFW Channel (Strict Adult Mode)
**Configuration:**
```json
{
  "nsfwFilter": false,
  "nsfwOnly": true
}
```

**Filters Applied:**
1. ✅ **Pixiv Rating Check**: MUST have `x_restrict > 0` (marked as NSFW by Pixiv)
2. ✅ **Rejects SFW Content**: Blocks images with `x_restrict = 0`
3. ✅ **Additional Blacklist**: Your custom blacklisted tags
4. ✅ **Result**: ONLY NSFW images

## Configuration Example

```json
{
  "channels": [
    {
      "id": "952225235539722290",
      "name": "SFW Channel",
      "enabled": true,
      "nsfwFilter": true,      // ✅ Block NSFW
      "nsfwOnly": false,        // ✅ Allow SFW only
      "tags": ["illustration"],
      "minViews": 10000,
      "minBookmarks": 1000,
      "allowAI": false,
      "blacklistedTags": ["gore", "violence", "guro", "nsfw", "r-18", "ecchi"],
      "whitelistedTags": []
    },
    {
      "id": "927527272104214528",
      "name": "NSFW Channel",
      "enabled": true,
      "nsfwFilter": false,     // ✅ Allow NSFW
      "nsfwOnly": true,         // ✅ Require NSFW only
      "tags": ["illustration"],
      "minViews": 5000,
      "minBookmarks": 500,
      "allowAI": false,
      "blacklistedTags": ["gore", "violence", "guro"],
      "whitelistedTags": []
    }
  ]
}
```

## Safety Features

### For SFW Channels:
1. **Double-checking Pixiv ratings** - Pixiv's own NSFW flag must be 0
2. **Tag-based filtering** - Blocks common NSFW-related tags (in English and Japanese)
3. **Extra blacklist tags** - Add `"nsfw"`, `"r-18"`, `"ecchi"` to blacklist for extra safety
4. **High quality threshold** - Higher view/bookmark requirements filter out borderline content

### For NSFW Channels:
1. **Requires explicit NSFW rating** - Image must be marked NSFW by Pixiv
2. **Rejects SFW spillover** - Won't accidentally post safe content to NSFW channel
3. **Content control** - Still respects blacklist (gore, violence, etc.)

## Recommended Blacklist Tags

### SFW Channel:
```json
"blacklistedTags": [
  "gore", "violence", "guro",
  "nsfw", "r-18", "r18", "ecchi",
  "18+", "adult", "lewd", "sexy"
]
```

### NSFW Channel:
```json
"blacklistedTags": [
  "gore", "violence", "guro",
  "loli", "shota", "underage"
]
```

## Log Messages

Watch for these filtering messages:

### SFW Channel:
```
[DEBUG] Filtered NSFW artwork in SFW channel: 12345678
[DEBUG] Filtered artwork with NSFW tags in SFW channel: 12345678
```

### NSFW Channel:
```
[DEBUG] Filtered SFW artwork in NSFW-only channel: 12345678
```

## Testing Your Setup

1. **Enable only SFW channel first**
   ```json
   {"enabled": true, "nsfwFilter": true, "nsfwOnly": false}
   ```
   
2. **Check posted images** - Verify they're all truly SFW

3. **Enable NSFW channel**
   ```json
   {"enabled": true, "nsfwFilter": false, "nsfwOnly": true}
   ```
   
4. **Check posted images** - Verify they're all NSFW-rated

## Troubleshooting

### SFW channel still getting questionable content:
- Add more tags to `blacklistedTags`
- Increase `minViews` and `minBookmarks` (popular = safer)
- Check Discord channel is NOT marked as age-restricted
- Review Pixiv's content rating (some artists don't rate properly)

### NSFW channel getting no images:
- Lower `minViews` and `minBookmarks` thresholds
- Check that channel search tags aren't too restrictive
- Use broader tags like `["illustration"]` instead of specific ones
- Verify Pixiv account can access R-18 content

### Images still crossing over:
- Check logs for filtering statistics
- Verify `nsfwOnly: true` is set for NSFW channel
- Verify `nsfwFilter: true` is set for SFW channel
- Review and expand blacklist tags

## Important Notes

1. **Pixiv's Rating System**: The bot relies on Pixiv's `x_restrict` flag:
   - `0` = Safe/General
   - `1` = R-18 (NSFW)
   - `2` = R-18G (Grotesque)

2. **Artist Responsibility**: Some artists don't properly rate their content. The tag-based filtering provides an extra safety layer.

3. **Discord Channel Settings**: Make sure your NSFW Discord channel is marked as age-restricted in Discord settings.

4. **Content Control**: Both modes still respect quality filters, AI filters, and custom blacklists.

5. **Shared History**: Duplicate detection works across both channels - an image posted to SFW won't be reposted to NSFW.

## Quick Reference

| Setting | SFW Channel | NSFW Channel |
|---------|-------------|--------------|
| `nsfwFilter` | `true` | `false` |
| `nsfwOnly` | `false` | `true` |
| Pixiv Rating | Must be 0 | Must be > 0 |
| Tag Check | Blocks NSFW tags | No restriction |
| Result | Safe content only | Adult content only |
