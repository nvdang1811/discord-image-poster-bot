# Quality Filtering & Batch Posting

## Overview
The bot now includes quality filtering to ensure only popular, high-quality artwork is posted. It will automatically search and collect images until it has enough that meet your quality standards.

## Configuration

### Environment Variables (.env)

```properties
# Quality Thresholds
MIN_VIEWS=1000              # Minimum views required
MIN_BOOKMARKS=100           # Minimum bookmarks required
BATCH_POST_COUNT=5          # Number of images to collect before posting
```

### How It Works

1. **Quality Filtering**: Images are filtered by:
   - Minimum views (default: 1000)
   - Minimum bookmarks (default: 100)
   - All other filters (NSFW, AI, tags, duplicates)

2. **Batch Collection**: 
   - Bot searches for images repeatedly
   - Filters each batch for quality
   - Continues until it collects 5 quality images
   - Maximum 10 search attempts to prevent infinite loops

3. **Posting**: Once 5 quality images are collected, they're all posted together

## Adjusting Thresholds

### For More Selective (Higher Quality)
```properties
MIN_VIEWS=5000
MIN_BOOKMARKS=500
```

### For Less Selective (More Variety)
```properties
MIN_VIEWS=500
MIN_BOOKMARKS=50
```

### For Very Popular Only
```properties
MIN_VIEWS=10000
MIN_BOOKMARKS=1000
```

### Disable Quality Filtering
```properties
MIN_VIEWS=0
MIN_BOOKMARKS=0
```

## Batch Size

Change how many images are posted at once:

```properties
BATCH_POST_COUNT=3    # Post 3 images at a time
BATCH_POST_COUNT=5    # Post 5 images at a time (default)
BATCH_POST_COUNT=10   # Post 10 images at a time
```

## Search Strategy

The bot searches using `popular_desc` sort to find popular artwork first. This increases the chance of finding quality images quickly.

If the bot can't find enough quality images after 10 attempts, it will post whatever it has collected.

## Tips

1. **Balance Thresholds**: Too high = bot might not find enough images
2. **Monitor Logs**: Check logs to see filtering statistics
3. **Adjust Tags**: Use more specific tags if not finding quality results
4. **Popular Tags**: Tags like "original", "fanart", or specific series names yield better results

## Example Configurations

### Anime Fan Art (Popular)
```properties
DEFAULT_TAGS=anime,fanart
MIN_VIEWS=2000
MIN_BOOKMARKS=200
BATCH_POST_COUNT=5
```

### Original Art (High Quality)
```properties
DEFAULT_TAGS=original,illustration
MIN_VIEWS=5000
MIN_BOOKMARKS=500
BATCH_POST_COUNT=3
```

### Varied Content (More Relaxed)
```properties
DEFAULT_TAGS=illustration
MIN_VIEWS=500
MIN_BOOKMARKS=50
BATCH_POST_COUNT=10
```

## Statistics in Logs

Watch for log messages like:
- `Collected 3/5 quality images (attempt 2)` - Shows progress
- `Filtered low-view artwork: 12345 (500 views < 1000)` - Shows filtering in action
- `Auto-posted 5 illustrations to #channel` - Confirms successful batch post
