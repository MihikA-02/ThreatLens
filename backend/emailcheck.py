import re
import ipaddress
from urllib.parse import urlparse

# ==========================================================
# ThreatLens Email Checker
# Part 1 - Extraction & Helper Functions
# ==========================================================


# ----------------------------------------------------------
# Email Regex
# ----------------------------------------------------------

EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
)


# ----------------------------------------------------------
# Free Email Providers
# ----------------------------------------------------------

FREE_PROVIDERS = {

    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "proton.me",
    "protonmail.com",
    "aol.com",
    "zoho.com"

}


# ----------------------------------------------------------
# Disposable Email Providers
# ----------------------------------------------------------

DISPOSABLE_PROVIDERS = {

    "10minutemail.com",
    "mailinator.com",
    "guerrillamail.com",
    "tempmail.com",
    "tempmail.com",
    "trashmail.com",
    "yopmail.com",
    "fakeinbox.com",
    "throwawaymail.com"

}


# ----------------------------------------------------------
# Suspicious TLDs
# ----------------------------------------------------------

SUSPICIOUS_TLDS = {

    ".xyz",
    ".top",
    ".click",
    ".work",
    ".loan",
    ".gq",
    ".cf",
    ".ml",
    ".tk",
    ".zip",
    ".review",
    ".download"

}


# ----------------------------------------------------------
# Brands
# ----------------------------------------------------------

BRANDS = {

    "google",
    "paypal",
    "amazon",
    "microsoft",
    "apple",
    "facebook",
    "instagram",
    "whatsapp",
    "linkedin",
    "github",
    "netflix",
    "discord",
    "telegram",

    "sbi",
    "hdfc",
    "icici",
    "axis",
    "kotak",
    "rbi"

}


# ----------------------------------------------------------
# Dangerous Attachments
# ----------------------------------------------------------

DANGEROUS_ATTACHMENTS = {

    ".exe",
    ".scr",
    ".bat",
    ".cmd",
    ".ps1",
    ".vbs",
    ".js",
    ".jar",
    ".iso",
    ".dll",
    ".zip",
    ".rar"

}


# ==========================================================
# Extract Emails
# ==========================================================

def extract_emails(text):

    return EMAIL_REGEX.findall(text)


# ==========================================================
# Validate Email
# ==========================================================

def valid_email(email):

    return bool(EMAIL_REGEX.fullmatch(email))


# ==========================================================
# Domain
# ==========================================================

def get_domain(email):

    return email.split("@")[-1].lower()


# ==========================================================
# Username
# ==========================================================

def get_username(email):

    return email.split("@")[0]


# ==========================================================
# Free Provider
# ==========================================================

def is_free_provider(domain):

    return domain in FREE_PROVIDERS


# ==========================================================
# Disposable Provider
# ==========================================================

def is_disposable(domain):

    return domain in DISPOSABLE_PROVIDERS


# ==========================================================
# Punycode
# ==========================================================

def has_punycode(domain):

    return "xn--" in domain


# ==========================================================
# IP Address Domain
# Example:
# abc@192.168.1.1
# ==========================================================

def is_ip_domain(domain):

    try:

        ipaddress.ip_address(domain)

        return True

    except:

        return False


# ==========================================================
# Suspicious TLD
# ==========================================================

def suspicious_tld(domain):

    for tld in SUSPICIOUS_TLDS:

        if domain.endswith(tld):

            return True

    return False


# ==========================================================
# Long Domain
# ==========================================================

def long_domain(domain):

    return len(domain) > 35


# ==========================================================
# Subdomains
# ==========================================================

def subdomain_count(domain):

    return max(0, len(domain.split(".")) - 2)


# ==========================================================
# Many Subdomains
# ==========================================================

def many_subdomains(domain):

    return subdomain_count(domain) >= 3


# ==========================================================
# Detect Attachments
# ==========================================================

def attachment_type(filename):

    filename = filename.lower()

    for ext in DANGEROUS_ATTACHMENTS:

        if filename.endswith(ext):

            return ext

    return None

# ==========================================================
# Part 2 - Detection Engine
# ==========================================================


# ----------------------------------------------------------
# Brand Impersonation
# Example:
# paypal-security.xyz
# google-login.top
# ----------------------------------------------------------

