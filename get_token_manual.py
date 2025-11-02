"""
Pixiv Refresh Token Generator - Alternative Method
This uses a simpler approach with manual token retrieval
"""

print("=" * 70)
print("Pixiv Refresh Token - Manual Retrieval Guide")
print("=" * 70)
print()
print("Since the automated OAuth flow is complex, here's the manual method:")
print()
print("METHOD 1: Use an existing Pixiv app/tool")
print("-" * 70)
print("1. Download Pixiv iOS/Android app on your phone")
print("2. Use a tool like 'pixivpy' with a working authentication")
print("3. Or use this web tool: https://github.com/eggplants/get-pixivpy-token")
print()
print("METHOD 2: Extract from Pixiv mobile site")
print("-" * 70)
print("1. Open Chrome/Firefox in mobile device mode (F12 > Toggle device)")
print("2. Go to: https://www.pixiv.net/")
print("3. Login to your account")
print("4. Open DevTools > Application > Cookies")
print("5. Look for cookies related to authentication")
print()
print("METHOD 3: Use a working refresh token generator")
print("-" * 70)
print("Try this online tool:")
print("https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362")
print()
print("=" * 70)
print()

# For testing, let's also provide a direct way to test if a token works
print("If you already have a refresh token, you can test it:")
print()
token_test = input("Enter refresh token to test (or press Enter to skip): ").strip()

if token_test:
    import requests
    
    print("\nTesting token...")
    response = requests.post(
        "https://oauth.secure.pixiv.net/auth/token",
        data={
            "client_id": "MOBrBDS8blbauoSck0ZfDbtuzpyT",
            "client_secret": "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj",
            "grant_type": "refresh_token",
            "refresh_token": token_test,
        },
        headers={
            "User-Agent": "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)",
        }
    )
    
    if response.status_code == 200:
        print("✅ Token is VALID!")
        data = response.json()
        new_token = data.get('refresh_token', token_test)
        print(f"\nYour refresh token: {new_token}")
        print(f"\nAdd this to your .env file:")
        print(f"PIXIV_REFRESH_TOKEN={new_token}")
    else:
        print(f"❌ Token test failed: HTTP {response.status_code}")
        print(response.text)
else:
    print("\nNo token provided. Follow the methods above to get one.")
