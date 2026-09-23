const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const URL = /\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|net|org|io|dev|me|ph|co|app)\/\S*/gi;
// Digit runs with phone-ish separators; only redacted at 10–15 digits so date ranges like "2019 - 2023" survive.
const PHONE_CANDIDATE = /[+(]?\d[\d\s().-]{6,}\d/g;

// ponytail: regex only catches emails, links and phone numbers — names and street addresses still
// go to the model. Upgrade to an NER/PII service if the free Gemini tier stays in use for real traffic.
export function redactContactInfo(text: string): string {
  return text
    .replace(EMAIL, '[email]')
    .replace(URL, '[link]')
    .replace(PHONE_CANDIDATE, (m) => {
      const digits = m.replace(/\D/g, '').length;
      return digits >= 10 && digits <= 15 ? '[phone]' : m;
    });
}
