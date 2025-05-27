import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This needs to be called once at the module level
load_dotenv()

def authenticate_spotify():
    """
    Authenticate with Spotify using credentials from environment variables.
    Returns a authenticated Spotify client object.
    """
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8000/callback')

    if not client_id or not client_secret:
        raise ValueError("Spotify credentials not found. Please check your .env file contains SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET")

    scope = "user-library-read playlist-modify-public playlist-modify-private playlist-read-private user-read-recently-played "
    
    try:
        sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scope=scope
        ))
        return sp
    except Exception as e:
        raise Exception(f"Failed to authenticate with Spotify: {str(e)}")

def get_playlist_id():
    """
    Get the default playlist ID from environment variables.
    Returns the playlist ID or None if not set.
    """
    return os.getenv('SPOTIFY_PLAYLIST_ID')