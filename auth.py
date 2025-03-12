import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os

# Function to authenticate and return a Spotify client object
def authenticate_spotify():
    SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
    SPOTIFY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI')

    scope = "user-library-read playlist-modify-public playlist-modify-private user-read-recently-played"
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=SPOTIFY_CLIENT_ID,
                                                   client_secret=SPOTIFY_CLIENT_SECRET,
                                                   redirect_uri=SPOTIFY_REDIRECT_URI,
                                                   scope=scope))
    return sp

def get_playlist_id():
    SPOTIFY_PLAYLIST_ID = os.getenv('SPOTIFY_PLAYLIST_ID')
    return SPOTIFY_PLAYLIST_ID