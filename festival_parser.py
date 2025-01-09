import requests
import json

def scrape_festival_lineup(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        artists = [artist['title'] for artist in data.values()]
        artists.sort()
        return artists      
    except requests.RequestException as e:
        print(f"Request error: {e}")
        return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

