from festival_parser import scrape_festival_lineup

# Test function for the festival parser
def test_scrape_festival_lineup():
    # Example URL for testing (replace with a real URL for actual testing)
    test_url = 'https://amp-prod-aeg-festivaldata.s3.amazonaws.com/app/696/sxxI03CJN0bdFiba/artists.json'
    artists = scrape_festival_lineup(test_url)
    if artists:
        print("Test passed: Successfully scraped artist names.")
    else:
        print("Test failed: No artists found or an error occurred.")

# Run the test
test_scrape_festival_lineup() 