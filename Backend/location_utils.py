import re
from typing import TypedDict


class LocationInfo(TypedDict):
    raw: str
    city: str
    state: str
    country: str
    primary_city: str
    normalized: str
    search_location: str
    maps_location: str


# Common state names that users frequently write without spaces (e.g. "tamilnadu" -> "Tamil Nadu")
MERGED_STATE_NAMES: dict[str, str] = {
    # India
    "tamilnadu": "Tamil Nadu",
    "andhrapradesh": "Andhra Pradesh",
    "madhyapradesh": "Madhya Pradesh",
    "uttarpradesh": "Uttar Pradesh",
    "himachalpradesh": "Himachal Pradesh",
    "westbengal": "West Bengal",
    # USA
    "newyork": "New York",
    "northcarolina": "North Carolina",
    "southcarolina": "South Carolina",
    "newjersey": "New Jersey",
    "newmexico": "New Mexico",
    "rhodeisland": "Rhode Island",
    "northdakota": "North Dakota",
    "southdakota": "South Dakota",
    "newhampshire": "New Hampshire",
    "westvirginia": "West Virginia",
}


def normalize_location(location_str: str) -> LocationInfo:
    """
    Normalizes a location string while preserving city-level focus and state context.
    
    Accepts:
    - City alone: 'Chennai' -> primary_city: 'Chennai', normalized: 'Chennai'
    - City and State: 'Chennai, Tamil Nadu' -> primary_city: 'Chennai', state: 'Tamil Nadu', normalized: 'Chennai, Tamil Nadu'
    - Inconsistent spacing / merged words: 'chennai, tamilnadu' -> primary_city: 'Chennai', state: 'Tamil Nadu', normalized: 'Chennai, Tamil Nadu'
    - Generic multi-part locations: 'Austin, Texas', 'San Francisco, CA', etc.
    
    Ensures:
    - City is recognized as the primary geographic target.
    - State is recognized as geographic context without becoming the main subject.
    - No duplicate state or country parts are appended.
    - Original user input is preserved in 'raw'.
    """
    raw = (location_str or "").strip()
    if not raw:
        return {
            "raw": "",
            "city": "",
            "state": "",
            "country": "",
            "primary_city": "",
            "normalized": "",
            "search_location": "",
            "maps_location": "",
        }

    # Normalize whitespace around commas and condense multi-spaces
    cleaned = re.sub(r"\s*,\s*", ", ", raw)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    parts = [p.strip() for p in cleaned.split(",") if p.strip()]

    city_raw = parts[0] if parts else ""
    # Capitalize city words properly while preserving acronyms/hyphens
    city = " ".join(
        word.capitalize() if not word.isupper() or len(word) > 4 else word
        for word in city_raw.split()
    ) if city_raw else ""

    state = ""
    country = ""

    if len(parts) >= 2:
        s_part = parts[1].strip()
        s_compact = s_part.lower().replace(" ", "").replace("-", "")
        if s_compact in MERGED_STATE_NAMES:
            state = MERGED_STATE_NAMES[s_compact]
        else:
            # If 2 characters (e.g. 'CA', 'TX', 'NY'), preserve uppercase; otherwise title-case
            if len(s_part) <= 3 and s_part.isalpha():
                state = s_part.upper()
            else:
                state = " ".join(
                    w.capitalize() if not w.isupper() or len(w) > 4 else w
                    for w in s_part.split()
                )

    if len(parts) >= 3:
        c_part = parts[2].strip()
        if len(c_part) <= 3 and c_part.isalpha():
            country = c_part.upper()
        else:
            country = " ".join(
                w.capitalize() if not w.isupper() or len(w) > 4 else w
                for w in c_part.split()
            )

    # Compose normalized location string without redundant duplicates
    components: list[str] = []
    if city:
        components.append(city)
    if state and state.lower() != city.lower():
        components.append(state)
    if country and country.lower() not in (city.lower(), state.lower()):
        components.append(country)

    normalized = ", ".join(components) if components else city

    return {
        "raw": raw,
        "city": city,
        "state": state,
        "country": country,
        "primary_city": city,
        "normalized": normalized,
        "search_location": normalized,
        "maps_location": normalized,
    }
