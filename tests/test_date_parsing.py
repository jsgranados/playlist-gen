from utils import safe_parse_date, date_to_unix_timestamp_ms
import datetime

def test_date_parsing():
    print("Testing date parsing functionality...")
    
    test_cases = [
        # Standard formats
        ("2025-03-08", None),
        ("2025/03/08", None),
        ("03/08/2025", None),
        ("March 8, 2025", None),
        
        # With times
        ("2025-03-08 14:30:00", None),
        ("2025-03-08T14:30:00", None),
        
        # With timezone
        ("2025-03-08 14:30:00-05:00", None),
        ("2025-03-08 14:30:00", "US/Pacific"),
        
        # Edge cases
        ("", None),  # Empty string
        (None, None),  # None value
        (1741651200, None),  # Unix timestamp (seconds)
        (1741651200000, None),  # Unix timestamp (milliseconds)
        (datetime.datetime.now(), None),  # Datetime object
    ]
    
    print("\n=== Date Parsing Results ===")
    for input_date, timezone in test_cases:
        dt = safe_parse_date(input_date, timezone_str=timezone)
        ms = date_to_unix_timestamp_ms(input_date, timezone_str=timezone)
        
        print(f"\nInput: {input_date} (Timezone: {timezone or 'None'})")
        print(f"  Parsed datetime: {dt}")
        print(f"  Unix milliseconds: {ms}")

if __name__ == "__main__":
    test_date_parsing() 