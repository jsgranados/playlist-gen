from auth import authenticate_spotify, get_playlist_id
from playlist_manager import get_liked_songs_from_artist_list, add_tracks_to_playlist
from festival_parser import scrape_festival_lineup


def main():
    # Authenticate and get Spotify client
    sp = authenticate_spotify()
    # get artist names from festival lineup. Using the 2024 Coachella lineup as an example.
    # Replace the url with the JSON you want to use
    lineup_url = 'https://amp-prod-aeg-festivaldata.s3.amazonaws.com/app/696/sxxI03CJN0bdFiba/artists.json'
    artists = scrape_festival_lineup(lineup_url)
    # get liked songs from artist list
    liked_lineup_song_uris = get_liked_songs_from_artist_list(sp, artists)
    # add lineup songs to existing playlist
    playlist_id = get_playlist_id()
    add_tracks_to_playlist(sp, playlist_id, liked_lineup_song_uris)


if __name__ == "__main__":
    main()
