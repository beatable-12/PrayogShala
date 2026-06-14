import React, { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'auto', label: 'Auto-detect', native: '🌐' },
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { code: 'Marathi', label: 'Marathi', native: 'मराठी' },
  { code: 'Gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'Punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'Odia', label: 'Odia', native: 'ଓଡ଼ିଆ' },
];

const DEVANAGARI_RANGE = /[\u0900-\u097F]/;
const TAMIL_RANGE = /[\u0B80-\u0BFF]/;
const BENGALI_RANGE = /[\u0980-\u09FF]/;
const TELUGU_RANGE = /[\u0C00-\u0C7F]/;
const GURMUKHI_RANGE = /[\u0A00-\u0A7F]/;
const GUJARATI_RANGE = /[\u0A80-\u0AFF]/;
const KANNADA_RANGE = /[\u0C80-\u0CFF]/;
const MALAYALAM_RANGE = /[\u0D00-\u0D7F]/;
const ODIA_RANGE = /[\u0B00-\u0B7F]/;
const MARATHI_RANGE = /[\u0900-\u097F]/;

const detectLanguage = (text) => {
  if (DEVANAGARI_RANGE.test(text)) return 'Hindi';
  if (BENGALI_RANGE.test(text)) return 'Bengali';
  if (TAMIL_RANGE.test(text)) return 'Tamil';
  if (TELUGU_RANGE.test(text)) return 'Telugu';
  if (GURMUKHI_RANGE.test(text)) return 'Punjabi';
  if (GUJARATI_RANGE.test(text)) return 'Gujarati';
  if (KANNADA_RANGE.test(text)) return 'Kannada';
  if (MALAYALAM_RANGE.test(text)) return 'Malayalam';
  if (ODIA_RANGE.test(text)) return 'Odia';
  return 'English';
};

const HINDI_RESPONSES = {
  hint: [
    "इस समस्या को हल करने के लिए सोचें कि कौन सा डेटा स्ट्रक्चर सबसे उपयुक्त होगा।",
    "समस्या को छोटे-छोटे उप-समस्याओं में बाँटें और प्रत्येक को अलग-अलग हल करें।",
    "दो-पॉइंटर तकनीक का उपयोग करने पर विचार करें — यह अक्सर O(n²) को O(n) में बदल देती है।",
    "पैटर्न देखें: क्या यह स्लाइडिंग विंडो की समस्या है? प्रीफिक्स सम?",
  ],
  explain: [
    "यह समस्या आपकी डेटा स्ट्रक्चर की समझ को परखती है। सही डेटा स्ट्रक्चर चुनना महत्वपूर्ण है।",
    "टाइम कॉम्प्लेक्सिटी मापती है कि इनपुट साइज़ बढ़ने पर रनटाइम कैसे बढ़ता है। O(n) = लीनियर, O(n²) = क्वाड्रेटिक।",
    "स्पेस कॉम्प्लेक्सिटी मापती है कि आपका एल्गोरिद्म कितनी अतिरिक्त मेमोरी उपयोग करता है।",
  ],
  debug: [
    "अपने लूप की सीमाएँ जाँचें — off-by-one त्रुटियाँ आम हैं।",
    "क्या आप खाली इनपुट केस को संभाल रहे हैं? एज केस अक्सर बग का कारण बनते हैं।",
    "वेरिएबल इनिशियलाइज़ेशन जाँचें — अनइनिशियलाइज़्ड वेरिएबल अप्रत्याशित व्यवहार पैदा करते हैं।",
  ],
  general: "आपके प्रश्न के लिए धन्यवाद! कृपया अपना कोड और समस्या का विवरण साझा करें ताकि मैं आपकी बेहतर मदद कर सकूँ।",
};

const BENGALI_RESPONSES = {
  hint: [
    "এই সমস্যা সমাধানের জন্য কোন ডেটা স্ট্রাকচার সবচেয়ে উপযুক্ত হবে তা ভাবুন।",
    "সমস্যাটিকে ছোট ছোট উপ-সমস্যায় ভাগ করুন এবং প্রতিটি আলাদাভাবে সমাধান করুন।",
  ],
  explain: [
    "এই সমস্যাটি আপনার ডেটা স্ট্রাকচার বোঝার ক্ষমতা পরীক্ষা করে। সঠিক ডেটা স্ট্রাকচার নির্বাচন করা গুরুত্বপূর্ণ।",
  ],
  debug: [
    "আপনার লুপের সীমা পরীক্ষা করুন — off-by-one ত্রুটিগুলি সাধারণ।",
  ],
  general: "আপনার প্রশ্নের জন্য ধন্যবাদ! অনুগ্রহ করে আপনার কোড এবং সমস্যার বিবরণ শেয়ার করুন।",
};

const TAMIL_RESPONSES = {
  hint: [
    "இந்தச் சிக்கலைத் தீர்க்க எந்த தரவு கட்டமைப்பு மிகவும் பொருத்தமானதாக இருக்கும் என்று சிந்தியுங்கள்.",
  ],
  explain: [
    "இந்தச் சிக்கல் உங்கள் தரவு கட்டமைப்பு புரிதலை சோதிக்கிறது. சரியான தரவு கட்டமைப்பைத் தேர்ந்தெடுப்பது முக்கியம்.",
  ],
  debug: [
    "உங்கள் லூப் எல்லைகளைச் சரிபார்க்கவும் — off-by-one பிழைகள் பொதுவானவை.",
  ],
  general: "உங்கள் கேள்விக்கு நன்றி! உங்கள் குறியீடு மற்றும் சிக்கல் விவரத்தைப் பகிரவும்.",
};

