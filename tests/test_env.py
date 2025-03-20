import os
from dotenv import load_dotenv

print("=== Environment Variable Test ===")
print("Current directory:", os.getcwd())
print(".env file exists:", os.path.exists(".env"))

print("\nAttempting to load .env file...")
result = load_dotenv(verbose=True)
print("load_dotenv result:", result)

print("\nEnvironment Variables:")
print("SPOTIFY_REDIRECT_URI:", os.getenv('SPOTIFY_REDIRECT_URI', 'not set'))
print("SPOTIFY_CLIENT_ID exists:", os.getenv('SPOTIFY_CLIENT_ID') is not None)
print("SPOTIFY_CLIENT_SECRET exists:", os.getenv('SPOTIFY_CLIENT_SECRET') is not None)

# Try with an absolute path
print("\nTrying with absolute path...")
abs_path = os.path.join(os.getcwd(), '.env')
print("Absolute path:", abs_path)
print("File exists at absolute path:", os.path.exists(abs_path))
result = load_dotenv(dotenv_path=abs_path, verbose=True)
print("load_dotenv result with absolute path:", result)

print("\nEnvironment Variables after absolute path:")
print("SPOTIFY_REDIRECT_URI:", os.getenv('SPOTIFY_REDIRECT_URI', 'not set'))
print("SPOTIFY_CLIENT_ID exists:", os.getenv('SPOTIFY_CLIENT_ID') is not None)
print("SPOTIFY_CLIENT_SECRET exists:", os.getenv('SPOTIFY_CLIENT_SECRET') is not None) 