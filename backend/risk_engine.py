from collections import Counter

# ==========================================================
# ThreatLens Risk Engine
# Part 1 - Master Configuration
# ==========================================================


# ----------------------------------------------------------
# Master Flag Weights
# (Every module reports flags.
# ONLY Risk Engine decides score.)
# ----------------------------------------------------------

FLAG_WEIGHTS = {

    # Message Analysis
    "Urgency": 10,
    "Fear Tactics": 15,
    "Credential Request": 25,
    "OTP Request": 20,
    "Payment Request": 20,
    "Prize / Lottery Scam": 15,
    "Investment Scam": 15,
    "Call To Action": 10,
    "Bank Impersonation": 25,

    # URL Analysis
    "Brand Impersonation": 30,
    "Possible Typosquatting": 25,
    "Suspicious Top-Level Domain": 15,
    "URL Shortener": 15,
    "Redirect Parameter": 10,
    "Suspicious Port": 15,
    "Uses IP Address": 20,
    "Embedded Username/Password": 25,
    "Uses HTTP instead of HTTPS": 15,
    "Long URL": 10,
    "Too Many Subdomains": 10,
    "Punycode Domain": 20,

    # Email Analysis
    "Display Name Mismatch": 20,
    "Disposable Email Provider": 20,
    "Free Email Provider": 5,
    "Unicode Spoofing": 25,
    "Dangerous Attachment (.exe)": 35,
    "Dangerous Attachment (.zip)": 25,
    "Dangerous Attachment (.js)": 35,
    "Dangerous Attachment (.bat)": 35,
    "Dangerous Attachment (.cmd)": 35,

    # Screenshot Analysis
    "Fake Login Page": 30,
    "QR Code": 10,
    "Payment QR": 20,
    "Bank Logo": 15,
    "Government Logo": 15,
    "Fake Website UI": 25,
    "Payment App": 15,
    "Hidden Text": 15,
    "Blurred Text": 10,

    # AI
    "LLM Suspicion": 20
}


# ----------------------------------------------------------
# Combination Bonuses
# More dangerous when multiple indicators exist together.
# ----------------------------------------------------------

COMBINATION_RULES = [

    (
        {
            "Urgency",
            "Credential Request"
        },
        15
    ),

    (
        {
            "Urgency",
            "OTP Request"
        },
        15
    ),

    (
        {
            "Brand Impersonation",
            "Credential Request"
        },
        20
    ),

    (
        {
            "Brand Impersonation",
            "OTP Request"
        },
        20
    ),

    (
        {
            "Brand Impersonation",
            "Bank Impersonation"
        },
        20
    ),

    (
        {
            "Dangerous Attachment (.exe)",
            "Fear Tactics"
        },
        25
    ),

    (
        {
            "QR Code",
            "Payment Request"
        },
        20
    ),

    (
        {
            "Fake Login Page",
            "Credential Request"
        },
        30
    ),

    (
        {
            "Display Name Mismatch",
            "Brand Impersonation"
        },
        15
    ),

    (
        {
            "Redirect Parameter",
            "URL Shortener"
        },
        15
    ),

    (
        {
            "Uses IP Address",
            "Credential Request"
        },
        20
    )

]


# ----------------------------------------------------------
# Risk Levels
# ----------------------------------------------------------

RISK_LEVELS = [

    (0, 24, "Safe"),

    (25, 49, "Suspicious"),

    (50, 74, "High Risk"),

    (75, 100, "Critical")

]


# ==========================================================
# Remove Duplicate Flags
# ==========================================================

def unique_flags(*flag_lists):

    merged = []

    for flag_list in flag_lists:

        if flag_list:

            merged.extend(flag_list)

    return sorted(list(set(merged)))


# ==========================================================
# Count Flags
# ==========================================================

def flag_counter(flags):

    return dict(Counter(flags))


# ==========================================================
# Risk Level
# ==========================================================

def get_risk_level(score):

    for low, high, level in RISK_LEVELS:

        if low <= score <= high:

            return level

    return "Critical"


# ==========================================================
# Clamp Score
# ==========================================================

def clamp(score):

    return max(0, min(score, 100))

# ==========================================================
# Part 2 - Threat Scoring Engine
# ==========================================================


# ----------------------------------------------------------
# Calculate Score From Flags
# ----------------------------------------------------------

def calculate_flag_score(flags):

    score = 0

    for flag in flags:

        score += FLAG_WEIGHTS.get(flag, 0)

    return score


# ----------------------------------------------------------
# Apply Combination Bonuses
# ----------------------------------------------------------

