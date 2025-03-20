import datetime
import time
import pytz
from dateutil import parser
import json

def safe_parse_date(date_value, default_format="%Y-%m-%d", timezone_str=None):
    """
    A robust date parser that handles various input types and provides clear error messages.
    
    Args:
        date_value: String, datetime object, or timestamp to parse
        default_format: Format string to use if dateutil parser fails
        timezone_str: Optional timezone name (e.g., 'UTC', 'US/Pacific')
        
    Returns:
        datetime.datetime: A datetime object, or None if parsing failed
    """
    if date_value is None:
        print("Error: Date value is None")
        return None
        
    # If already a datetime, just handle timezone
    if isinstance(date_value, datetime.datetime):
        if timezone_str and date_value.tzinfo is None:
            try:
                timezone = pytz.timezone(timezone_str)
                return timezone.localize(date_value)
            except Exception as e:
                print(f"Error applying timezone: {e}")
        return date_value
    
    # Handle Unix timestamps (in seconds or milliseconds)
    if isinstance(date_value, (int, float)):
        # If timestamp is in milliseconds (13 digits), convert to seconds
        if date_value > 1e11:
            date_value /= 1000
        try:
            dt = datetime.datetime.fromtimestamp(date_value)
            if timezone_str:
                dt = dt.replace(tzinfo=pytz.UTC)
                if timezone_str != 'UTC':
                    dt = dt.astimezone(pytz.timezone(timezone_str))
            return dt
        except Exception as e:
            print(f"Error converting timestamp {date_value}: {e}")
            return None
    
    # Handle string dates
    if isinstance(date_value, str):
        # Remove any leading/trailing whitespace
        date_value = date_value.strip()
        
        if not date_value:
            print("Error: Empty date string")
            return None
        
        # Try with dateutil parser first (flexible)
        try:
            dt = parser.parse(date_value)
            if timezone_str and dt.tzinfo is None:
                try:
                    timezone = pytz.timezone(timezone_str)
                    dt = timezone.localize(dt)
                except Exception as e:
                    print(f"Error applying timezone {timezone_str}: {e}")
            return dt
        except Exception as e:
            print(f"Warning: dateutil parser failed: {e}, trying with format {default_format}")
            
            # Fallback to strptime with the default format
            try:
                dt = datetime.datetime.strptime(date_value, default_format)
                if timezone_str:
                    try:
                        timezone = pytz.timezone(timezone_str)
                        dt = timezone.localize(dt)
                    except Exception as e:
                        print(f"Error applying timezone {timezone_str}: {e}")
                return dt
            except Exception as e:
                print(f"Error parsing date string '{date_value}': {e}")
                return None
    
    print(f"Error: Unsupported date type: {type(date_value)}")
    return None

def date_to_unix_timestamp_ms(date_value, timezone_str=None):
    """
    Convert a date value to Unix timestamp in milliseconds.
    
    Args:
        date_value: Date string, datetime object, or timestamp
        timezone_str: Optional timezone name
        
    Returns:
        int: Unix timestamp in milliseconds, or None if conversion failed
    """
    dt = safe_parse_date(date_value, timezone_str=timezone_str)
    if dt is None:
        return None
    
    # Make sure it's UTC for timestamp calculation
    if dt.tzinfo is not None:
        dt = dt.astimezone(pytz.UTC)
    
    # Convert to timestamp
    try:
        timestamp_seconds = dt.timestamp()
        return int(timestamp_seconds * 1000)
    except Exception as e:
        print(f"Error converting to timestamp: {e}")
        return None

def ensure_datetime(date_value, timezone_str=None):
    """
    Ensure a value is a datetime object for proper comparison.
    Converts strings, timestamps, or other date formats to datetime objects.
    
    Args:
        date_value: A date in string, timestamp, or datetime format
        timezone_str (str, optional): Timezone name if needed
        
    Returns:
        datetime.datetime: A datetime object
    """
    return safe_parse_date(date_value, timezone_str=timezone_str)

def process_json_file(file_path):
    """
    Process the Spotify JSON file containing listening history.
    
    Args:
        file_path (str): Path to the JSON file
        
    Returns:
        list: Processed song data
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return data
    except Exception as e:
        print(f"Error processing JSON file: {e}")
        return []

def get_songs_in_time_range(songs, start_dt, end_dt):
    """
    Filter songs to only include those within a specified time range.
    
    Args:
        songs (list): List of song dictionaries containing play history
        start_dt (datetime): Start datetime to filter from
        end_dt (datetime): End datetime to filter to
        
    Returns:
        list: Filtered list of songs that were played within the time range
    """
    songs_in_time_range = []
    for song in songs:
        song_end_time = ensure_datetime(song['endTime'])
        if song_end_time and start_dt <= song_end_time <= end_dt:
            songs_in_time_range.append(song)
    print(f"Found {len(songs_in_time_range)} songs in the specified time range.")
    return songs_in_time_range