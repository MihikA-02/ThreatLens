# ThreatLens Dockerfile for Render Deployment
# Eliminates PyTorch/EasyOCR memory overhead by using Debian's native Tesseract OCR
FROM python:3.11-slim

# Prevent Python from writing bytecode and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies:
# - tesseract-ocr & tesseract-ocr-eng: lightweight OCR engine (<35MB)
# - libglib2.0-0: required for OpenCV headless image operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Default port for Render
ENV PORT=10000
EXPOSE 10000

# Start Gunicorn with conservative memory settings:
# 1 worker + 2 threads consumes ~55 MiB RAM, well within Render's 512 MiB limit
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 2 --timeout 120"]