def detect_brand_impersonation(domain):

    domain = domain.lower()

    for brand in BRANDS:

        if brand in domain:

            if domain == f"{brand}.com":
                continue

            if domain.endswith(f".{brand}.com"):
                continue

            return True

    return False


# ----------------------------------------------------------
# Typosquatting
# Example:
# paypa1.com
# go0gle.com
# ----------------------------------------------------------

def detect_typosquatting(domain):

    replacements = {

        "0": "o",
        "1": "l",
        "3": "e",
        "5": "s",
        "@": "a",
        "$": "s"

    }

    normalized = domain

    for old, new in replacements.items():

        normalized = normalized.replace(old, new)

    for brand in BRANDS:

        if brand in normalized and brand not in domain:

            return True

    return False


# ----------------------------------------------------------
# Unicode Characters
# ----------------------------------------------------------

def unicode_spoof(domain):

    return any(ord(char) > 127 for char in domain)


# ----------------------------------------------------------
# Subject Analysis
# ----------------------------------------------------------

def analyze_subject(subject):

    subject = subject.lower()

    findings = []

    KEYWORDS = {

        "Urgency": [

            "urgent",
            "immediately",
            "act now",
            "today",
            "within 24 hours",
            "deadline",
            "expires"

        ],

        "Fear Tactics": [

            "blocked",
            "locked",
            "suspended",
            "disabled",
            "terminated"

        ],

        "Credential Request": [

            "verify account",
            "confirm account",
            "login",
            "reset password",
            "update password"

        ],

        "OTP Request": [

            "otp",
            "verification code",
            "authentication code"

        ],

        "Payment Request": [

            "payment",
            "invoice",
            "upi",
            "refund",
            "bank transfer"

        ],

        "Lottery Scam": [

            "winner",
            "won",
            "lottery",
            "reward",
            "gift"

        ]
    }

    for category, words in KEYWORDS.items():

        for word in words:

            if word in subject:

                findings.append(category)

                break

    return list(set(findings))


# ----------------------------------------------------------
# Attachment Analysis
# ----------------------------------------------------------

def analyze_attachment(filename):

    extension = attachment_type(filename)

    if extension:

        return {

            "dangerous": True,

            "extension": extension

        }

    return {

        "dangerous": False,

        "extension": None

    }


# ----------------------------------------------------------
# Display Name Mismatch
# Example:
#
# Display Name:
# PayPal Support
#
# Email:
# support@abc.xyz
# ----------------------------------------------------------

def display_name_mismatch(display_name, email):

    display_name = display_name.lower()

    domain = get_domain(email)

    username = get_username(email)

    combined = domain + username

    for brand in BRANDS:

        if brand in display_name:

            if brand not in combined:

                return True

    return False


# ----------------------------------------------------------
# Inspect Email
# ----------------------------------------------------------

def inspect_email(

        sender_email,

        display_name="",

        subject="",

        attachment=""
):

    domain = get_domain(sender_email)

    report = {

        "sender": sender_email,

        "display_name": display_name,

        "domain": domain,

        "checks": {

            "valid_email": valid_email(sender_email),

            "free_provider": is_free_provider(domain),

            "disposable_provider": is_disposable(domain),

            "punycode": has_punycode(domain),

            "unicode_spoof": unicode_spoof(domain),

            "ip_domain": is_ip_domain(domain),

            "suspicious_tld": suspicious_tld(domain),

            "brand_impersonation": detect_brand_impersonation(domain),

            "typosquatting": detect_typosquatting(domain),

            "long_domain": long_domain(domain),

            "many_subdomains": many_subdomains(domain),

            "display_name_mismatch": display_name_mismatch(

                display_name,

                sender_email

            ),

            "subject_findings": analyze_subject(subject),

            "attachment": analyze_attachment(attachment)

        }

    }

    return report

# ==========================================================
# Part 3 - Risk Engine & Final Analyzer
# ==========================================================

WEIGHTS = {

    "valid_email": 0,

    "free_provider": 5,

    "disposable_provider": 30,

    "punycode": 20,

    "unicode_spoof": 25,

    "ip_domain": 25,

    "suspicious_tld": 15,

    "brand_impersonation": 30,

    "typosquatting": 25,

    "long_domain": 10,

    "many_subdomains": 10,

    "display_name_mismatch": 20

}


