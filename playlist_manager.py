from utils import date_to_unix_timestamp_ms

def get_track_uris_from_spotify(sp, songs):
    """
    Retrieves Spotify track URIs for a list of songs.

    Args:
        sp: Spotify client object from spotipy
        songs: List of dictionaries containing song info with 'artistName' and 'trackName' keys

    Returns:
        list: List of Spotify track URIs for found songs. Songs not found on Spotify are skipped.
    """
    track_uris = []
    #From a list containing song names, get the track uris from spotify
    for song in songs:
        artist = song['artistName']
        track = song['trackName']
        results = sp.search(q="artist:" + artist + " track:" + track, type='track')
        if len(results['tracks']['items'])>0:
            track_uris.append(results['tracks']['items'][0]['uri'])
        else:
            print(f"No track found for {artist} - {track}")
    return track_uris

def get_last_played_songs(sp, start_date):
    """
    Retrieves recently played songs from Spotify within a specified start date.
    Limited to last 50 songs only, no matter the date range. Designed to handle larger functionality, but unfortunately Spotify only allows getting the last 50 songs listened to.

    Args:
        sp: Spotify client object from spotipy
        start_date: Start date in 'YYYY-MM-DD' format
    Returns:
        list: List of Spotify track URIs for songs played after start_date
    """
    matching_tracks = []
    # Convert start_date to Unix timestamp in milliseconds
    start_timestamp_ms = date_to_unix_timestamp_ms(start_date)
    if not start_timestamp_ms:
        print("Invalid date format. Please use 'YYYY-MM-DD HH:MM:SS' format.")
        return []
    results = sp.current_user_recently_played(limit=50, after=start_timestamp_ms)
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])
    # go through songs and add to matching tracks
    for item in tracks:
        track = item['track']
        matching_tracks.append(track['uri'])
    return matching_tracks


def get_liked_songs_from_artist_list(sp, artist_list):
    """
    Retrieves liked songs from the user's library that are by artists in the provided list.

    Args:
        sp: Spotify client object from spotipy
        artist_list: List of artist names to match against

    Returns:
        list: List of Spotify track URIs for liked songs by matching artists
    """
    matching_tracks = []
    results = sp.current_user_saved_tracks()
    my_tracks = results['items']
    while results['next']:
        results = sp.next(results)
        my_tracks.extend(results['items'])
    
    for item in my_tracks:
        track = item['track']  # Access the track data from the item
        track_artists = [artist['name'] for artist in track['artists']]  # Get all artists
        if any(artist.lower() in [a.lower() for a in track_artists] for artist in artist_list):
            matching_tracks.append(track['uri'])
    return matching_tracks


def add_tracks_to_playlist(sp, playlist_id, track_uris):
    """
    Adds tracks to a specified Spotify playlist in batches of 100 to respect API limits.

    Args:
        sp: Spotify client object from spotipy
        playlist_id: ID of the playlist to add songs to
        track_uris: List of track URIs to add to the playlist
    """
    # Get existing songs in playlist
    results = sp.playlist_items(playlist_id)
    songs = results['items']
    while results['next']:
        results = sp.next(results)
        songs.extend(results['items'])
    
    # Clean songs for only URIs
    clean_songs = [song['track']['uri'] for song in songs]
    
    # Remove duplicates between the playlist and the new songs
    songs_to_add = list(set(track_uris) - set(clean_songs))
    
    # Add tracks in batches of 100
    batch_size = 100
    total_added = 0
    
    for i in range(0, len(songs_to_add), batch_size):
        batch = songs_to_add[i:i + batch_size]
        sp.playlist_add_items(playlist_id, batch)
        total_added += len(batch)
        print(f"Added batch of {len(batch)} tracks to playlist '{playlist_id}'.")
    
    print(f"Successfully added {total_added} tracks to playlist '{playlist_id}'.") 