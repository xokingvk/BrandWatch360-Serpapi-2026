import re
from urllib.parse import urlparse

# Multi-part second-level domains commonly used
MULTI_PART_TLDS = {
    "co.uk", "org.uk", "me.uk", "net.uk", "gov.uk", "ac.uk",
    "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in", "gov.in", "res.in",
    "com.au", "net.au", "org.au", "edu.au", "gov.au",
    "co.nz", "net.nz", "org.nz",
    "co.za", "org.za",
    "com.br", "net.br", "org.br",
    "com.mx", "org.mx",
    "com.sg", "edu.sg", "gov.sg",
    "co.jp", "ne.jp", "ac.jp",
}


def normalize_domain(url_or_domain: str) -> str:
    """
    Normalizes a URL or domain string to a clean, lowercase domain name.
    Strips protocol, paths, query params, ports, and leading 'www.'.
    
    Examples:
    - 'https://www.makeprd.io/path?query=1' -> 'makeprd.io'
    - 'http://makeprd.io:8080/' -> 'makeprd.io'
    - 'www.swiggy.com' -> 'swiggy.com'
    - 'swiggy.co.in' -> 'swiggy.co.in'
    """
    if not url_or_domain:
        return ""

    raw = str(url_or_domain).strip().lower()

    # Prepend scheme if missing so urlparse works properly
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", raw):
        raw = "http://" + raw

    try:
        parsed = urlparse(raw)
        host = parsed.hostname or ""
    except Exception:
        host = raw.split("/")[0]

    # Strip port if present
    if ":" in host:
        host = host.split(":")[0]

    # Strip leading www.
    if host.startswith("www."):
        host = host[4:]

    return host.strip()


def get_registrable_domain(url_or_domain: str) -> str:
    """
    Extracts the root registrable domain (e.g., 'makeprd.io' or 'swiggy.co.in').
    Correctly recognizes two-part ccTLDs such as '.co.in', '.co.uk', etc.
    
    Examples:
    - 'app.makeprd.io' -> 'makeprd.io'
    - 'www.makeprd.io' -> 'makeprd.io'
    - 'delhi.swiggy.co.in' -> 'swiggy.co.in'
    - 'swiggy.com' -> 'swiggy.com'
    """
    domain = normalize_domain(url_or_domain)
    if not domain:
        return ""

    parts = domain.split(".")
    if len(parts) <= 2:
        return domain

    # Check for known multi-part TLDs (e.g. co.in, co.uk)
    last_two = ".".join(parts[-2:])
    if last_two in MULTI_PART_TLDS:
        if len(parts) >= 3:
            return ".".join(parts[-3:])
        return domain

    # Standard single-part TLD (e.g. .com, .io, .org)
    return ".".join(parts[-2:])


def is_domain_match(url_or_domain_1: str, url_or_domain_2: str) -> bool:
    """
    Checks if two URLs or domains refer to the same registrable domain.
    Does NOT match substring imposters (e.g. 'fakemakeprd.io' vs 'makeprd.io' -> False).
    Matches subdomains to root (e.g. 'www.makeprd.io' vs 'makeprd.io' -> True).
    """
    reg1 = get_registrable_domain(url_or_domain_1)
    reg2 = get_registrable_domain(url_or_domain_2)

    if not reg1 or not reg2:
        return False

    return reg1 == reg2


def classify_result_relevance(
    result_title: str,
    result_snippet: str,
    result_url: str,
    brand_name: str,
    city: str = "",
    state: str = ""
) -> str:
    """
    Classifies the relevance of a search result to the investigated brand:
    - 'Relevant to the investigated brand'
    - 'Potentially relevant; needs more evidence'
    - 'Unrelated to the investigated brand'
    """
    b = (brand_name or "").strip().lower()
    t = (result_title or "").strip().lower()
    s = (result_snippet or "").strip().lower()
    u = (result_url or "").strip().lower()

    if not b:
        return "Potentially relevant; needs more evidence"

    # Direct brand mentions in title, url, or snippet
    in_title = b in t
    in_url = b in u
    in_snippet = b in s

    if in_title or in_url:
        return "Relevant to the investigated brand"

    if in_snippet:
        return "Relevant to the investigated brand"

    # If the brand is not present at all, check if it's generic city/state info
    if city and city.lower() in t and state and state.lower() in t and b not in t and b not in s:
        return "Unrelated to the investigated brand"

    return "Potentially relevant; needs more evidence"
