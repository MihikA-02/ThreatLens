"""
ThreatLens Flask API
--------------------

Routes

GET     /
POST    /analyze/image
POST    /analyze/url
POST    /analyze/message
POST    /analyze/email
"""

import os

from flask import (
    Flask,
    jsonify,
    request
)

from werkzeug.utils import secure_filename
from backend.ai_pipeline import merge_with_ai
from flask_cors import CORS
from backend.screenshot_checker import analyze_screenshot as run_screenshot_analysis
from backend.risk_engine import generate_risk_report
from backend.messagecheck import analyze_message
from backend.url_checker import analyze_urls
from backend.emailcheck import analyze_email


# ==========================================
# Flask App
# ==========================================

app = Flask(__name__)

CORS(app)
# ==========================================
# Config
# ==========================================

import tempfile

UPLOAD_FOLDER = os.path.join(
    tempfile.gettempdir(),
    "threatlens_uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "bmp",
    "webp"
}


# ==========================================
# Helpers
# ==========================================

def allowed_file(filename):

    if "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    return extension in ALLOWED_EXTENSIONS

# ==========================================
# Home Route
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "application": "ThreatLens",

        "status": "Running",

        "version": "1.0"

    })


# ==========================================
# Analyze Screenshot
# ==========================================
# ==========================================
# Analyze Screenshot
# ==========================================

@app.route("/analyze/screenshot", methods=["POST"])
def analyze_screenshot():

    print("\n========== SCREENSHOT REQUEST ==========")
    print("Files:", request.files)
    print("Form :", request.form)
    print("=======================================\n")

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error": "No image uploaded."
            }), 400

        image = request.files["image"]
        print("Filename:", image.filename)
        print("Content-Type:", image.content_type)

        if image.filename == "":

            return jsonify({
                "success": False,
                "error": "No file selected."
            }), 400

        if not allowed_file(image.filename):

            return jsonify({
                "success": False,
                "error": "Unsupported image format."
            }), 400

        filename = secure_filename(image.filename)

        save_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        image.save(save_path)

        # Run the screenshot checker to get flags and metadata
        screenshot_report = run_screenshot_analysis(save_path)
        screenshot_flags = screenshot_report.get("flags", [])

        # Build a flat risk report (same shape as URL/message/email results)
        result = generate_risk_report(screenshot_flags=screenshot_flags)

        # Attach screenshot metadata for the frontend
        result["screenshot"] = screenshot_report

        # Merge with AI (same pattern as other routes)
        ocr_text = screenshot_report.get("ocr_text", "")
        result = merge_with_ai("screenshot", ocr_text, result)

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    # ==========================================
# Analyze URL
# ==========================================

@app.route("/analyze/url", methods=["POST"])
def analyze_url_route():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error": "Missing JSON body."

            }), 400

        url = data.get("url", "").strip()

        if url == "":

            return jsonify({

                "success": False,

                "error": "URL is required."

            }), 400

        result = analyze_urls(url)
        result = merge_with_ai("url",url,result)

        return jsonify({

            "success": True,

            "result": result

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ==========================================
# Analyze Message
# ==========================================

@app.route("/analyze/message", methods=["POST"])
def analyze_message_route():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error": "Missing JSON body."

            }), 400

        message = data.get("message", "").strip()

        if message == "":

            return jsonify({

                "success": False,

                "error": "Message is required."

            }), 400

        result = analyze_message(message)
        result = merge_with_ai("message",message,result)

        return jsonify({

            "success": True,

            "result": result

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ==========================================
# Analyze Email
# ==========================================

@app.route("/analyze/email", methods=["POST"])
def analyze_email_route():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error": "Missing JSON body."

            }), 400

        sender_email = data.get("sender_email", "")
        display_name = data.get("display_name", "")
        subject = data.get("subject", "")
        body = data.get("body", "")
        attachment = data.get("attachment", "")

        result = analyze_email(
            sender_email=sender_email,
            display_name=display_name,
            subject=subject,
            body=body,
            attachment=attachment
        )
        content = f"""
        Sender: {sender_email}
        Display Name: {display_name}
        Subject: {subject}

        {body}
        """

        result = merge_with_ai("email",content,result)

        return jsonify({

            "success": True,

            "result": result

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500
    # ==========================================
# Start Flask Server
# ==========================================

if __name__ == "__main__":

    print("\n===================================")
    print("🛡 ThreatLens Backend Started")
    print("===================================")
    print("Server : http://127.0.0.1:5000")
    print("Status : Running")
    print("Debug  : True")
    print("===================================\n")

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True,

        use_reloader=False

    )