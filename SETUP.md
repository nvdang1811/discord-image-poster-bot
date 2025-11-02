# Quick Setup Guide 🚀

Follow these steps to get your Discord Pixiv Bot up and running quickly!

## Step 1: Install Node.js
Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Get Your Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Click "New Application" → Give it a name
3. Go to "Bot" section → Click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
5. Click "Reset Token" → Copy the token

## Step 4: Invite Bot to Your Server

1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ bot
3. Select bot permissions:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
4. Copy the generated URL
5. Open it in your browser and invite bot to your server

## Step 5: Get Pixiv Refresh Token

**⚠️ Important: Username/password login is no longer supported by Pixiv API.**

### Recommended Method: Using gpcracker/pixiv-auth

1. Install the tool:
```bash
npm install -g pixiv-auth
```

2. Run the authentication:
```bash
pixiv-auth login
```

3. Follow the browser prompt to login
4. Copy the `refresh_token` from the output

### Alternative Method: Using Python Script

1. Install dependencies:
```bash
pip install gpsoauth
```

2. Download and run this script: https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362

3. Follow the instructions and copy your refresh token

### Manual Method: Browser DevTools

1. Go to https://app-api.pixiv.net/web/v1/login
2. Open Browser DevTools (F12) → Network tab
3. Login with your Pixiv account
4. Look for POST request to `https://oauth.secure.pixiv.net/auth/token`
5. In the response, find and copy the `refresh_token` value

## Step 6: Get Discord Channel ID

1. Open Discord
2. Go to User Settings → Advanced → Enable "Developer Mode"
3. Right-click on the channel you want bot to post in
4. Click "Copy ID"

## Step 7: Configure Environment Variables

Edit the `.env` file:

```env
# Required
DISCORD_TOKEN=paste_your_discord_bot_token_here
DISCORD_CLIENT_ID=paste_your_discord_client_id_here
TARGET_CHANNEL_ID=paste_your_channel_id_here
PIXIV_REFRESH_TOKEN=paste_your_pixiv_refresh_token_here

# Optional (defaults are fine)
PREFIX=!
AUTO_POST_ENABLED=false
AUTO_POST_INTERVAL=3600000
DEFAULT_TAGS=illustration
NSFW_FILTER=true
```

## Step 8: Start the Bot

```bash
npm start
```

You should see:
```
✅ Bot is ready! Logged in as YourBot#1234
📊 Serving 1 guild(s)
✅ Successfully authenticated with Pixiv
```

## Step 9: Test Commands

In your Discord server, try:

```
!help
!fetchpixiv cat 3
!pixivranking day 5
```

## Step 10: Enable Auto-Posting (Optional)

1. Set the target channel (if not already in .env):
   ```
   !setchannel #pixiv-art
   ```

2. Enable auto-posting:
   ```
   !autopost on
   ```

## Troubleshooting

### Bot doesn't respond
- Make sure "Message Content Intent" is enabled in Discord Developer Portal
- Check bot has permissions in the channel
- Verify you're using correct prefix (default: `!`)

### Pixiv authentication failed
- Double-check your refresh token
- Try generating a new refresh token
- Ensure your Pixiv account is active

### Bot crashes on start
- Run `npm install` again
- Check all required fields in `.env` are filled
- Look at error messages in terminal

## Need More Help?

Check the full [README.md](README.md) for detailed documentation.

---

**🎉 Congratulations! Your bot is now ready to fetch and post amazing artwork from Pixiv!**