const LOCAL_LANG_RESPONSES = {
  Hindi: HINDI_RESPONSES,
  Bengali: BENGALI_RESPONSES,
  Tamil: TAMIL_RESPONSES,
};

const LOCAL_RESPONSES = {
  hint: [
    "Think about what data structure gives you O(1) lookups for this problem.",
    "Try breaking the problem into smaller sub-problems and solve each one.",
    "Consider using the two-pointer technique — it often reduces O(n²) to O(n).",
    "Look for patterns: is this a sliding window problem? A prefix sum?",
  ],
  explain: [
    "This problem tests your understanding of efficient data structure usage. Choose the right data structure for repeated operations.",
    "Time complexity measures how runtime grows with input size. O(n) = linear, O(n²) = quadratic.",
    "Space complexity measures extra memory. In-place algorithms use O(1) extra space.",
  ],
  debug: [
    "Check your loop boundaries — off-by-one errors are common.",
    "Are you handling the empty input case? Edge cases often cause bugs.",
    "Check variable initialization — uninitialized variables cause unexpected behavior.",
  ],
  general: "Thanks for your question! Could you share more details about what you're trying to build?",
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getLocalResponse = (query, lang) => {
  if (lang !== 'English' && LOCAL_LANG_RESPONSES[lang]) {
    const res = LOCAL_LANG_RESPONSES[lang];
    const lower = query.toLowerCase();
    if (lower.includes('hint') || lower.includes('संकेत') || lower.includes('ইঙ্গিত')) return pickRandom(res.hint);
    if (lower.includes('debug') || lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('त्रुटि') || lower.includes('বাগ')) return pickRandom(res.debug);
    if (lower.includes('explain') || lower.includes('what') || lower.includes('how') || lower.includes('concept') || lower.includes('समझाइ') || lower.includes('ব্যাখ্যা')) return pickRandom(res.explain);
    return res.general;
  }
  const lower = query.toLowerCase();
  if (lower.includes('hint') || lower.includes('संकेत')) return pickRandom(LOCAL_RESPONSES.hint);
  if (lower.includes('debug') || lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('त्रुटि')) return pickRandom(LOCAL_RESPONSES.debug);
  if (lower.includes('explain') || lower.includes('what') || lower.includes('how') || lower.includes('concept') || lower.includes('समझाइ')) return pickRandom(LOCAL_RESPONSES.explain);
  return LOCAL_RESPONSES.general;
};

export default function AITutorPanel({ language, code, isDarkTheme }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: 'नमस्ते! I\'m Sarvam AI Tutor. I can help you in Hindi, Tamil, Bengali, and 10+ Indian languages. Ask me anything about coding!' },
  ]);
  const [input, setInput] = useState('');
  const [uiLang, setUiLang] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const detectedLang = uiLang === 'auto' ? detectLanguage(input) : uiLang;
    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/sarvam/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: input,
          language: detectedLang,
        }),
      });
      const data = await response.json();
      const explanation = data?.data?.explanation || data?.explanation || '';
      if (explanation) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', content: explanation }]);
      } else {
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', content: getLocalResponse(input, detectedLang) }]);
      }
    } catch {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', content: getLocalResponse(input, detectedLang) }]);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'}`}>
      {/* Language selector */}
      <div className={`px-3 py-2 border-b flex items-center gap-2 ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <span className="material-symbols-outlined text-label-sm text-on-surface-variant">translate</span>
        <select
          value={uiLang}
          onChange={(e) => setUiLang(e.target.value)}
          className={`flex-1 px-2 py-1 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-primary ${
            isDarkTheme ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.native} — {l.label}</option>
          ))}
        </select>
      </div>

      {/* Suggested actions */}
      <div className={`p-3 border-b space-y-1.5 ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <p className={`text-label-xs font-mono uppercase tracking-wider mb-1.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
          Ask in any language
        </p>
        {[
          { icon: 'lightbulb', label: 'Give a hint', query: 'Can you give me a hint for this problem?' },
          { icon: 'school', label: 'Explain concept', query: 'Can you explain the concept behind this?' },
          { icon: 'bug_report', label: 'Help debug', query: 'Can you help me debug my code?' },
          { icon: 'translate', label: 'समझाइए हिंदी में', query: 'मुझे यह कोड हिंदी में समझाइए' },
          { icon: 'translate', label: 'தமிழில் விளக்கவும்', query: 'தயவுசெய்து இந்த பிரச்சனையை தமிழில் விளக்கவும்' },
          { icon: 'translate', label: 'বাংলায় বলুন', query: 'দয়া করে এই সমস্যাটি বাংলায় ব্যাখ্যা করুন' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => setInput(action.query)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors w-full ${
              isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-label-sm">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg text-sm leading-relaxed ${
              msg.role === 'user'
                ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDarkTheme ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-900'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`px-3 py-2 rounded-lg ${isDarkTheme ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t p-3 ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); }}
            placeholder="Ask in English, हिन्दी, தமிழ், বাংলা..."
            className={`flex-1 px-3 py-2 rounded text-sm border focus:outline-none focus:ring-2 focus:ring-primary ${
              isDarkTheme ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded transition-colors ${
              isDarkTheme ? 'bg-primary hover:bg-primary-dark text-on-primary disabled:bg-slate-700' : 'bg-primary hover:bg-primary-dark text-on-primary disabled:bg-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-label-md">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}