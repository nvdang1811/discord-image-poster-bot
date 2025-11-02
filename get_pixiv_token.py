"""
Pixiv Refresh Token Generator
This script helps you get a refresh token for Pixiv API authentication.
"""

import requests
import hashlib
import time
import json
from urllib.parse import urlparse, parse_qs

# Pixiv OAuth constants (these may change over time)
CLIENT_ID = "MOBrBDS8blbauoSck0ZfDbtuzpyT"
CLIENT_SECRET = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj"
HASH_SECRET = "28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c"

def s256(data):
    """Generate S256 hash"""
    return hashlib.sha256(data.encode('ascii')).hexdigest()

def oauth_pkce():
    """Generate code verifier and challenge for PKCE"""
    from secrets import token_urlsafe
    code_verifier = token_urlsafe(32)
    code_challenge = s256(code_verifier)
    return code_verifier, code_challenge

def get_refresh_token_interactive():
    """
    Interactive method to get refresh token
    You'll need to manually login via browser
    """
    print("=" * 60)
    print("Pixiv Refresh Token Generator")
    print("=" * 60)
    print()
    print("Instructions:")
    print("1. A URL will be displayed below")
    print("2. Open it in your browser")
    print("3. Login to your Pixiv account")
    print("4. After login, you'll be redirected to a 'pixiv://...' URL")
    print("5. Copy the ENTIRE URL from your browser's address bar")
    print("6. Paste it here when prompted")
    print()
    
    code_verifier, code_challenge = oauth_pkce()
    
    # Generate login URL
    login_url = (
        f"https://app-api.pixiv.net/web/v1/login"
        f"?code_challenge={code_challenge}"
        f"&code_challenge_method=S256"
        f"&client=pixiv-android"
    )
    
    print("=" * 60)
    print("STEP 1: Open this URL in your browser:")
    print("=" * 60)
    print(login_url)
    print()
    print("=" * 60)
    print("STEP 2: After logging in, copy the redirect URL")
    print("        (It should start with: pixiv://...)")
    print("=" * 60)
    print()
    
    redirect_url = input("Paste the redirect URL here: ").strip()
    
    # Parse the code from redirect URL
    try:
        parsed = urlparse(redirect_url)
        params = parse_qs(parsed.query)
        code = params.get('code', [None])[0]
        
        if not code:
            print("❌ Error: Could not find 'code' parameter in URL")
            return None
            
    except Exception as e:
        print(f"❌ Error parsing URL: {e}")
        return None
    
    # Exchange code for tokens
    print()
    print("Exchanging code for refresh token...")
    
    response = requests.post(
        "https://oauth.secure.pixiv.net/auth/token",
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
            "code_verifier": code_verifier,
            "grant_type": "authorization_code",
            "include_policy": "true",
            "redirect_uri": "https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback",
        },
        headers={
            "User-Agent": "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)",
            "App-OS-Version": "14.6",
            "App-OS": "ios",
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        refresh_token = data.get('refresh_token')
        if refresh_token:
            print()
            print("=" * 60)
            print("✅ SUCCESS! Your refresh token is:")
            print("=" * 60)
            print(refresh_token)
            print("=" * 60)
            print()
            print("Copy this token and paste it in your .env file as:")
            print(f"PIXIV_REFRESH_TOKEN={refresh_token}")
            print()
            return refresh_token
        else:
            print("❌ Error: No refresh token in response")
            print(json.dumps(data, indent=2))
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(response.text)
    
    return None

if __name__ == "__main__":
    try:
        get_refresh_token_interactive()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("\nPlease report this error if it persists.")
