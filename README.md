# Spotify Playlist Generator

A flexible command-line tool that allows you to create dynamic Spotify playlists based on various criteria:
- Create playlists from your liked songs by artists in a festival lineup
- Generate playlists from your Spotify listening history based on date ranges
- Build playlists from your recently played tracks

## Features

- **Festival Lineup Playlists**: Find songs you've liked from artists performing at festivals
- **History-Based Playlists**: Create playlists from your Spotify listening history within specific date ranges
- **Recent Activity Playlists**: Generate playlists from your recently played tracks
- **Flexible Date Handling**: Support for various date formats and timezones
- **Command-Line Interface**: Easy-to-use CLI for all functionality

## Requirements

- Python 3.6+
- Spotify account
- Spotify Developer API credentials

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/playlist-gen.git
   cd playlist-gen
   ```

2. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment**:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Spotify API Setup

1. Visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Create a new application
4. Note down the **Client ID** and **Client Secret**
5. Set the Redirect URI to `http://localhost:8888/callback` in your app settings

## Configuration

Create a `.env` file in the root directory with the following content:

```
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback

# Default Playlist ID (optional)
SPOTIFY_PLAYLIST_ID=your_default_playlist_id_here
```

Replace `your_client_id_here` and `your_client_secret_here` with your Spotify API credentials.

To get your playlist ID:
1. Open Spotify and navigate to the playlist you want to use
2. The ID is the string of characters after `playlist/` in the URL
   (e.g., from `https://open.spotify.com/playlist/5ztb6ETYzdpNUvJrbZRrDN`, the ID is `5ztb6ETYzdpNUvJrbZRrDN`)

## Usage

### Create a Playlist from Festival Lineup

```bash
python main.py festival [--url FESTIVAL_URL] [--playlist-id PLAYLIST_ID]
```

- `--url`: (Optional) URL to the festival lineup JSON
- `--playlist-id`: (Optional) Spotify playlist ID to add songs to

If you don't specify a URL, it will use the default Coachella lineup URL.

Example:
```bash
python main.py festival --playlist-id 5ztb6ETYzdpNUvJrbZRrDN
```

### Create a Playlist from Spotify History

```bash
python main.py history --file PATH_TO_JSON --start START_DATE --end END_DATE [--playlist-id PLAYLIST_ID]
```

- `--file`: Path to Spotify history JSON file
- `--start`: Start date in format 'YYYY-MM-DD'
- `--end`: End date in format 'YYYY-MM-DD'
- `--playlist-id`: (Optional) Spotify playlist ID to add songs to

Example:
```bash
python main.py history --file spotify_data/streaming_history.json --start 2023-01-01 --end 2023-03-31
```

### Create a Playlist from Recently Played Tracks

```bash
python main.py recent --start START_DATE --end END_DATE [--playlist-id PLAYLIST_ID]
```

- `--start`: Start date in format 'YYYY-MM-DD'
- `--end`: End date in format 'YYYY-MM-DD'
- `--playlist-id`: (Optional) Spotify playlist ID to add songs to

Example:
```bash
python main.py recent --start 2023-04-01 --end 2023-04-30
```

## Getting Your Spotify Data

To use the `history` command, you need your Spotify streaming history:

1. Request your data from [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Select "Extended streaming history"
3. Wait for the email with your data (usually takes a few days)
4. Extract the JSON files from the downloaded archive
5. Use these files with the `--file` parameter

## Troubleshooting

### Authentication Issues

- Make sure your Client ID and Client Secret are correct
- Check that your Redirect URI matches exactly what's in your Spotify Developer Dashboard
- If you get an error about invalid scopes, make sure you have proper permissions set in your app

### Date Parsing Errors

- Use the format 'YYYY-MM-DD' for dates
- If you're having timezone issues, specify your timezone in the .env file

### API Rate Limits

- Spotify has rate limits. If you hit them, wait a bit before trying again

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Spotipy](https://spotipy.readthedocs.io/) - Python library for the Spotify Web API
- [python-dotenv](https://github.com/theskumar/python-dotenv) - For managing environment variables
- [dateutil](https://dateutil.readthedocs.io/) - For flexible date parsing
