from auth import authenticate_spotify, get_playlist_id
from playlist_manager import get_liked_songs_from_artist_list, add_tracks_to_playlist, get_last_played_songs
from festival_parser import scrape_festival_lineup

def create_time_bounded_playlist(sp):
    # get last played songs
    start_date = "2025-03-08 20:00:00"
    end_date = "2025-03-09 03:00:00"
    last_played_songs = get_last_played_songs(sp, start_date, end_date)
    # create playlist
    #playlist_id = get_playlist_id()
    #add_tracks_to_playlist(sp, playlist_id, last_played_songs)


def get_festival_lineup_to_playlist(sp):
    # get artist names from festival lineup. Using the 2024 Coachella lineup as an example.
    # Replace the url with the JSON you want to use
    lineup_url = 'https://amp-prod-aeg-festivaldata.s3.amazonaws.com/app/696/sxxI03CJN0bdFiba/artists.json'
    artists = scrape_festival_lineup(lineup_url)
    # get liked songs from artist list
    liked_lineup_song_uris = get_liked_songs_from_artist_list(sp, artists)
    # add lineup songs to existing playlist
    playlist_id = get_playlist_id()
    add_tracks_to_playlist(sp, playlist_id, liked_lineup_song_uris)


def main():
    # Authenticate and get Spotify client
    sp = authenticate_spotify()
    # if you want to add the festival lineup to a playlist
    #get_festival_lineup_to_playlist(sp)
    # if you want to add the last played songs to a playlist
    create_time_bounded_playlist(sp)
if __name__ == "__main__":
    main()
