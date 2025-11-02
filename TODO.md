# Discord Pixiv Image Bot - Todo List

## Project Overview
Build a Discord bot that can fetch and post images from Pixiv to a targeted Discord channel.

---

## Tasks

### 1. Set up project structure and dependencies
- [x] Initialize the project with package.json
- [x] Install discord.js for Discord API interaction
- [x] Install pixiv-api or similar library for Pixiv integration
- [x] Set up basic folder structure (src/, config/, etc.)

### 2. Configure environment variables and credentials
- [x] Create .env file for storing sensitive data
- [x] Add Discord bot token
- [x] Add Pixiv credentials (username/password or refresh token)
- [x] Add target channel ID
- [x] Add .env to .gitignore

### 3. Implement Discord bot connection
- [x] Create main bot file with Discord.js client initialization
- [x] Add event handlers (ready, messageCreate)
- [x] Establish connection to Discord using bot token
- [x] Test basic connectivity

### 4. Implement Pixiv API integration
- [x] Set up Pixiv API client with authentication
- [x] Implement functions to search/fetch images by tags
- [x] Add support for rankings and specific criteria
- [x] Handle API rate limits and errors

### 5. Create image fetching logic
- [x] Implement functions to retrieve images based on search criteria
- [x] Add support for tags, popularity, and date range filters
- [x] Filter content appropriately (SFW/NSFW)
- [x] Handle pagination if needed

### 6. Implement image posting to Discord
- [x] Create function to post fetched images to the targeted Discord channel
- [x] Include image embeds with metadata (artist name, title, Pixiv link, tags)
- [x] Handle Discord file size limits
- [x] Format messages appropriately

### 7. Add command system
- [x] Implement bot commands (e.g., !fetchpixiv <tags>, !setpixivchannel)
- [x] Use Discord slash commands or prefix commands
- [x] Add permission checks for admin commands
- [x] Create help command

### 8. Implement scheduling/automation (optional)
- [x] Add ability to automatically post images at regular intervals
- [x] Use node-cron or similar scheduling library
- [x] Allow configuration of posting frequency and criteria
- [x] Add start/stop commands for automation

### 9. Add error handling and logging
- [x] Implement comprehensive error handling for API failures
- [x] Handle network issues gracefully
- [x] Catch and log Discord errors
- [x] Set up logging system to track bot activity
- [x] Add debug mode for troubleshooting

### 10. Create configuration file and documentation
- [x] Create config.json for non-sensitive settings
- [x] Configure default tags and posting frequency
- [x] Write README.md with setup instructions
- [x] Document required Discord permissions
- [x] Create usage guide with command examples

### 11. Test and deploy
- [ ] Test bot functionality in a test Discord server
- [ ] Verify image fetching works correctly
- [ ] Test posting to Discord channels
- [ ] Validate all commands work as expected
- [ ] Deploy to hosting service (Heroku, Railway, VPS) or run locally
- [ ] Monitor initial deployment for issues

---

## Notes
- Ensure compliance with both Discord and Pixiv Terms of Service
- Consider implementing NSFW filtering based on Discord channel settings
- Keep API keys and tokens secure
- Implement proper rate limiting to avoid API bans

## Completed! ✅

All core functionality has been implemented. The bot is ready for testing and deployment.

