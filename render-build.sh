#!/usr/bin/env bash
# ThreatLens Render Build Script (for Native Python Runtime fallback)
# Exit immediately if a command exits with a non-zero status
set -e

echo "===> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "===> Checking for Tesseract OCR..."
if command -v tesseract >/dev/null 2>&1; then
    echo "===> Tesseract is available at: $(command -v tesseract)"
else
    echo "===> Tesseract not found in PATH."
    echo "===> NOTE: For Render deployments with full OCR support, using the Docker runtime"
    echo "===> (via the provided Dockerfile) is recommended because Render native Python"
    echo "===> does not allow sudo apt-get system package installations."
fi

echo "===> Build finished successfully."
