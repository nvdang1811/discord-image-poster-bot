# Random Whitelist Tag Feature

## Overview
The bot can now randomly select one tag from a predefined array to use as a whitelist filter for each auto-post cycle. This ensures content variety by focusing on different themes each time.

## How It Works

Each time the bot posts:
1. Picks **one random tag** from `randomWhitelistTags` array
2. Uses it as the **whitelist filter** for that cycle
3. Only posts images that have that specific tag
4. Next cycle picks a different random tag

## Configuration

Add `randomWhitelistTags` array to your channel config:

```json
{
  "id": "YOUR_CHANNEL_ID",
  "name": "SFW Channel",
  "randomWhitelistTags": ["anime", "original", "fanart", "scenery", "cute"]
}
```

## Example Configurations

### SFW Channel - Varied Themes
```json
{
  "id": "952225235539722290",
  "name": "SFW Channel",
  "randomWhitelistTags": [
    "anime",        // Anime characters
    "original",     // Original characters
    "fanart",       // Fan art
    "scenery",      // Landscapes
    "cute",         // Cute art
    "portrait",     // Character portraits
    "fantasy",      // Fantasy themes
    "landscape"     // Nature scenes
  ]
}
```

### NSFW Channel - Adult Themes
```json
{
  "id": "927527272104214528",
  "name": "NSFW Channel",
  "randomWhitelistTags": [
    "bikini",       // Swimsuit art
    "swimsuit",     // Beach/pool themes
    "lingerie",     // Lingerie
    "sexy",         // Sexy poses
    "maid",         // Maid outfits
    "bunny girl"    // Bunny costumes
  ]
}
```

## How It Works in Practice

### Cycle 1:
```
[INFO] 🎲 Random whitelist tag selected: "anime"
[INFO] Searching Pixiv for tags: illustration
→ Filters: Must have "anime" tag → Posts 5 anime images
```

### Cycle 2:
```
[INFO] 🎲 Random whitelist tag selected: "scenery"
[INFO] Searching Pixiv for tags: illustration
→ Filters: Must have "scenery" tag → Posts 5 landscape images
```

### Cycle 3:
```
[INFO] 🎲 Random whitelist tag selected: "cute"
[INFO] Searching Pixiv for tags: illustration
→ Filters: Must have "cute" tag → Posts 5 cute images
```

## Benefits

✅ **Automatic Variety** - Different content theme each cycle  
✅ **No Manual Changes** - Bot handles theme rotation automatically  
✅ **Predictable Quality** - Each tag is pre-approved by you  
✅ **Separate Per Channel** - SFW and NSFW have different tag pools  
✅ **Easy to Customize** - Just edit the array in config.json  

## Disabling Random Tags

To disable and use static whitelist instead:

```json
{
  "whitelistedTags": ["anime", "cute"],  // Static whitelist
  "randomWhitelistTags": []               // Empty = disabled
}
```

Or simply remove the `randomWhitelistTags` field.

## Tag Suggestions

### SFW Popular Tags:
- `anime`, `manga`, `original`, `オリジナル`
- `fanart`, `fan art`, `二次創作`
- `scenery`, `landscape`, `風景`
- `cute`, `kawaii`, `かわいい`
- `portrait`, `character`, `キャラクター`
- `fantasy`, `sci-fi`, `ファンタジー`
- `girls`, `boys`, `女の子`, `男の子`
- `school`, `uniform`, `制服`

### NSFW Popular Tags:
- `bikini`, `swimsuit`, `水着`
- `lingerie`, `underwear`, `下着`
- `maid`, `メイド`
- `bunny girl`, `バニーガール`
- `catgirl`, `猫耳`
- `nurse`, `ナース`
- `elf`, `エルフ`
- `demon girl`, `悪魔`

## Best Practices

1. **Use Popular Tags** - Common tags have more content
2. **Mix English/Japanese** - Include both for better results
3. **5-10 Tags Recommended** - Good variety without too much randomness
4. **Test Each Tag** - Make sure each tag returns enough quality images
5. **Match Channel Theme** - SFW tags for SFW, NSFW tags for NSFW

## Combining with Other Filters

Random whitelist tags work alongside all other filters:

```json
{
  "randomWhitelistTags": ["anime", "fanart", "original"],  // Picks one random
  "blacklistedTags": ["gore", "violence"],                 // Always blocked
  "nsfwFilter": true,                                       // Always applied
  "minViews": 10000,                                        // Always checked
  "minBookmarks": 1000                                      // Always checked
}
```

**Filter Order:**
1. ✅ NSFW/SFW strict filter
2. ✅ Quality thresholds (views/bookmarks)
3. ✅ AI filter
4. ✅ Blacklist tags
5. ✅ **Random whitelist tag** (one from array)
6. ✅ Duplicate detection

## Logs

Watch for this log message:
```
[INFO] 🎲 Random whitelist tag selected: "anime"
```

This tells you which tag was chosen for that cycle.

## Troubleshooting

### No images found after adding random tags:
- Tags might be too specific (use broader tags)
- Try tags with more content (popular/common tags)
- Lower quality thresholds temporarily
- Check tag spelling (case-insensitive but must match Pixiv)

### Same tag appears too often:
- It's random, so repetition is normal
- Add more tags to the array for more variety
- Each cycle is independent with equal probability

### Want to force a specific tag:
- Remove `randomWhitelistTags` array
- Use static `whitelistedTags` instead:
  ```json
  "whitelistedTags": ["anime"]
  ```

## Example Full Configuration

```json
{
  "channels": [
    {
      "id": "SFW_CHANNEL",
      "name": "Anime Art",
      "enabled": true,
      "nsfwFilter": true,
      "nsfwOnly": false,
      "tags": ["illustration"],
      "minViews": 10000,
      "minBookmarks": 1000,
      "allowAI": false,
      "blacklistedTags": ["gore", "nsfw", "r-18"],
      "whitelistedTags": [],
      "randomWhitelistTags": ["anime", "fanart", "original", "cute", "scenery"]
    },
    {
      "id": "NSFW_CHANNEL",
      "name": "NSFW Art",
      "enabled": true,
      "nsfwFilter": false,
      "nsfwOnly": true,
      "tags": ["illustration"],
      "minViews": 5000,
      "minBookmarks": 500,
      "allowAI": false,
      "blacklistedTags": ["gore", "guro"],
      "whitelistedTags": [],
      "randomWhitelistTags": ["bikini", "lingerie", "maid", "sexy"]
    }
  ]
}
```

Each auto-post cycle, the bot will:
- SFW: Pick one of `anime/fanart/original/cute/scenery`
- NSFW: Pick one of `bikini/lingerie/maid/sexy`

This ensures consistent variety without manual intervention! 🎲
