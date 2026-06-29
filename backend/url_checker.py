import re
import ipaddress
import urllib.parse
from urllib.parse import urlparse, parse_qs

# ============================================================
# ThreatLens URL Checker
# Part 1 - Extraction & Helper Functions
# ============================================================


# -------------------------------
# Suspicious TLDs
# -------------------------------

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".click", ".work", ".loan",
    ".gq", ".cf", ".ml", ".tk", ".zip",
    ".review", ".country", ".stream",
    ".download", ".monster"
}


# -------------------------------
# Popular URL Shorteners
# -------------------------------

SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "rb.gy",
    "cutt.ly",
    "rebrand.ly",
    "shorturl.at"
}
# -------------------------------
# Phishing URL Keywords
# -------------------------------

URL_PHISHING_WORDS = {

    "verify",
    "verification",
    "secure",
    "security",
    "confirm",
    "identity",

    "account",
    "login",
    "signin",
    "authenticate",

    "password",
    "otp",

    "update",

    "suspended",
    "locked",

    "urgent"

}

# -------------------------------
# Brands commonly impersonated
# -------------------------------

BRANDS = {
    "google",
    "paypal",
    "amazon",
    "apple",
    "microsoft",
    "facebook",
    "instagram",
    "whatsapp",
    "linkedin",
    "netflix",
    "adobe",
    "dropbox",
    "github",
    "discord",
    "telegram",
    "sbi",
    "hdfc",
    "icici",
    "axis",
    "kotak",
    "rbi"
}


# -------------------------------
# Dangerous URL Schemes
# -------------------------------

DANGEROUS_SCHEMES = {
    "javascript",
    "data",
    "file",
    "blob"
}


# -------------------------------
# Suspicious Query Parameters
# -------------------------------

SUSPICIOUS_PARAMS = {
    "token",
    "otp",
    "password",
    "passwd",
    "redirect",
    "continue",
    "next",
    "session",
    "verify",
    "login",
    "auth",
    "callback"
}


# ============================================================
# Regex to Extract URLs
# ============================================================

URL_REGEX = re.compile(
    r"(https?://[^\s]+|www\.[^\s]+)",
    re.IGNORECASE
)


# ============================================================
# Extract URLs from Text
# ============================================================

def extract_urls(text):
    """
    Returns all URLs found in text.
    """
    return URL_REGEX.findall(text)


# ============================================================
# Normalize URL
# ============================================================

def normalize_url(url):
    """
    Adds https:// if missing.
    """

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    return url


# ============================================================
# Parse URL
# ============================================================

def parse_url(url):

    url = normalize_url(url)

    parsed = urlparse(url)

    return parsed


# ============================================================
# Check if hostname is an IP
# ============================================================

def is_ip_address(host):

    try:
        ipaddress.ip_address(host)
        return True
    except:
        return False


# ============================================================
# Hexadecimal IP
# Example:
# http://0x7f000001
# ============================================================

def is_hex_ip(host):

    return host.lower().startswith("0x")


# ============================================================
# Decimal IP
# Example:
# http://2130706433
# ============================================================

def is_decimal_ip(host):

    return host.isdigit()


# ============================================================
# Detect Unicode / Punycode
# ============================================================

def has_punycode(host):

    return "xn--" in host


# ============================================================
# Detect Suspicious TLD
# ============================================================

def has_suspicious_tld(host):

    for tld in SUSPICIOUS_TLDS:

        if host.endswith(tld):
            return True

    return False


# ============================================================
# Detect URL Shortener
# ============================================================

def is_shortened(host):

    return host.lower() in SHORTENERS


# ============================================================
# Count Subdomains
# ============================================================

def subdomain_count(host):

    parts = host.split(".")

    return max(0, len(parts) - 2)

# -------------------------------
# Detect Phishing Language in URL
# -------------------------------

def phishing_keywords(url):

    url = url.lower()

    found = []

    for word in URL_PHISHING_WORDS:

        if word in url:
            found.append(word)

    return found
# ============================================================
# URL Length
# ============================================================

def url_length(url):

    return len(url)

# ============================================================
# Part 2 - Detection Functions
# ============================================================

