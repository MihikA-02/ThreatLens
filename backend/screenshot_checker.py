import cv2
import numpy as np
import easyocr
from pyzbar.pyzbar import decode

# ==========================================================
# ThreatLens Screenshot Checker
# Part 1 - Image Loading & Basic Vision
# ==========================================================

# OCR Reader
reader = easyocr.Reader(['en'], gpu=False)

# ----------------------------------------------------------
# Platform Keywords
# ----------------------------------------------------------

PLATFORMS = {

    "WhatsApp": [
        "whatsapp",
        "typing...",
        "online",
        "last seen"
    ],

    "Telegram": [
        "telegram",
        "last seen",
        "joined telegram"
    ],

    "Instagram": [
        "instagram",
        "follow",
        "message"
    ],

    "Facebook": [
        "facebook",
        "messenger"
    ],

    "Gmail": [
        "gmail",
        "compose",
        "inbox"
    ],

    "Chrome": [
        "chrome",
        "https://",
        "http://"
    ],

    "Edge": [
        "edge"
    ],

    "Firefox": [
        "firefox"
    ]
}

# ----------------------------------------------------------
# Bank Keywords
# ----------------------------------------------------------

BANKS = [

    # India
    "sbi",
    "state bank",
    "hdfc",
    "icici",
    "axis",
    "kotak",
    "rbi",
    "pnb",
    "union bank",
    "canara",
    "indusind",
    "yes bank",
    "idfc",
    "bank of baroda",

    # International
    "citizen",
    "citizen bank",
    "bank of america",
    "chase",
    "wells fargo",
    "capital one",
    "paypal",
    "hsbc"

]

# ----------------------------------------------------------
# Government Keywords
# ----------------------------------------------------------

GOVERNMENT = [

    "uidai",
    "aadhaar",
    "income tax",
    "npci",
    "gov.in",
    "government of india"

]

# ----------------------------------------------------------
# Payment Apps
# ----------------------------------------------------------

PAYMENT_APPS = [

    "gpay",
    "google pay",
    "phonepe",
    "paytm",
    "bhim",
    "upi"

]

# ----------------------------------------------------------
# Login Page Keywords
# ----------------------------------------------------------

LOGIN_WORDS = [

    "login",
    "log in",
    "sign in",

    "username",
    "password",

    "verify",
    "verification",

    "identity",
    "confirm",

    "continue",

    "otp",

    "security",

    "account",

    "authenticate",

    "unusual activity",

    "suspended",

    "locked",

    "secure account",

    "confirm identity",

    "verify account"

]

PHISHING_WORDS = [

    "identity verification",

    "verify your account",

    "verify account",

    "confirm your identity",

    "unusual activity",

    "security alert",

    "account suspended",

    "account locked",

    "your account",

    "click below",

    "urgent",

    "immediately",

    "limited account"

]

# ==========================================================
# Load Image
# ==========================================================

def load_image(image_path):

    image = cv2.imread(image_path)

    if image is None:

        raise Exception("Unable to load image.")

    return image


# ==========================================================
# OCR
# ==========================================================

def extract_text(image):

    result = reader.readtext(image)

    words = []

    for item in result:

        words.append(item[1])

    return " ".join(words)


# ==========================================================
# QR Detection
# ==========================================================

def detect_qr(image):

    qr_codes = decode(image)

    if len(qr_codes) == 0:

        return False

    return True


# ==========================================================
# Image Size
# ==========================================================

def image_size(image):

    h, w = image.shape[:2]

    return {

        "width": w,

        "height": h

    }


# ==========================================================
# Image Brightness
# ==========================================================

def brightness(image):

    gray = cv2.cvtColor(

        image,

        cv2.COLOR_BGR2GRAY

    )

    return np.mean(gray)

# ==========================================================
# Detect Platform
# ==========================================================

def detect_platform(text):

    text = text.lower()

    for platform, words in PLATFORMS.items():

        for word in words:

            if word in text:

                return platform

    return "Unknown"


# ==========================================================
# Detect Screenshot Type
# ==========================================================

