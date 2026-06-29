import re

# ==================================================
# Internal Modules
# ==================================================

from backend.ocr import extract_text

from backend.messagecheck import analyze_message

from backend.url_checker import analyze_urls

from backend.emailcheck import analyze_email

from backend.screenshot_checker import analyze_screenshot

from backend.risk_engine import generate_risk_report


# ==================================================
# URL Regex
# ==================================================

URL_PATTERN = re.compile(
    r"(https?://[^\s]+|www\.[^\s]+)",
    re.IGNORECASE
)


# ==================================================
# Email Regex
# ==================================================

EMAIL_PATTERN = re.compile(
    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
)


# ==================================================
# Extract URLs
# ==================================================

def extract_urls(text):

    if not text:
        return []

    return URL_PATTERN.findall(text)


# ==================================================
# Extract Emails
# ==================================================

def extract_emails(text):

    if not text:
        return []

    return EMAIL_PATTERN.findall(text)


# ==================================================
# Clean OCR Text
# ==================================================

def clean_text(text):

    if not text:
        return ""

    text = text.replace("\n", " ")

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ==================================================
# OCR Stage
# ==================================================

def perform_ocr(image_path):

    try:

        text = extract_text(image_path)

        return clean_text(text)

    except Exception as e:

        print("OCR Error:", e)

        return ""
# ==================================================
# Message Analysis Stage
# ==================================================

def analyze_message_stage(text):

    try:

        result = analyze_message(text)

        return result.get("flags", [])

    except Exception as e:

        print("Message Analysis Error:", e)

        return []


# ==================================================
# URL Analysis Stage
# ==================================================

def analyze_url_stage(text):

    urls = extract_urls(text)

    reports = []

    flags = []

    try:

        for url in urls:

            url_result = analyze_urls(url)

            reports.append(url_result)

            flags.extend(
                url_result.get("overall_flags", [])
            )

    except Exception as e:

        print("URL Analysis Error:", e)

    return reports, flags


# ==================================================
# Email Analysis Stage
# ==================================================

def analyze_email_stage(text):

    emails = extract_emails(text)

    reports = []

    flags = []

    try:

        for email in emails:

            result = analyze_email(

                sender_email=email,

                display_name="",

                subject="",

                body="",

                attachment=""

            )

            reports.append(result)

            flags.extend(
                result.get("flags", [])
            )

    except Exception as e:

        print("Email Analysis Error:", e)

    return reports, flags


# ==================================================
# Screenshot Analysis Stage
# ==================================================

def analyze_screenshot_stage(image_path):

    try:

        result = analyze_screenshot(image_path)

        reports = [result]

        flags = result.get("flags", [])

        return reports, flags

    except Exception as e:

        print("Screenshot Analysis Error:", e)

        return [], []

# ==================================================
# Main ThreatLens Analyzer
# ==================================================

def analyze(image_path):

    # ---------------------------------
    # OCR
    # ---------------------------------

    extracted_text = perform_ocr(image_path)

    # ---------------------------------
    # Message Analysis
    # ---------------------------------

    message_flags = analyze_message_stage(
        extracted_text
    )

    # ---------------------------------
    # URL Analysis
    # ---------------------------------

    url_reports, url_flags = analyze_url_stage(
        extracted_text
    )

    # ---------------------------------
    # Email Analysis
    # ---------------------------------

    email_reports, email_flags = analyze_email_stage(
        extracted_text
    )

    # ---------------------------------
    # Screenshot Analysis
    # ---------------------------------

    screenshot_reports, screenshot_flags = analyze_screenshot_stage(
        image_path
    )

    # ---------------------------------
    # Risk Engine
    # ---------------------------------

    risk_report = generate_risk_report(

        message_flags=message_flags,

        url_flags=url_flags,

        email_flags=email_flags,

        screenshot_flags=screenshot_flags

    )

    # ---------------------------------
    # Final Result
    # ---------------------------------

    result = {

        "ocr_text": extracted_text,

        "message": {
            "flags": message_flags
        },

        "urls": {
            "reports": url_reports,
            "flags": url_flags
        },

        "emails": {
            "reports": email_reports,
            "flags": email_flags
        },

        "screenshot": {
            "reports": screenshot_reports,
            "flags": screenshot_flags
        },

        "risk": risk_report

    }

    return result

# ==================================================
# JSON Summary
# ==================================================

def analyze_and_summarize(image_path):

    result = analyze(image_path)

    return {

        "risk_score":
            result["risk"]["risk_score"],

        "risk_level":
            result["risk"]["risk_level"],

        "flags":
            result["risk"]["flags"],

        "recommendation":
            result["risk"]["recommendation"]

    }


# ==================================================
# AI Stage (Placeholder)
# ==================================================

def ai_explanation(result):

    """
    Placeholder.

    The real AI (Groq / Gemini) is merged
    later through ai_pipeline.py.
    """

    result["ai"] = {

        "enabled": False,

        "explanation": None

    }

    return result


# ==================================================
# Full Analysis
# ==================================================

def full_analysis(image_path):

    result = analyze(image_path)

    result = ai_explanation(result)

    return result


# ==================================================
# Testing
# ==================================================

if __name__ == "__main__":

    image = "uploads/test.png"

    report = full_analysis(image)

    from pprint import pprint

    pprint(report)