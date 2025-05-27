from tests/auth import authenticate_spotify

# Test function to verify Spotify authentication

def test_authentication():
    try:
        sp = authenticate_spotify()
        user_profile = sp.current_user()
        print("Authentication successful!")
        print(f"Logged in as: {user_profile['display_name']}")
    except Exception as e:
        print("Authentication failed:", e)

# Run the test
test_authentication() 