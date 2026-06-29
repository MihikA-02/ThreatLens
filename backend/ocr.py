import easyocr
import cv2

# Create the OCR reader once
reader = easyocr.Reader(['en'], gpu=False)


def extract_text(file_path):
    """
    Extract text from an image using EasyOCR.

    Args:
        file_path (str): Path to the image file.

    Returns:
        str: Extracted text.
    """

    # Read the image
    image = cv2.imread(file_path)

    # Check if image was loaded
    if image is None:
        raise FileNotFoundError(f"Could not open image: {file_path}")

    # Perform OCR
    results = reader.readtext(image)

    # Combine all detected text
    extracted_text = "\n".join([text for (_, text, _) in results])

    return extracted_text