# -------------------------------
# Detect Brand Impersonation
# Example:
# paypal-login.xyz
# amazon-security.top
# -------------------------------

def detect_brand_impersonation(host):

    host = host.lower()

    for brand in BRANDS:

        if brand in host:

            # Legitimate domains
            if host == f"{brand}.com":
                continue

            if host.endswith(f".{brand}.com"):
                continue

            return True

    return False


# -------------------------------
# Detect Typosquatting
# Example:
# go0gle.com
# paypa1.com
# -------------------------------

def detect_typosquatting(host):

    host = host.lower()

    replacements = {
        "0": "o",
        "1": "l",
        "3": "e",
        "5": "s",
        "@": "a",
        "$": "s"
    }

    normalized = host

    for old, new in replacements.items():
        normalized = normalized.replace(old, new)

    for brand in BRANDS:

        if brand in normalized and brand not in host:
            return True

    return False


# -------------------------------
# Detect Credentials in URL
# Example:
# admin:test@paypal.com
# -------------------------------

def has_credentials(parsed):

    return bool(parsed.username or parsed.password)


# -------------------------------
# Detect Suspicious Port
# -------------------------------

def suspicious_port(parsed):

    suspicious_ports = {
        21,
        22,
        23,
        25,
        81,
        8080,
        8081,
        1337,
        4444,
        5555,
        6666,
        31337
    }

    if parsed.port is None:
        return False

    return parsed.port in suspicious_ports


# -------------------------------
# Detect HTTP instead of HTTPS
# -------------------------------

def is_http(parsed):

    return parsed.scheme.lower() == "http"


# -------------------------------
# Dangerous Schemes
# javascript:
# data:
# blob:
# file:
# -------------------------------

def dangerous_scheme(parsed):

    return parsed.scheme.lower() in DANGEROUS_SCHEMES


# -------------------------------
# URL Encoding / Obfuscation
# -------------------------------

def has_url_encoding(url):

    patterns = [
        "%20",
        "%2f",
        "%2e",
        "%3a",
        "%40",
        "%25",
        "%3d"
    ]

    url = url.lower()

    return any(p in url for p in patterns)


# -------------------------------
# Redirect Parameters
# -------------------------------

def has_redirect(parsed):

    query = parse_qs(parsed.query)

    redirect_keys = {
        "redirect",
        "url",
        "next",
        "continue",
        "destination",
        "target"
    }

    for key in query:

        if key.lower() in redirect_keys:
            return True

    return False


# -------------------------------
# Suspicious Query Parameters
# -------------------------------

def suspicious_parameters(parsed):

    query = parse_qs(parsed.query)

    detected = []

    for key in query:

        if key.lower() in SUSPICIOUS_PARAMS:
            detected.append(key)

    return detected


# -------------------------------
# Very Long URL
# -------------------------------

def long_url(url):

    return len(url) > 100


# -------------------------------
# Too Many Subdomains
# -------------------------------

def excessive_subdomains(host):

    return subdomain_count(host) >= 3


# -------------------------------
# Analyze One URL
# (No scoring yet)
# -------------------------------

def inspect_url(url):

    parsed = parse_url(url)

    host = parsed.hostname or ""

    report = {

        "url": url,

        "hostname": host,

        "scheme": parsed.scheme,

        "port": parsed.port,

        "path": parsed.path,

        "query": parsed.query,

        "checks": {

            "http": is_http(parsed),

            "ip_address": is_ip_address(host),

            "hex_ip": is_hex_ip(host),

            "decimal_ip": is_decimal_ip(host),

            "punycode": has_punycode(host),

            "suspicious_tld": has_suspicious_tld(host),

            "url_shortener": is_shortened(host),

            "brand_impersonation": detect_brand_impersonation(host),

            "phishing_keywords": phishing_keywords(url),

            "typosquatting": detect_typosquatting(host),

            "credentials": has_credentials(parsed),

            "dangerous_scheme": dangerous_scheme(parsed),

            "url_encoding": has_url_encoding(url),

            "redirect": has_redirect(parsed),

            "suspicious_params": suspicious_parameters(parsed),

            "long_url": long_url(url),

            "many_subdomains": excessive_subdomains(host),

            "suspicious_port": suspicious_port(parsed)
        }
    }

    return report

