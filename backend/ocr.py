"""
ThreatLens OCR Module
---------------------
Lightweight text extraction using Tesseract OCR via pytesseract.
Replaces the memory-heavy PyTorch/EasyOCR dependency with a minimal,
resource-friendly OCR pipeline suitable for 512 MiB cloud instances (Render).
"""

import os
import shutil
import logging
import cv2
import numpy as np
from PIL import Image
import pytesseract

logger = logging.getLogger("ThreatLens.OCR")

_tesseract_cmd_resolved = None
_tesseract_available = None


def resolve_tesseract_cmd():
    """
    Locates the Tesseract executable in standard paths or from environment variables.
    Configures pytesseract with the discovered binary path.
    """
    global _tesseract_cmd_resolved, _tesseract_available

    if _tesseract_cmd_resolved is not None and os.path.isfile(_tesseract_cmd_resolved):
        return _tesseract_cmd_resolved

    # 1. Custom environment variable
    custom_cmd = os.environ.get("TESSERACT_CMD")
    if custom_cmd and os.path.isfile(custom_cmd):
        _tesseract_cmd_resolved = custom_cmd
        _tesseract_available = True
        pytesseract.pytesseract.tesseract_cmd = custom_cmd
        _configure_tessdata_prefix()
        return custom_cmd

    # 2. Check if tesseract is directly available on PATH
    which_cmd = shutil.which("tesseract")
    if which_cmd:
        _tesseract_cmd_resolved = which_cmd
        _tesseract_available = True
        pytesseract.pytesseract.tesseract_cmd = which_cmd
        _configure_tessdata_prefix()
        return which_cmd

    # 3. Known Render / Linux deployment paths
    linux_paths = [
        os.path.expanduser("~/.local/bin/tesseract"),
        "/opt/render/project/src/bin/tesseract",
        "/opt/render/project/src/tesseract/bin/tesseract",
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
    ]
    for candidate in linux_paths:
        if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            _tesseract_cmd_resolved = candidate
            _tesseract_available = True
            pytesseract.pytesseract.tesseract_cmd = candidate
            _configure_tessdata_prefix()
            return candidate

    # 4. Known Windows installation paths
    windows_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    ]
    for candidate in windows_paths:
        if os.path.isfile(candidate):
            _tesseract_cmd_resolved = candidate
            _tesseract_available = True
            pytesseract.pytesseract.tesseract_cmd = candidate
            _configure_tessdata_prefix()
            return candidate

    # Attempt to locate tessdata in standard locations
    _configure_tessdata_prefix()

    _tesseract_cmd_resolved = None
    _tesseract_available = False
    return None


def _configure_tessdata_prefix():
    """Configures TESSDATA_PREFIX environment variable if tessdata exists in known directories."""
    if "TESSDATA_PREFIX" in os.environ and os.path.exists(os.environ["TESSDATA_PREFIX"]):
        return

    candidate_tessdata = [
        os.path.expanduser("~/.local/share/tessdata"),
        "/opt/render/project/src/tessdata",
        "/opt/render/project/src/bin/tessdata",
        "/usr/share/tesseract-ocr/4.00/tessdata",
        "/usr/share/tesseract-ocr/5/tessdata",
        "/usr/share/tessdata",
    ]
    for cand in candidate_tessdata:
        if os.path.isdir(cand) and os.path.isfile(os.path.join(cand, "eng.traineddata")):
            os.environ["TESSDATA_PREFIX"] = cand
            break


def is_tesseract_available():
    """Returns True if the Tesseract executable is located and ready for use."""
    global _tesseract_available
    if _tesseract_available is None:
        resolve_tesseract_cmd()
    return bool(_tesseract_available)


def get_reader():
    """
    Retained for backward compatibility with previous call sites.
    Returns None since the heavy EasyOCR reader has been replaced with Tesseract.
    """
    return None


def extract_text(image_input, lang="eng"):
    """
    Extracts text from an image using Tesseract OCR (via pytesseract).

    Accepts:
        image_input: str (file path), numpy.ndarray (OpenCV image), or PIL.Image
        lang: language code (defaults to 'eng')

    Returns:
        str: Extracted text cleaned into space-separated words. Returns an empty
             string if OCR fails or if Tesseract executable is not installed.
    """
    resolve_tesseract_cmd()

    if not is_tesseract_available():
        logger.warning(
            "Tesseract OCR executable not found on host. Skipping OCR text extraction."
        )
        return ""

    try:
        # Handle file path string
        if isinstance(image_input, str):
            if not os.path.isfile(image_input):
                logger.error(f"Image file does not exist: {image_input}")
                return ""
            image = cv2.imread(image_input)
            if image is None:
                logger.error(f"Failed to read image at: {image_input}")
                return ""
        elif isinstance(image_input, np.ndarray):
            image = image_input
        elif isinstance(image_input, Image.Image):
            # PIL Image
            raw_text = pytesseract.image_to_string(image_input, lang=lang)
            return " ".join(raw_text.split())
        else:
            logger.error(f"Unsupported image type passed to OCR: {type(image_input)}")
            return ""

        # Validate numpy image dimensions
        if image is None or not hasattr(image, "shape") or len(image.shape) < 2:
            logger.error("Invalid image array provided to OCR.")
            return ""

        # Convert BGR to RGB if color image
        if len(image.shape) == 3 and image.shape[2] == 3:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            rgb_image = image

        # Execute Tesseract OCR
        raw_text = pytesseract.image_to_string(rgb_image, lang=lang)

        # Standardize whitespace into clean space-separated words
        cleaned = " ".join(raw_text.split())
        return cleaned

    except pytesseract.TesseractNotFoundError:
        logger.warning(
            "Tesseract OCR executable not found during invocation. "
            "Install tesseract-ocr or set TESSERACT_CMD."
        )
        return ""
    except pytesseract.TesseractError as te:
        logger.warning(f"Tesseract engine execution warning: {te}")
        return ""
    except Exception as e:
        logger.error(f"Unexpected error during OCR processing: {e}")
        return ""