def detect_screen_type(text):

    text = text.lower()

    if any(word in text for word in ["reply", "typing", "online", "message"]):
        return "Chat"

    if any(word in text for word in ["compose", "inbox", "subject"]):
        return "Email"

    if any(word in text for word in ["http://", "https://", "www."]):
        return "Website"

    if any(word in text for word in ["invoice", "receipt", "payment"]):
        return "Payment"

    if any(word in text for word in ["aadhaar", "certificate", "notice"]):
        return "Document"

    return "Unknown"


# ==========================================================
# Login Page Detection
# ==========================================================

def detect_login_page(text):

    text = text.lower()

    count = 0

    for word in LOGIN_WORDS:

        if word in text:
            count += 1

    return count >= 1


def detect_phishing_language(text):

    text = text.lower()

    found = []

    for phrase in PHISHING_WORDS:

        if phrase in text:
            found.append(phrase)

    return found


# ==========================================================
# Bank Detection
# ==========================================================

def detect_bank(text):

    text = text.lower()

    found = []

    for bank in BANKS:

        if bank in text:
            found.append(bank)

    return found


# ==========================================================
# Government Detection
# ==========================================================

def detect_government(text):

    text = text.lower()

    found = []

    for item in GOVERNMENT:

        if item in text:
            found.append(item)

    return found


# ==========================================================
# Payment App Detection
# ==========================================================

def detect_payment_apps(text):

    text = text.lower()

    found = []

    for app in PAYMENT_APPS:

        if app in text:
            found.append(app)

    return found


# ==========================================================
# Browser Detection
# ==========================================================

def detect_browser(text):

    text = text.lower()

    browser_words = [

        "https://",
        "http://",
        "www.",
        ".com",
        ".org",
        ".net"

    ]

    for word in browser_words:

        if word in text:

            return True

    return False


# ==========================================================
# Build Screenshot Flags
# ==========================================================

def generate_flags(info):

    flags = []

    # Screen-type context flags — mapped to weighted risk engine keys
    if info["screen_type"] == "Website":
        flags.append("Fake Website UI")

    if info["screen_type"] == "Payment":
        flags.append("Payment QR")

    # QR code — directly weighted in risk engine
    if info["has_qr"]:
        flags.append("QR Code")

    # Login form — risk engine key is "Fake Login Page"
    if info["login_page"]:
        flags.append("Fake Login Page")

    # Bank branding — risk engine key is "Bank Logo"
    if len(info["banks"]) > 0:
        flags.append("Bank Logo")

    # Government branding — risk engine key is "Government Logo"
    if len(info["government"]) > 0:
        flags.append("Government Logo")

    # Payment app detected — kept as informational (no weight penalty)
    if len(info["payment_apps"]) > 0:
        flags.append("Payment App")

    if len(info["phishing"]) > 0:
        flags.append("Identity Verification Scam")

    return flags

# ==========================================================
# Screenshot Analyzer
# ==========================================================

def analyze_screenshot(image_path):

    image = load_image(image_path)

    extracted_text = extract_text(image)

    platform = detect_platform(extracted_text)

    screen_type = detect_screen_type(extracted_text)

    login = detect_login_page(extracted_text)

    phishing = detect_phishing_language(extracted_text)

    banks = detect_bank(extracted_text)

    government = detect_government(extracted_text)

    payment_apps = detect_payment_apps(extracted_text)

    browser = detect_browser(extracted_text)

    qr = detect_qr(image)

    size = image_size(image)

    bright = brightness(image)

    flags = generate_flags({

        "screen_type": screen_type,

        "login_page": login,

        "banks": banks,

        "government": government,

        "payment_apps": payment_apps,

        "has_qr": qr,

        "phishing": phishing

        

    })

    report = {

        "platform": platform,

        "screen_type": screen_type,

        "browser_detected": browser,

        "login_page": login,

        "qr_detected": qr,

        "banks": banks,

        "government": government,

        "payment_apps": payment_apps,

        "image": {

            "width": size["width"],

            "height": size["height"],

            "brightness": round(bright,2)

        },

        "phishing": phishing,

        "ocr_text": extracted_text,

        "flags": flags

    }

    return report


# ==========================================================
# Testing
# ==========================================================

if __name__ == "__main__":

    result = analyze_screenshot("uploads/test.png")

    from pprint import pprint

    pprint(result)