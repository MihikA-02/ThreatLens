import cv2
import easyocr

# Load the OCR model only when first needed
reader = None


def get_reader():
    global reader

    if reader is None:
        reader = easyocr.Reader(["en"], gpu=False)

    return reader


def extract_text(file_path):
    image = cv2.imread(file_path)

    if image is None:
        raise FileNotFoundError(
            f"Could not open image: {file_path}"
        )

    ocr_reader = get_reader()
    results = ocr_reader.readtext(image)

    return "\n".join(
        text for (_, text, _) in results
    )