# The Playlist Generator
Transform your festival lineup into an epic Spotify playlist with just one click! 
This powerful tool takes a simple JSON file and magically converts it into your next favorite playlist. 
Currently supports adding tracks to your existing public or private playlists.

## Run Instructions
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd playlist-generator
   ```

2. Install required dependencies:
   ```bash
   pip install spotipy requests
   ```

3. Set up your environment variables (see Environment Variables section below)

4. Run the program:
   ```bash
   # First authenticate with Spotify
   python test_auth.py
   
   # Then run the main file to generate your playlist
   python main.py
   ```

The program will authenticate with Spotify, scrape the festival lineup, and add the corresponding tracks to your specified playlist.

## Enviornment Variables
The following environment variables need to be set:

- `SPOTIFY_CLIENT_ID`: Your Spotify application client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify application client secret
- `SPOTIFY_REDIRECT_URI`: The redirect URI configured for your Spotify application
- `SPOTIFY_PLAYLIST_ID`: The ID of the Spotify playlist you want to add songs to

You can obtain the client ID, secret, and configure the redirect URI by creating an application in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

The playlist ID can be found in the Spotify playlist URL (e.g., spotify:playlist:PLAYLIST_ID) or by right-clicking the playlist and selecting "Share > Copy Spotify URI".

## Notes
- The program currently only supports JSON files in the format provided by AEG's festival data API
- Artists not found on Spotify will be skipped
- The program will not add duplicate tracks to your playlist
- Rate limiting may occur if processing large festival lineups
- Make sure your Spotify account has the necessary permissions to modify the target playlist
- The first run will open a web browser for Spotify authentication
- After authentication, credentials are cached locally in the `.cache` file
