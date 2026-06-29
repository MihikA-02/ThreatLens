// js/config/app.config.js

export const APP_CONFIG = {
  name: 'ThreatLens',
  version: '1.0.0',
  apiEndpoint: '/api/analyze', // Backend endpoint (not used – we use Anthropic API)
  analysisSteps: [
    'Receiving input...',
    'Extracting content...',
    'Checking reputation...',
    'Running AI analysis...',
    'Calculating threat score...',
    'Generating explanation...',
    'Rendering report...',
  ],
  exampleInputs: {
    url: [
      { label: 'Suspicious Link',  value: 'http://secure-login-verify.tk/bank/update?session=abc123' },
      { label: 'Phishing Email',   value: 'mailto:support@paypa1.com' },
      { label: 'Lottery Scam',     value: 'http://you-won-prize.ru/claim?id=7781' },
      { label: 'Fake Login Page',  value: 'https://g00gle-account-verify.com/signin' },
    ],
    email: [
      { label: 'Phishing Email', value: 'From: support@paypa1-security.com\nSubject: Urgent: Your account has been limited\n\nDear Customer,\nWe detected unusual activity on your account. Please verify your information immediately or your account will be suspended.\n\nClick here: http://paypa1-verify.tk/login' },
    ],
    message: [
      { label: 'Lottery Scam', value: 'Congratulations! You have won Rs. 25,00,000 in the Indian Government Lottery. To claim your prize, share your bank details and OTP with our agent at 9876543210.' },
      { label: 'WhatsApp Scam', value: 'Hello! I am from KYC department. Your bank account will be blocked. Please share your Aadhaar and OTP immediately to avoid suspension.' },
    ],
    screenshot: [],
  },
};

export const ROUTES = {
  DASHBOARD:  'dashboard',
  HISTORY:    'history',
  HOW_TO_USE: 'howto',
  CYBER_RULES:'cyberrules',
  SETTINGS:   'settings',
};
