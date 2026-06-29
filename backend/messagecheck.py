import re

# -------------------------------
# Phishing / Scam Detection Rules
# -------------------------------

RULES = {
    "Urgency": [
        "urgent", "immediately", "immediate", "act now",
        "within 24 hours", "expire", "expires",
        "limited time", "last chance", "deadline"
    ],

    "Credential Request": [
        "login", "log in", "password", "username",
        "verify account", "verify your account",
        "confirm account", "reset password",
        "update password", "security check"
    ],

    "OTP Request": [
        "otp", "one time password",
        "verification code", "authentication code"
    ],

    "Bank Impersonation": [
        "bank", "sbi", "hdfc", "icici",
        "axis", "kotak", "rbi", "net banking"
    ],

    "Payment Request": [
        "pay now", "payment", "upi",
        "wallet", "transaction",
        "invoice", "refund", "pending payment"
    ],

    "Prize / Lottery Scam": [
        "congratulations", "winner", "won",
        "lottery", "reward", "claim prize",
        "gift", "free iphone", "jackpot"
    ],

    "Investment Scam": [
        "investment", "crypto", "bitcoin",
        "double your money", "profit",
        "returns", "forex", "trading"
    ],

    "Fear Tactics": [
        "blocked", "suspended",
        "locked", "disabled",
        "legal action", "account suspended",
        "your account has been blocked"
    ],

    "Call To Action": [
        "click here", "click below",
        "tap here", "open link",
        "visit now", "verify now"
    ]
}


# -------------------------------
# Risk Weights
# -------------------------------

WEIGHTS = {
    "Urgency": 10,
    "Credential Request": 20,
    "OTP Request": 20,
    "Bank Impersonation": 15,
    "Payment Request": 15,
    "Prize / Lottery Scam": 10,
    "Investment Scam": 10,
    "Fear Tactics": 10,
    "Call To Action": 10
}


# -------------------------------
# Message Analyzer
# -------------------------------

def analyze_message(text):
    """
    Analyze message content for phishing indicators.

    Args:
        text (str)

    Returns:
        dict
    """

    text = text.lower()

    detected_flags = []
    matched_keywords = []
    risk_score = 0

    for category, keywords in RULES.items():

        for keyword in keywords:

            if re.search(r"\b" + re.escape(keyword) + r"\b", text):

                if category not in detected_flags:
                    detected_flags.append(category)
                    risk_score += WEIGHTS[category]

                matched_keywords.append(keyword)

    risk_score = min(risk_score, 100)

    return {
        "risk_score": risk_score,
        "flags": detected_flags,
        "matched_keywords": matched_keywords
    }

if __name__ == "__main__":

    sample = """
    Dear Customer,

    Your SBI account has been suspended.

    Verify immediately by clicking the link below.

    Enter your OTP to continue.
    """

    result = analyze_message(sample)

    print(result)