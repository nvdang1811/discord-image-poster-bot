# Pixiv Refresh Token Guide

## ⚠️ Important Notice

**Pixiv API no longer supports username/password authentication directly.**  
You must use a refresh token instead.

## Method 1: Using Browser DevTools (Recommended)

This is the most reliable method:

### Steps:

1. **Open Pixiv Login Page**
   - Go to: https://app-api.pixiv.net/web/v1/login
   - Or use the Pixiv mobile app login page

2. **Open Developer Tools**
   - Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Go to the **Network** tab
   - Make sure "Preserve log" is checked

3. **Login to Pixiv**
   - Enter your username and password
   - Complete any 2FA if required
   - Click login

4. **Find the Token**
   - In the Network tab, look for a request to:
     - `https://oauth.secure.pixiv.net/auth/token`
   - Click on this request
   - Go to the **Response** tab
   - Find the JSON response containing `refresh_token`
   - Copy the entire refresh token value (it's a long string)

5. **Save the Token**
   - Paste it in your `.env` file as `PIXIV_REFRESH_TOKEN`

### Example Response:
```json
{
  "access_token": "...",
  "expires_in": 3600,
  "token_type": "bearer",
  "scope": "",
  "refresh_token": "YOUR_REFRESH_TOKEN_HERE",  ← Copy this!
  "user": { ... }
}
```

---

## Method 2: Using Node.js Package

Install the helper package:

```bash
npm install -g @book000/pixivts-oauth-login
```

Run the authentication:

```bash
pixiv-oauth-login
```

Follow the instructions and copy the refresh token.

---

## Method 3: Using Python Script

Download this script: https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362

Or save this code as `get_pixiv_token.py`:

```python
#!/usr/bin/env python

import requests
import hashlib
import time

CLIENT_ID = "MOBrBDS8blbauoSck0ZfDbtuzpyT"
CLIENT_SECRET = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj"
REDIRECT_URI = "https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback"

def get_refresh_token(username, password):
    time_str = time.strftime('%Y-%m-%dT%H:%M:%S+00:00', time.gmtime())
    hash_secret = hashlib.md5((time_str + CLIENT_SECRET).encode()).hexdigest()
    
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "get_secure_url": 1,
        "grant_type": "password",
        "username": username,
        "password": password,
    }
    
    headers = {
        "X-Client-Time": time_str,
        "X-Client-Hash": hash_secret,
    }
    
    response = requests.post(
        "https://oauth.secure.pixiv.net/auth/token",
        data=data,
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()["refresh_token"]
    else:
        raise Exception(f"Failed to get token: {response.text}")

if __name__ == "__main__":
    username = input("Pixiv Username: ")
    password = input("Pixiv Password: ")
    
    try:
        refresh_token = get_refresh_token(username, password)
        print(f"\n✅ Success! Your refresh token is:\n{refresh_token}")
    except Exception as e:
        print(f"❌ Error: {e}")
```

**Note:** This method may not work if Pixiv has updated their authentication system.

---

## Method 4: Using Pixiv iOS App (Advanced)

1. Install a network proxy tool (Charles Proxy, Fiddler, etc.)
2. Configure your iOS device to use the proxy
3. Open the Pixiv app and login
4. Capture the network traffic
5. Find the OAuth token request
6. Extract the refresh_token from the response

---

## Troubleshooting

### "Invalid grant" error
- Your refresh token may have expired
- Your Pixiv password was changed
- Try generating a new refresh token

### "Client ID unauthorized" error
- Pixiv has updated their API
- Use the browser DevTools method (most reliable)

### Token works but expires quickly
- Refresh tokens should last a long time (months/years)
- If it expires, the bot should handle re-authentication
- You may need to manually update it if your password changes

---

## Security Notes

⚠️ **Keep your refresh token secure!**
- Don't share it publicly
- Don't commit it to Git
- Store it only in the `.env` file
- The `.env` file is already in `.gitignore`

---

## Once You Have Your Token

1. Open `.env` file
2. Replace `your_pixiv_refresh_token_here` with your actual token:
   ```env
   PIXIV_REFRESH_TOKEN=your_actual_refresh_token_here
   ```
3. Save the file
4. Start the bot with `npm start`

---

**Need Help?** Check the main [README.md](README.md) for more information.
