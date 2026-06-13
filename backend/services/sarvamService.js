/**
 * services/sarvamService.js
 *
 * Proxy wrapper for all Sarvam AI API calls.
 * Keeps API keys off the client and centralizes error handling.
 *
 * Methods:
 *  - translateText(text, targetLang)  → Translates English DSA concept to native language
 *  - textToSpeech(text, targetLang)   → Returns audio buffer for TTS playback
 *
 * Sarvam language codes:
 *  Hindi → hi-IN | Tamil → ta-IN | Telugu → te-IN | Kannada → kn-IN | Bengali → bn-IN
 */

const LANG_CODE_MAP = {
  Hindi: 'hi-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Kannada: 'kn-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN',
  English: 'en-IN',
};

export const translateText = async (text, targetLang) => {
  const langCode = LANG_CODE_MAP[targetLang] || 'en-IN';

  // Skip API call if target is English (source language)
  if (langCode === 'en-IN') {
    return { translatedText: text, detectedLanguage: 'English' };
  }

  const response = await fetch(`${process.env.SARVAM_BASE_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': process.env.SARVAM_API_KEY,
    },
    body: JSON.stringify({
      input: text,
      source_language_code: 'en-IN',
      target_language_code: langCode,
      speaker_gender: 'Female',
      mode: 'formal',
      model: 'mayura:v1',
      enable_preprocessing: true,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Sarvam Translate API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return {
    translatedText: data.translated_text,
    detectedLanguage: targetLang,
  };
};

export const textToSpeech = async (text, targetLang) => {
  const langCode = LANG_CODE_MAP[targetLang] || 'en-IN';

  const response = await fetch(`${process.env.SARVAM_BASE_URL}/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': process.env.SARVAM_API_KEY,
    },
    body: JSON.stringify({
      inputs: [text.slice(0, 500)], // Sarvam TTS has input length limits
      target_language_code: langCode,
      speaker: 'meera',           // Female voice
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: 'bulbul:v1',
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Sarvam TTS API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  // Returns base64-encoded audio — client plays via Audio(data:audio/wav;base64,...)
  return { audioBase64: data.audios[0] };
};
