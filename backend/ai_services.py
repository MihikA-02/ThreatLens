"""
ThreatLens AI Services
----------------------
Handles:
- Loading API keys
- Initializing Groq
- Initializing Gemini
- Selecting AI providers
"""

import os

from dotenv import load_dotenv
from groq import Groq
from google import genai


# ==========================================
# Load Environment Variables
# ==========================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

PRIMARY_PROVIDER = os.getenv("PRIMARY_PROVIDER", "groq").lower()
IMAGE_PROVIDER = os.getenv("IMAGE_PROVIDER", "groq").lower()


# ==========================================
# Initialize Groq
# ==========================================

groq_client = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq initialized")
    except Exception as e:
        print("❌ Groq initialization failed")
        print(e)


# ==========================================
# Initialize Gemini (New SDK)
# ==========================================

gemini_client = None

if GEMINI_API_KEY:

    try:

        gemini_client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        print("✅ Gemini initialized")

    except Exception as e:

        print("❌ Gemini initialization failed")
        print(e)

# ==========================================
# Helper Functions
# ==========================================

def get_primary_provider():
    return PRIMARY_PROVIDER


def get_image_provider():
    return IMAGE_PROVIDER


def groq_available():
    return groq_client is not None


def gemini_available():
    return gemini_client is not None

# ==========================================
# Groq Explanation
# ==========================================

def generate_text_explanation(report):
    """
    Uses Groq to explain the phishing analysis.
    """

    if not groq_available():
        return {
            "success": False,
            "provider": "Groq",
            "error": "Groq is unavailable."
        }

    prompt = f"""
You are ThreatLens AI, a cybersecurity assistant.

Below is a phishing detection report.

Risk Score:
{report.get("risk_score")}

Risk Level:
{report.get("risk_level")}

Flags:
{report.get("flags")}

Recommendation:
{report.get("recommendation")}

Your task:

1. Give a short summary.
2. Explain why this content is suspicious.
3. Explain what indicators were found.
4. Tell the user what they should do.

Keep it simple.
Do not use markdown.
Keep it under 200 words.
"""

    try:

        response = groq_client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content":
                    "You are a cybersecurity expert."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.3

        )

        explanation = response.choices[0].message.content

        return {
            "success": True,
            "provider": "Groq",
            "explanation": explanation
        }

    except Exception as e:

        return {
            "success": False,
            "provider": "Groq",
            "error": str(e)
        }


# ==========================================
# Gemini Image Explanation
# ==========================================

from PIL import Image

def generate_image_explanation(image_path, report):

    if not gemini_available():
        return {
            "success": False,
            "provider": "Gemini",
            "error": "Gemini unavailable."
        }

    try:

        image = Image.open(image_path)

        prompt = f"""
You are ThreatLens AI.

Below is the phishing analysis report.

Risk Score:
{report.get("risk_score")}

Risk Level:
{report.get("risk_level")}

Flags:
{report.get("flags")}

OCR Text:
{report.get("ocr_text")}

Analyze the screenshot.

Explain:

1. What is visible.
2. Whether the design appears trustworthy.
3. Whether there are phishing indicators.
4. Whether the screenshot supports our backend findings.
5. Give safety advice.

Keep it under 200 words.
"""

        response = gemini_client.models.generate_content(

            model="gemini-2.5-flash",

            contents=[
                prompt,
                image
            ]

        )

        return {

            "success": True,

            "provider": "Gemini",

            "explanation": response.text

        }

    except Exception as e:

        return {

            "success": False,

            "provider": "Gemini",

            "error": str(e)

        }
# ==========================================
# Testing
# ==========================================

if __name__ == "__main__":

    sample_report = {

        "risk_score": 92,

        "risk_level": "Critical",

        "flags": [

            "Urgency",

            "Credential Request",

            "Brand Impersonation",

            "OTP Request"

        ],

        "recommendation":

        "Do not click links or enter credentials.",

        "ocr_text":

        "Verify your SBI account immediately. Enter OTP."

    }

    print("\n========== GROQ ==========\n")

    result = generate_text_explanation(sample_report)

    print(result)

    print("\n========== GEMINI ==========\n")

    image_result = generate_image_explanation(

        "uploads/test.png",

        sample_report

    )

    print(image_result)