FLAG_NAMES = {

    "free_provider": "Free Email Provider",

    "disposable_provider": "Disposable Email Provider",

    "punycode": "Punycode Domain",

    "unicode_spoof": "Unicode Spoofing",

    "ip_domain": "IP Address Domain",

    "suspicious_tld": "Suspicious Top-Level Domain",

    "brand_impersonation": "Brand Impersonation",

    "typosquatting": "Possible Typosquatting",

    "long_domain": "Long Domain Name",

    "many_subdomains": "Too Many Subdomains",

    "display_name_mismatch": "Display Name Mismatch"

}


# ==========================================================
# Score Email
# ==========================================================

def score_email(report):

    score = 0

    flags = []

    checks = report["checks"]

    for key, value in checks.items():

        if key == "attachment":

            if value["dangerous"]:

                score += 25

                flags.append(
                    f"Dangerous Attachment ({value['extension']})"
                )

            continue

        if key == "subject_findings":

            for finding in value:

                score += 10

                flags.append(f"Subject: {finding}")

            continue

        if value:

            score += WEIGHTS.get(key, 0)

            if key in FLAG_NAMES:

                flags.append(FLAG_NAMES[key])

    score = min(score, 100)

    return score, sorted(list(set(flags)))


# ==========================================================
# Risk Level
# ==========================================================

def risk_level(score):

    if score >= 75:
        return "High"

    if score >= 40:
        return "Medium"

    return "Low"


# ==========================================================
# Final Analyzer
# ==========================================================
def analyze_body(body):

    body = body.lower()

    findings = []

    KEYWORDS = {

        "Urgency": [
            "urgent",
            "immediately",
            "within",
            "today",
            "expire",
            "expires",
            "deadline",
            "act now"
        ],

        "Credential Harvesting": [
            "verify your account",
            "verify your identity",
            "confirm your account",
            "login",
            "sign in",
            "password",
            "reset password",
            "banking information"
        ],

        "Financial Scam": [
            "payment",
            "refund",
            "bank",
            "upi",
            "credit card",
            "debit card"
        ],

        "Threat": [
            "account suspended",
            "account locked",
            "account disabled",
            "permanently locked",
            "restricted"
        ]

    }

    for category, words in KEYWORDS.items():
        for word in words:
            if word in body:
                findings.append(category)
                break

    urls = re.findall(r'https?://[^\s]+', body)

    return {
        "findings": list(set(findings)),
        "urls": urls
    }


def analyze_email(

    sender_email,

    display_name="",

    subject="",

    body="",

    attachment=""
    
):

    body_report = analyze_body(body)

    report = inspect_email(

        sender_email,

        display_name,

        subject,

        attachment

    )

    score, flags = score_email(report)

        # Include body findings as flags
    for finding in body_report["findings"]:
        if finding not in flags:
            flags.append(finding)
            score += 10

        # URLs inside email body
        if body_report  ["urls"]:
            flags.append("Contains Links")
            score += 10

    score = min(score, 100)

    # Risk level
    level = risk_level(score)

    # Recommendations
    recommendations = []

    if score >= 75:
        recommendations = [
            "Do not click any links in this email.",
            "Do not reply to this sender.",
            "Do not share passwords, OTPs or banking information.",
            "Report this email as phishing.",
            "Delete the email immediately."
        ]

    elif score >= 40:
        recommendations = [
            "Verify the sender before taking action.",
            "Avoid opening any links or attachments.",
            "Contact the company through its official website."
        ]

    else:
        recommendations = [
            "No major threats detected.",
            "Continue following safe email practices."
        ]

    report["risk_score"] = score
    report["risk_level"] = level
    report["flags"] = flags
    report["body_analysis"] = body_report
    report["recommendations"] = recommendations

    return report


# ==========================================================
# Testing
# ==========================================================

if __name__ == "__main__":

    result = analyze_email(

        sender_email="support@paypa1.xyz",

        display_name="PayPal Support",

        subject="URGENT: Verify Your Account Immediately",

        attachment="invoice.exe"

    )

    from pprint import pprint

    pprint(result)