# ============================================================
# Part 3 - Risk Engine & Final Analyzer
# ============================================================

WEIGHTS = {

    "http": 5,

    "ip_address": 25,

    "hex_ip": 25,

    "decimal_ip": 25,

    "punycode": 20,

    "suspicious_tld": 15,

    "url_shortener": 15,

    "brand_impersonation": 30,

    "typosquatting": 25,

    "credentials": 20,

    "dangerous_scheme": 40,

    "url_encoding": 10,

    "redirect": 15,

    "long_url": 10,

    "many_subdomains": 10,

    "suspicious_port": 10
}


FLAG_NAMES = {

    "http": "Uses HTTP instead of HTTPS",

    "ip_address": "Uses IP Address",

    "hex_ip": "Uses Hexadecimal IP",

    "decimal_ip": "Uses Decimal IP",

    "punycode": "Uses Punycode Domain",

    "suspicious_tld": "Suspicious Top-Level Domain",

    "url_shortener": "URL Shortener",

    "brand_impersonation": "Brand Impersonation",

    "typosquatting": "Possible Typosquatting",

    "credentials": "Embedded Username/Password",

    "dangerous_scheme": "Dangerous URL Scheme",

    "url_encoding": "Encoded / Obfuscated URL",

    "redirect": "Redirect Parameter",

    "long_url": "Very Long URL",

    "many_subdomains": "Too Many Subdomains",

    "suspicious_port": "Suspicious Port"
}


# ============================================================
# Score One URL
# ============================================================

def score_url(report):

    score = 0

    flags = []

    checks = report["checks"]

    for check, value in checks.items():

        if check == "suspicious_params":

            if value:

                score += len(value) * 5

                for item in value:
                    flags.append(f"Suspicious Query Parameter ({item})")

            continue
        if check == "phishing_keywords":

            if len(value) >= 3:

                score += 25

                flags.append("Phishing Language in URL")

            continue
        
        if value:

            score += WEIGHTS.get(check, 0)

            flags.append(FLAG_NAMES.get(check, check))

    score = min(score, 100)

    return score, flags


# ============================================================
# Analyze All URLs
# ============================================================

def analyze_urls(text):

    text = text.strip()

    # If the user entered a single URL directly,
    # analyze it instead of trying to extract URLs.
    if text.startswith(("http://", "https://", "www.")):
        urls = [text]
    else:
        urls = extract_urls(text)

    if not urls:
        return {
            "risk_score": 0,
            "total_urls": 0,
            "reports": [],
            "overall_flags": []
        }

    reports = []

    all_flags = []

    highest_score = 0

    for url in urls:

        report = inspect_url(url)

        score, flags = score_url(report)

        report["risk_score"] = score

        report["flags"] = flags

        reports.append(report)

        all_flags.extend(flags)

        highest_score = max(highest_score, score)

    recommendations = []

    if highest_score >= 90:
        recommendations = [
            "Do not visit this website.",
            "Report this website as phishing.",
            "Do not enter passwords or banking information.",
            "If you already entered credentials, change your password immediately."
        ]

    elif highest_score >= 70:
        recommendations = [
            "Avoid interacting with this website.",
            "Verify the official domain before continuing.",
            "Report this website if it impersonates a trusted brand."
        ]

    elif highest_score >= 40:
        recommendations = [
            "Proceed with caution.",
            "Verify the website before entering any personal information."
        ]

    else:
        recommendations = [
            "No major threats detected.",
            "Continue following safe browsing practices."
        ]
    return {
        "risk_score": highest_score,
        "total_urls": len(urls),
        "reports": reports,
        "overall_flags": sorted(list(set(all_flags))),
        "recommendations": recommendations
    }


# ============================================================
# Test
# ============================================================

if __name__ == "__main__":

    sample = """
    Hello,

    Verify your account immediately.

    https://admin:test@paypal-login.xyz:8080/login?otp=123&redirect=https://google.com

    http://192.168.1.5/login

    https://bit.ly/abc123

    """

    result = analyze_urls(sample)

    from pprint import pprint

    pprint(result)