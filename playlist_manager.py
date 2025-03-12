from utils import date_to_unix_timestamp_ms
def get_last_played_songs(sp, start_date, end_date):
    # Convert date strings to Unix timestamps in milliseconds
    timezone_str = "US/Mountain"
    start_timestamp = date_to_unix_timestamp_ms(start_date, timezone_str)
    end_timestamp = date_to_unix_timestamp_ms(end_date, timezone_str)
    matching_tracks = []
    if not start_timestamp or not end_timestamp:
        print("Invalid date format. Please use 'YYYY-MM-DD HH:MM:SS' format.")
        return []
    results = sp.current_user_recently_played(limit=50, before=end_timestamp)
    print(results)
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])
        print(results['next'])
    # go through songs and eliminate those that are after the end timestamp
    for item in tracks:
        track = item['track']
        track_played_at = item['played_at']
        if track_played_at > end_date:
            continue
        else:
            matching_tracks.append(track['uri'])
    return matching_tracks


def get_liked_songs_from_artist_list(sp, artist_list):
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
            #print(f"Found matching track: {', '.join(track_artists)} - {track['name']}")
    return matching_tracks


def add_tracks_to_playlist(sp, playlist_id, track_uris):
    results = sp.playlist_items(playlist_id)
    songs = results['items']
    #get all songs in the playlist
    while results['next']:
        results = sp.next(results)
        songs.extend(results['items'])
    #clean songs for only uris
    clean_songs = [song['track']['uri'] for song in songs]
    #remove duplicates between the playlist and the new songs
    songs_to_add = list(set(track_uris) - set(clean_songs))
    #add tracks to the playlist
    print(f"Adding {len(songs_to_add)} tracks to playlist '{playlist_id}'.")
    sp.playlist_add_items(playlist_id, songs_to_add)
    print(f"Added {len(songs_to_add)} tracks to playlist '{playlist_id}'.") 