import argparse
from auth import authenticate_spotify, get_playlist_id
from playlist_manager import get_liked_songs_from_artist_list, add_tracks_to_playlist, get_last_played_songs, get_track_uris_from_spotify
from festival_parser import scrape_festival_lineup
from utils import process_json_file, get_songs_in_time_range, ensure_datetime

def create_playlist_from_spotify_json(sp, playlist_id, file_path, start_date, end_date):
    """
    Creates a playlist from a Spotify streaming history JSON file for a specified date range.

    Args:
        sp: Spotify client object from spotipy
        playlist_id: ID of the playlist to add songs to
        file_path: Path to the Spotify streaming history JSON file
        start_date: Start date in 'YYYY-MM-DD' format
        end_date: End date in 'YYYY-MM-DD' format
    """
    songs = process_json_file(file_path)
    start_dt = ensure_datetime(start_date)
    end_dt = ensure_datetime(end_date)
    songs_in_time_range = get_songs_in_time_range(songs, start_dt, end_dt)
    track_uris = get_track_uris_from_spotify(sp, songs_in_time_range)
    add_tracks_to_playlist(sp, playlist_id, track_uris)
    print(f"Added {len(track_uris)} tracks to playlist from your Spotify history between {start_date} and {end_date}")


def create_playlist_from_last_played_songs(sp, playlist_id, start_date):
    """
    Creates a playlist from recently played songs for a specified date range.

    Args:
        sp: Spotify client object from spotipy
        playlist_id: ID of the playlist to add songs to
    """
    start_date = ensure_datetime(start_date)
    last_played_songs = get_last_played_songs(sp, start_date)
    add_tracks_to_playlist(sp, playlist_id, last_played_songs)


def create_playlist_from_artist_list(sp, playlist_id, lineup_url=None):
    """
    Creates a playlist from liked songs of artists in a festival lineup.

    Args:
        sp: Spotify client object from spotipy
        playlist_id: ID of the playlist to add songs to
        lineup_url: Optional URL to the festival lineup JSON. If not provided, uses default Coachella lineup URL.
    """
    if not lineup_url:
        lineup_url = 'https://amp-prod-aeg-festivaldata.s3.amazonaws.com/app/696/sxxI03CJN0bdFiba/artists.json'
    
    artists = scrape_festival_lineup(lineup_url)
    print(f"Found {len(artists)} artists in the festival lineup")
    
    # get liked songs from artist list
    liked_lineup_song_uris = get_liked_songs_from_artist_list(sp, artists)
    print(f"Found {len(liked_lineup_song_uris)} liked songs from these artists")
    
    # add lineup songs to existing playlist
    add_tracks_to_playlist(sp, playlist_id, liked_lineup_song_uris)
    print(f"Added {len(liked_lineup_song_uris)} tracks to playlist from festival artists")


def parse_arguments():
    parser = argparse.ArgumentParser(description='Spotify Playlist Generator')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Festival lineup command
    festival_parser = subparsers.add_parser('festival', help='Create a playlist from festival lineup artists')
    festival_parser.add_argument('--url', type=str, help='URL to the festival lineup JSON')
    festival_parser.add_argument('--playlist-id', type=str, help='Playlist ID to add songs to')
    
    # History command
    history_parser = subparsers.add_parser('history', help='Create a playlist from Spotify history JSON')
    history_parser.add_argument('--file', type=str, required=True, help='Path to Spotify history JSON file')
    history_parser.add_argument('--start', type=str, required=True, help='Start date (YYYY-MM-DD HH:MM:SS)')
    history_parser.add_argument('--end', type=str, required=True, help='End date (YYYY-MM-DD HH:MM:SS)')
    history_parser.add_argument('--playlist-id', type=str, help='Playlist ID to add songs to')
    
    # Recently played command
    recent_parser = subparsers.add_parser('recent', help='Create a playlist from recently played songs')
    recent_parser.add_argument('--start', type=str, required=True, help='Start date (YYYY-MM-DD HH:MM:SS)')
    recent_parser.add_argument('--playlist-id', type=str, help='Playlist ID to add songs to')
    
    return parser.parse_args()


def main():
    args = parse_arguments()
    # Authenticate with Spotify
    sp = authenticate_spotify()
    
    # Get playlist ID (from args or config)
    playlist_id = args.playlist_id if hasattr(args, 'playlist_id') and args.playlist_id else get_playlist_id()
    if args.command == 'festival':
        create_playlist_from_artist_list(sp, playlist_id, args.url)
    elif args.command == 'history':
        create_playlist_from_spotify_json(sp, playlist_id, args.file, args.start, args.end)
    elif args.command == 'recent':
        create_playlist_from_last_played_songs(sp, playlist_id, args.start)
    else:
        print("Please specify a command. Use --help for more information.")


if __name__ == "__main__":
    main()
