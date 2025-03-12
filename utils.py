import datetime
import time
import pytz
from dateutil import parser

def date_to_unix_timestamp_ms(date_string, timezone_str=None):
    """
    Convert a date string to Unix timestamp in milliseconds.
    Supports various date formats and timezone specifications.
    
    Args:
        date_string (str): Date string (e.g., '2025-03-08', '2025-03-08 20:00:00')
        timezone_str (str, optional): Timezone name (e.g., 'UTC', 'US/Pacific', 'Europe/London')
        
    Returns:
        int: Unix timestamp in milliseconds
    """
    try:
        # Try to parse the date string using dateutil parser for flexibility
        date_obj = parser.parse(date_string)
        
        # If the parsed date is naive (no timezone info) and timezone_str is provided
        if date_obj.tzinfo is None and timezone_str:
            try:
                timezone = pytz.timezone(timezone_str)
                # Make the date timezone-aware
                date_obj = timezone.localize(date_obj)
            except pytz.exceptions.UnknownTimeZoneError:
                print(f"Unknown timezone: {timezone_str}. Using local timezone instead.")
        
        # Convert to UTC if it's timezone-aware
        if date_obj.tzinfo is not None:
            date_obj = date_obj.astimezone(pytz.UTC)
        
        # Convert to Unix timestamp
        if hasattr(date_obj, 'timestamp'):  # Python 3.3+
            unix_timestamp_seconds = date_obj.timestamp()
        else:
            # Fallback for older Python versions
            unix_timestamp_seconds = time.mktime(date_obj.timetuple())
        
        # Convert to milliseconds
        unix_timestamp_ms = int(unix_timestamp_seconds * 1000)
        
        return unix_timestamp_ms
    except Exception as e:
        print(f"Error parsing date: {e}")
        return None 