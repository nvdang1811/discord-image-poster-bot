#!/usr/bin/env python3
"""
Simple Pixiv Token Tester and Getter
If you have a token from another source, test it here
"""

import requests
import json

def test_token(refresh_token):
    """Test if a refresh token works"""
    print(f"Testing token: {refresh_token[:20]}...")
    
    response = requests.post(
        "https://oauth.secure.pixiv.net/auth/token",
        data={
            "client_id": "MOBrBDS8blbauoSck0ZfDbtuzpyT",
            "client_secret": "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj",
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "include_policy": "true",
        },
        headers={
            "User-Agent": "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)",
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        new_refresh = data.get('refresh_token')
        access_token = data.get('access_token')
        
        print("\n" + "=" * 70)
        print("✅ SUCCESS! Token is valid!")
        print("=" * 70)
        print(f"\nRefresh Token: {new_refresh}")
        print(f"Access Token: {access_token[:50]}...")
        print(f"\n📝 Add this to your .env file:")
        print(f"PIXIV_REFRESH_TOKEN={new_refresh}")
        print("=" * 70)
        return True
    else:
        print(f"\n❌ Token is invalid or expired")
        print(f"HTTP {response.status_code}: {response.text}")
        return False

if __name__ == "__main__":
    print("=" * 70)
    print("Pixiv Refresh Token Tester")
    print("=" * 70)
    print("\nEASIEST METHOD TO GET A TOKEN:")
    print("-" * 70)
    print("Use this GitHub tool (most reliable):")
    print("https://github.com/eggplants/get-pixivpy-token")
    print()
    print("Or install and run:")
    print("  pip install gppt")
    print("  gppt login")
    print("-" * 70)
    print()
    
    token = input("If you have a token to test, paste it here (or Enter to exit): ").strip()
    
    if token:
        test_token(token)
    else:
        print("\nExiting. Get a token using the method above, then run this again.")