def apply_combination_bonus(flags):

    bonus = 0

    flag_set = set(flags)

    matched = []

    for required_flags, points in COMBINATION_RULES:

        if required_flags.issubset(flag_set):

            bonus += points

            matched.append({

                "combination": sorted(list(required_flags)),

                "bonus": points

            })

    return bonus, matched


# ----------------------------------------------------------
# Module Statistics
# ----------------------------------------------------------

def module_statistics(

        message_flags,

        url_flags,

        email_flags,

        screenshot_flags

):

    return {

        "message_flags": len(message_flags),

        "url_flags": len(url_flags),

        "email_flags": len(email_flags),

        "screenshot_flags": len(screenshot_flags)

    }


# ----------------------------------------------------------
# Calculate Individual Contributions
# ----------------------------------------------------------

def module_scores(

        message_flags,

        url_flags,

        email_flags,

        screenshot_flags

):

    return {

        "message": calculate_flag_score(message_flags),

        "url": calculate_flag_score(url_flags),

        "email": calculate_flag_score(email_flags),

        "screenshot": calculate_flag_score(screenshot_flags)

    }


# ----------------------------------------------------------
# Merge All Flags
# ----------------------------------------------------------

def merge_flags(

        message_flags,

        url_flags,

        email_flags,

        screenshot_flags

):

    return unique_flags(

        message_flags,

        url_flags,

        email_flags,

        screenshot_flags

    )


# ----------------------------------------------------------
# Final Score Calculation
# ----------------------------------------------------------

def calculate_total_score(

        message_flags,

        url_flags,

        email_flags,

        screenshot_flags

):

    merged = merge_flags(

        message_flags,

        url_flags,

        email_flags,

        screenshot_flags

    )

    base_score = calculate_flag_score(merged)

    bonus_score, combinations = apply_combination_bonus(merged)

    total = clamp(base_score + bonus_score)

    return {

        "merged_flags": merged,

        "base_score": base_score,

        "bonus_score": bonus_score,

        "total_score": total,

        "matched_combinations": combinations

    }


# ----------------------------------------------------------
# Threat Summary
# ----------------------------------------------------------

def threat_summary(score):

    if score <= 24:

        return "Very few phishing indicators detected."

    elif score <= 49:

        return "Some suspicious indicators detected."

    elif score <= 74:

        return "Multiple phishing indicators detected."

    return "Critical phishing indicators detected. Avoid interacting with this content."


# ----------------------------------------------------------
# Recommendation
# ----------------------------------------------------------

def recommendation(score):

    if score <= 24:

        return "Content appears safe, but remain cautious."

    elif score <= 49:

        return "Verify the sender and avoid sharing sensitive information."

    elif score <= 74:

        return "Do not click links or download attachments until verified."

    return "Do NOT interact with this message. Block, report, and delete it immediately."

# ==========================================================
# Part 3 - Final Risk Report
# ==========================================================


def generate_risk_report(
        message_flags=None,
        url_flags=None,
        email_flags=None,
        screenshot_flags=None
):

    message_flags = message_flags or []
    url_flags = url_flags or []
    email_flags = email_flags or []
    screenshot_flags = screenshot_flags or []

    # Module statistics
    stats = module_statistics(
        message_flags,
        url_flags,
        email_flags,
        screenshot_flags
    )

    # Individual module scores
    scores = module_scores(
        message_flags,
        url_flags,
        email_flags,
        screenshot_flags
    )

    # Final merged score
    result = calculate_total_score(
        message_flags,
        url_flags,
        email_flags,
        screenshot_flags
    )

    final_score = result["total_score"]

    report = {

        "risk_score": final_score,

        "risk_level": get_risk_level(final_score),

        "summary": threat_summary(final_score),

        "recommendation": recommendation(final_score),

        "flags": result["merged_flags"],

        "base_score": result["base_score"],

        "combination_bonus": result["bonus_score"],

        "matched_combinations": result["matched_combinations"],

        "module_scores": scores,

        "statistics": stats

    }

    return report


# ==========================================================
# Testing
# ==========================================================

if __name__ == "__main__":

    message_flags = [

        "Urgency",
        "Credential Request",
        "OTP Request"

    ]

    url_flags = [

        "Brand Impersonation",
        "Suspicious Top-Level Domain",
        "Redirect Parameter"

    ]

    email_flags = [

        "Display Name Mismatch",
        "Dangerous Attachment (.exe)"

    ]

    screenshot_flags = [

        "Fake Login Page"

    ]

    report = generate_risk_report(

        message_flags,
        url_flags,
        email_flags,
        screenshot_flags

    )

    from pprint import pprint

    pprint(report)