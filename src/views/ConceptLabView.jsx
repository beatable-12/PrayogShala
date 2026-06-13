import React, { useState } from 'react';

export default function ConceptLabView({ xp, setXp, setCurrentView }) {
  const [pythonCode, setPythonCode] = useState(
`class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Initialize your pointers here
        left, right = 0, len(s) - 1
        
        while left < right:
            # Write logic to skip non-alphanumeric
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
                
            if s[left].lower() != s[right].lower():
                return False
                
            left += 1
            right -= 1
            
        return True`
  );

  const [language, setLanguage] = useState('English');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  // Multilingual responses for Sarvam AI
  const sarvamGreetings = {
    English: 'Hello! Two Pointers means using two variables to track indices. For palindromes:\n1. Place L at index 0.\n2. Place R at the end.\n3. Compare characters while L < R.',
    'Hindi (हिन्दी)': 'नमस्ते! Two Pointers का मतलब है इंडेक्स को ट्रैक करने के लिए दो वेरिएबल्स का उपयोग करना। Palindromes के लिए:\n1. L को इंडेक्स 0 पर रखें।\n2. R को अंत में रखें।\n3. L < R होने तक कैरेक्टर की तुलना करें।',
    'Tamil (தமிழ்)': 'வணக்கம்! Two Pointers என்பது குறியீடுகளைக் கண்காணிக்க இரண்டு மாறிகளைப் பயன்படுத்துவதாகும். Palindromes க்கு:\n1. L ஐ குறியீடு 0 இல் வைக்கவும்.\n2. R ஐ இறுதியில் வைக்கவும்.\n3. L < R ஆக இருக்கும்போது எழுத்துக்களை ஒப்பிடவும்.',
    'Telugu (తెలుగు)': 'నమస్తే! Two Pointers అంటే సూచీలను ట్రాక్ చేయడానికి రెండు వేరియబుల్స్ ఉపయోగించడం. Palindromes కోసం:\n1. L ని ఇండెక్స్ 0 వద్ద ఉంచండి.\n2. R ని చివర ఉంచండి.\n3. L < R ఉన్నప్పుడు అక్షరాలను పోల్చండి.',
    'Kannada (ಕನ್ನಡ)': 'ನಮಸ್ತೆ! Two Pointers ಎಂದರೆ ಸೂಚ್ಯಂಕಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಎರಡು ವೇರಿಯಬಲ್ ಬಳಸುವುದು. Palindromes ಗಾಗಿ:\n1. L ಅನ್ನು ಸೂಚ್ಯಂಕ 0 ನಲ್ಲಿ ಇರಿಸಿ.\n2. R ಅನ್ನು ಕೊನೆಯಲ್ಲಿ ಇರಿಸಿ.\n3. L < R ಇರುವಾಗ ಅಕ್ಷರಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ.'
  };

  const [chatHistory, setChatHistory] = useState([
    { sender: 'user', text: 'Can you explain the "Two Pointers" logic for this palindrome problem?' },
    { sender: 'sarvam', text: sarvamGreetings.English }
  ]);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    
    // Update the greeting bubble in the history to show translation logic
    setChatHistory((prev) => 
      prev.map((msg, idx) => {
        if (idx === 1 && msg.sender === 'sarvam') {
          return { ...msg, text: sarvamGreetings[selectedLang] || sarvamGreetings.English };
        }
        return msg;
      })
    );
  };

  const handleVerify = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      setShowModal(true);
      setXp(xp + 500); // Add 500 XP on successful verification
    }, 1500);
  };

  const handleSendPrompt = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "I am ready to help you with pointer logic, index bounds, or array algorithms! Switch languages if you prefer Hindi, Tamil, Telugu, or Kannada.";
      if (userText.toLowerCase().includes('hindi')) {
        reply = "हाँ! आप दाईं ओर के ड्रॉपडाउन से हिंदी चुन सकते हैं। मैं आपकी मदद के लिए तैयार हूँ।";
      } else if (userText.toLowerCase().includes('pointer') || userText.toLowerCase().includes('left') || userText.toLowerCase().includes('right')) {
        reply = "Make sure left starts at `0` and right starts at `len(s) - 1`. Increase left when character is not alphanumeric, and decrease right for same, otherwise compare values.";
      }
      setChatHistory((prev) => [...prev, { sender: 'sarvam', text: reply }]);
    }, 600);
  };

  const handleExplain = () => {
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'sarvam',
        text: 'The Two Pointer technique is used here to avoid extra space. By checking characters at L and R indices simultaneously, we achieve O(n) time complexity and O(1) space. This is highly efficient for memory-constrained engineering tasks.'
      }
    ]);
  };

  const handleGetHint = () => {
    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'sarvam',
        text: 'Hint: You can use built-in alphanumeric helpers like isalnum() in Python to skip punctuation and spaces. Incrementation of L and decrementation of R is required!'
      }
    ]);
  };

  return (
    <main className="ml-64 mt-16 flex h-[calc(100vh-64px)] overflow-hidden flex-grow">
      {/* Left Panel: Problem Statement & Coding */}
      <section className="w-7/12 flex flex-col border-r border-outline-variant bg-surface-container-lowest">
        {/* Header/Tabs */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant bg-surface-bright">
          <div className="flex items-center gap-3">
            <span className="text-label-md font-mono text-primary px-3 py-1 bg-primary-fixed border border-outline-variant rounded font-bold">
              MOD 04
            </span>
            <h1 className="font-headline text-headline-md font-bold text-on-surface">Valid Palindrome</h1>
          </div>
          <div className="flex gap-2">
            <div className="text-label-md font-mono text-tertiary px-3 py-1 rounded bg-surface-container-high text-xs font-bold uppercase">
              EASY
            </div>
            <div className="text-label-md font-mono text-tertiary px-3 py-1 rounded bg-surface-container-high text-xs font-bold font-mono">
              15:00 MIN
            </div>
          </div>
        </div>

        {/* Problem Content Scroll Area */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-hide space-y-4">
          <div className="prose max-w-none text-on-surface text-sm leading-relaxed">
            <p className="mb-4">
              A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.
            </p>
            <div className="bg-surface-container p-4 rounded-lg mb-6 border border-outline-variant">
              <span className="text-label-md font-mono text-xs text-on-surface-variant uppercase mb-1 block font-bold">
                Example 1
              </span>
              <p className="font-mono text-code-sm mb-1">
                <span className="text-primary font-bold">Input:</span> s = "A man, a plan, a canal: Panama"
              </p>
              <p className="font-mono text-code-sm mb-1">
                <span className="text-primary font-bold">Output:</span> true
              </p>
              <p className="text-on-surface-variant italic mt-1 text-xs">
                Explanation: "amanaplanacanalpanama" is a palindrome.
              </p>
            </div>
            <h2 className="font-headline text-headline-md text-sm font-bold mb-3">Implement Solution</h2>
          </div>

          {/* Coding Area Simulation */}
          <div className="code-editor-bg rounded-lg p-4 h-[350px] relative border border-outline flex flex-col">
            <div className="absolute top-4 right-4 px-3 py-1 bg-surface-container-low text-on-surface text-label-md font-mono text-xs rounded border border-outline-variant font-bold">
              Python 3
            </div>
            <div className="flex-grow flex font-mono text-xs text-surface-bright leading-relaxed overflow-y-auto pt-4">
              <div className="text-gray-400/50 pr-4 select-none border-r border-white/5 mr-4 text-right">
                {pythonCode.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                className="flex-1 bg-transparent text-white focus:outline-none resize-none overflow-hidden h-full font-mono text-xs leading-relaxed"
                value={pythonCode}
                onChange={(e) => setPythonCode(e.target.value)}
                spellCheck="false"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleVerify}
                className="px-6 py-2 bg-on-background text-surface-bright font-mono font-bold text-xs rounded shadow-lg hover:bg-primary transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {isVerifying ? 'sync' : 'verified'}
                </span>
                {isVerifying ? 'Verifying...' : 'Verify Solution'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel: Sarvam AI Assistant */}
      <section className="w-5/12 bg-surface-container flex flex-col relative">
        <div className="p-4 border-b border-outline-variant bg-surface-container-high flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center float-animation text-on-primary shadow">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <span className="font-headline text-headline-md text-sm text-on-surface font-bold">Sarvam AI Assistant</span>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg font-mono text-xs px-3 py-1 outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-surface-container transition-colors"
          >
            <option>English</option>
            <option>Hindi (हिन्दी)</option>
            <option>Tamil (தமிழ்)</option>
            <option>Telugu (తెలుగు)</option>
            <option>Kannada (ಕನ್ನಡ)</option>
          </select>
        </div>

        {/* Chat/Assistant Content */}
        <div className="flex-grow p-6 overflow-y-auto scrollbar-hide space-y-4 max-h-[calc(100vh-250px)]">
          {chatHistory.map((c, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-[85%] ${
                c.sender === 'user' ? 'self-start' : 'self-end flex-row-reverse ml-auto'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 text-white shadow-sm shrink-0 ${
                  c.sender === 'user' ? 'bg-tertiary' : 'bg-primary'
                }`}
              >
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {c.sender === 'user' ? 'person' : 'smart_toy'}
                </span>
              </div>
              <div
                className={`p-3 rounded-xl shadow-sm border border-outline-variant text-sm whitespace-pre-line leading-relaxed ${
                  c.sender === 'user'
                    ? 'bg-surface-container-lowest rounded-tl-none'
                    : 'bg-primary-container text-on-primary-container rounded-tr-none'
                }`}
              >
                {c.text}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action Area */}
        <div className="p-4 bg-surface-container-highest border-t border-outline-variant mt-auto">
          <div className="flex gap-3 mb-3">
            <button
              onClick={handleExplain}
              className="flex-1 py-2 bg-secondary-container text-on-secondary-container font-mono font-bold text-xs rounded hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              Explain Concept
            </button>
            <button
              onClick={handleGetHint}
              className="flex-grow py-2 bg-surface-container-lowest text-primary border border-primary font-mono font-bold text-xs rounded hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              Get Hint
            </button>
          </div>
          <div className="relative group">
            <input
              type="text"
              placeholder="Ask Sarvam anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-2 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button
              onClick={handleSendPrompt}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/40 backdrop-blur-sm p-6">
          <div className="bg-surface-container-lowest w-full max-w-xl p-8 rounded-xl border border-outline shadow-2xl flex flex-col items-center text-center animate-fade-in">
            <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mb-6 relative shadow-inner">
              <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            </div>
            <h2 className="font-headline text-display-lg text-on-surface mb-2 font-bold">Achievement Unlocked!</h2>
            <p className="text-body-lg text-on-surface-variant mb-6 leading-relaxed">
              You've mastered the Two Pointer pattern. Your solution is 98% more efficient than others.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => setShowModal(false)}
                className="py-3 bg-surface-container-high text-on-surface font-mono font-bold text-xs rounded-lg hover:bg-surface-container-highest transition-all"
              >
                Review Code
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrentView('forge'); // Send user to build phase workspace next
                }}
                className="py-3 bg-primary text-on-primary font-mono font-bold text-xs rounded-lg hover:bg-primary-container transition-all"
              >
                Next: Project Forge
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
