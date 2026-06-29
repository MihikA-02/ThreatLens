// js/modules/api.service.js
// ThreatLens Frontend -> Flask Backend

const API_BASE = "http://127.0.0.1:5000";

/**
 * Analyze Message
 */
export async function analyzeMessage(message) {
  const response = await fetch(`${API_BASE}/analyze/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  return handleResponse(response);
}

/**
 * Analyze URL
 */
export async function analyzeURL(url) {
  const response = await fetch(`${API_BASE}/analyze/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
    }),
  });

  return handleResponse(response);
}

/**
 * Analyze Email
 */
export async function analyzeEmail({
  sender_email,
  display_name,
  subject,
  body,
  attachment,
}) {
  const response = await fetch(`${API_BASE}/analyze/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_email,
      display_name,
      subject,
      body,
      attachment,
    }),
  });

  return handleResponse(response);
}

/**
 * Analyze Screenshot
 */
export async function analyzeScreenshot(file) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch(`${API_BASE}/analyze/screenshot`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

/**
 * Generic Analyze
 * Automatically chooses the correct backend API.
 */
export async function analyzeContent({
  type,
  value,
  file,
  sender_email,
  display_name,
  subject,
  body,
  attachment,
}) {
  switch (type) {
    case "message":
      return analyzeMessage(value);

    case "url":
      return analyzeURL(value);

    case "email":
      return analyzeEmail({
        sender_email,
        display_name,
        subject,
        body,
        attachment,
      });

    case "screenshot":
      return analyzeScreenshot(file);

    default:
      throw new Error("Unsupported analysis type.");
  }
}

/**
 * Handle Backend Response
 */
async function handleResponse(response) {
  if (!response.ok) {
    let error = {};

    try {
      error = await response.json();
    } catch { }

    throw new Error(
      error.error ||
      error.message ||
      `Server Error (${response.status})`
    );
  }

  return response.json();
}