# Discord Bot Deployment Guide

## Option 1: Railway.app (Recommended - Easiest)

### Prerequisites
- GitHub account
- Railway.app account (free)
- Your bot code pushed to GitHub

### Steps:

1. **Prepare Your Repository**
   ```bash
   # Make sure .env is in .gitignore (it should be)
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to https://railway.app
   - Sign up/Login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your DiscordImageBot repository

3. **Configure Environment Variables**
   In Railway dashboard, go to Variables tab and add:
   ```
   DISCORD_TOKEN=your_token_here
   DISCORD_CLIENT_ID=your_client_id
   PIXIV_REFRESH_TOKEN=your_pixiv_token
   AUTO_POST_ENABLED=true
   AUTO_POST_INTERVAL=300000
   DEFAULT_TAGS=illustration
   NSFW_FILTER=false
   SUPPRESS_NOTIFICATIONS=true
   ALLOW_AI_GENERATED=false
   BLACKLISTED_TAGS=gore,violence,guro,ntr
   WHITELISTED_TAGS=
   LOG_LEVEL=INFO
   MIN_VIEWS=10000
   MIN_BOOKMARKS=1000
   BATCH_POST_COUNT=5
   ```

4. **Deploy**
   - Railway will auto-detect Node.js and deploy
   - Your bot will start automatically
   - Check logs to confirm it's running

### Cost:
- Free tier: $5/month credit (enough for small bots)
- Bot usage typically costs $1-3/month

---

## Option 2: Render.com (Free Tier)

### Steps:

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select your DiscordImageBot repo

3. **Configure Service**
   - Name: `discord-image-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add all variables from your `.env` file

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes first time)

### Limitations:
- Free tier sleeps after 15 min of inactivity
- Need to ping service to keep awake (can use cron-job.org)

---

## Option 3: DigitalOcean (Best for Production)

### Prerequisites
- DigitalOcean account ($100 free credit for new users)
- Basic Linux knowledge

### Steps:

1. **Create Droplet**
   - OS: Ubuntu 22.04 LTS
   - Plan: Basic ($4/month)
   - Add SSH key for access

2. **Connect to Server**
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Node.js**
   ```bash
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

4. **Upload Your Bot**
   ```bash
   # On your local machine
   scp -r DiscordImageBot root@your_server_ip:/root/
   ```

5. **Setup Bot on Server**
   ```bash
   cd /root/DiscordImageBot
   npm install
   
   # Create .env file
   nano .env
   # Paste your environment variables, save with Ctrl+X
   
   # Start bot with PM2
   pm2 start src/index.js --name discord-bot
   pm2 save
   pm2 startup
   ```

6. **Configure PM2 Auto-Restart**
   ```bash
   # Bot will auto-restart on crashes and server reboots
   pm2 startup systemd
   pm2 save
   ```

### PM2 Commands:
```bash
pm2 status              # Check bot status
pm2 logs discord-bot    # View logs
pm2 restart discord-bot # Restart bot
pm2 stop discord-bot    # Stop bot
```

### Cost:
- $4-6/month for basic droplet
- Most reliable option

---

## Option 4: Docker + Any Cloud Provider

### Create Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "start"]
```

### Create .dockerignore:

```
node_modules
logs
.env
.git
*.md
temp
```

### Deploy to Fly.io:

1. **Install Flyctl**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Deploy**
   ```bash
   fly launch
   fly secrets set DISCORD_TOKEN=your_token
   fly secrets set PIXIV_REFRESH_TOKEN=your_token
   # ... add all env vars
   fly deploy
   ```

---

## Comparison Table

| Platform | Cost | Ease | Performance | Free Tier |
|----------|------|------|-------------|-----------|
| Railway.app | $1-3/mo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $5 credit/mo |
| Render.com | Free | ⭐⭐⭐⭐ | ⭐⭐⭐ | Yes (sleeps) |
| DigitalOcean | $4-6/mo | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $100 credit |
| Fly.io | $1-3/mo | ⭐⭐⭐ | ⭐⭐⭐⭐ | 3 VMs free |
| AWS EC2 | $3-10/mo | ⭐⭐ | ⭐⭐⭐⭐⭐ | 1 year free |

---

## Recommended Setup

**For Beginners:** Railway.app
- Easiest setup
- No server management
- Auto-deployments from GitHub
- Good free tier

**For Production:** DigitalOcean
- Most reliable
- Full control
- Best value for money
- 99.99% uptime

**For Free (with limitations):** Render.com
- Completely free
- Will sleep after inactivity
- Can use uptimerobot.com to keep awake

---

## Post-Deployment Checklist

- [ ] Bot shows as online in Discord
- [ ] Auto-posting works (check channels)
- [ ] Commands respond (`/help`, `/pixivranking`)
- [ ] Logs are accessible
- [ ] Daily ranking scheduled for 23:55
- [ ] Environment variables are secure (not in public repo)
- [ ] Set up monitoring/alerts (optional)

---

## Monitoring & Maintenance

### Check Bot Status:
- Railway/Render: Check dashboard logs
- DigitalOcean: `pm2 logs discord-bot`

### Update Bot:
```bash
# Railway/Render: Just push to GitHub
git push origin main

# DigitalOcean:
ssh root@your_server_ip
cd /root/DiscordImageBot
git pull
npm install
pm2 restart discord-bot
```

### View Logs:
- Railway: Dashboard → Logs tab
- Render: Dashboard → Logs tab  
- DigitalOcean: `pm2 logs discord-bot`

---

## Troubleshooting

### Bot Not Starting:
1. Check logs for errors
2. Verify all environment variables are set
3. Ensure Node.js version is 18+
4. Check if Pixiv token is valid

### Out of Memory:
- Increase server RAM (upgrade plan)
- Or optimize image history size in config

### API Rate Limiting:
- Check Pixiv API limits
- Reduce posting frequency in config
- Add delays between requests

---

## Security Notes

⚠️ **Never commit `.env` file to GitHub!**

- Always use environment variables in deployment
- Keep tokens secure
- Regularly rotate API tokens
- Use `.gitignore` to exclude sensitive files

---

## Need Help?

- Railway: https://railway.app/help
- Render: https://render.com/docs
- DigitalOcean: https://www.digitalocean.com/community
- Discord.js: https://discord.js.org
