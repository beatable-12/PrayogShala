import React, { useState, useRef, useEffect, useCallback } from 'react';

const LANGUAGES = [
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'Marathi', label: 'Marathi', native: 'मराठी' },
  { code: 'Bengali', label: 'Bengali', native: 'বাংলা' },
];

const ACTIONS = [
  { id: 'explain', icon: 'lightbulb', label: 'Explain This Problem', color: 'from-blue-500 to-blue-600', desc: 'Problem breakdown & intuition' },
  { id: 'approach', icon: 'route', label: 'Suggest Approach', color: 'from-emerald-500 to-emerald-600', desc: 'Brute force → optimal' },
  { id: 'complexity', icon: 'bar_chart', label: 'Time & Space Complexity', color: 'from-violet-500 to-violet-600', desc: 'Big-O analysis' },
  { id: 'hint', icon: 'tips_and_updates', label: 'Give Hint', color: 'from-amber-500 to-amber-600', desc: 'Step-by-step hints' },
  { id: 'debug', icon: 'bug_report', label: 'Debug My Code', color: 'from-rose-500 to-rose-600', desc: 'Find bugs & edge cases' },
  { id: 'review', icon: 'rate_review', label: 'Review My Solution', color: 'from-cyan-500 to-cyan-600', desc: 'Strengths & optimizations' },
  { id: 'viva', icon: 'record_voice_over', label: 'Practice Viva', color: 'from-orange-500 to-orange-600', desc: 'Mock interview questions' },
];

const API_BASE = 'http://localhost:5000';

export default function PrayogMentorPanel({ module, topic, question, project, code, language, onClose }) {
  const [uiLang, setUiLang] = useState('English');
  const [activeAction, setActiveAction] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [vivaQuestions, setVivaQuestions] = useState([]);
  const [vivaIndex, setVivaIndex] = useState(0);
  const audioRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    if (responseRef.current) responseRef.current.scrollTop = responseRef.current.scrollHeight;
  }, [response]);

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, []);

  const callMentor = useCallback(async (actionId) => {
    setActiveAction(actionId);
    setLoading(true);
    if (actionId === 'hint') setHintLevel(prev => prev + 1);
    if (actionId === 'viva') setVivaQuestions([]);

    try {
      const body = {
        language: uiLang,
        moduleTitle: module?.title || '',
        topicTitle: topic?.title || question?.title || '',
        questionText: question?.description || '',
        projectTitle: project?.title || '',
        code: code || '',
        programmingLanguage: language || 'python',
      };

      const endpoints = {
        explain: `${API_BASE}/api/sarvam/mentor/explain`,
        approach: `${API_BASE}/api/sarvam/mentor/approach`,
        complexity: `${API_BASE}/api/sarvam/mentor/complexity`,
        hint: `${API_BASE}/api/sarvam/mentor/hint`,
        debug: `${API_BASE}/api/sarvam/mentor/debug`,
        review: `${API_BASE}/api/sarvam/mentor/review`,
        viva: `${API_BASE}/api/sarvam/mentor/viva`,
      };

      const res = await fetch(endpoints[actionId], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionId === 'hint' ? { ...body, hintLevel } : body),
      });

      const data = await res.json();
      const payload = data?.data || data;

      if (actionId === 'viva' && payload?.questions) {
        setVivaQuestions(payload.questions);
        setVivaIndex(0);
        setResponse(payload.questions[0]?.question || '');
      } else if (actionId === 'hint') {
        const hints = payload?.hints || [];
        setResponse(hints.slice(0, hintLevel).join('\n\n') || 'No more hints available.');
      } else {
        setResponse(payload?.explanation || payload?.response || payload?.analysis || JSON.stringify(payload));
      }
    } catch {
      const fallbacks = {
        explain: 'Start by understanding the input/output format. Break the problem into smaller parts and identify the core operation being asked.',
        approach: 'Consider a brute force solution first, then identify repeated work you can eliminate. Look for patterns like two-pointer, sliding window, or dynamic programming.',
        complexity: 'Analyze how many operations your algorithm performs relative to input size. Consider both time (runtime growth) and space (memory usage).',
        hint: hintLevel <= 1 ? 'Think about what data structure gives you O(1) lookups.' : 'Try sorting the input first — it often simplifies the problem.',
        debug: 'Check loop boundaries, variable initialization, and edge case handling. Empty input and single-element arrays are common pitfalls.',
        review: 'Your solution has good structure. Consider adding input validation and optimizing repeated computations.',
        viva: 'Explain the time and space complexity of your solution. What alternative approaches could you use and why?',
      };
      if (actionId === 'hint') {
        const hints = [];
        for (let i = 0; i < hintLevel && i < 4; i++) hints.push(fallbacks.hint);
        setResponse(hints.join('\n\n'));
      } else {
        setResponse(fallbacks[actionId] || 'Unable to get response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [uiLang, module, topic, question, project, code, language, hintLevel]);

  const handleTTS = async (text) => {
    try {
      if (isPlaying && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); return; }
      const res = await fetch(`${API_BASE}/api/sarvam/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: uiLang }),
      });
      const data = await res.json();
      const base64 = data?.data?.audioBase64 || data?.audioBase64;
      if (base64) {
        const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch { /* TTS unavailable */ }
  };

  const handleSTT = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = uiLang === 'Hindi' ? 'hi-IN' : uiLang === 'Tamil' ? 'ta-IN' : uiLang === 'Telugu' ? 'te-IN' : uiLang === 'Bengali' ? 'bn-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setResponse(prev => prev ? `${prev}\n\n🎤 You said: ${transcript}` : `🎤 You said: ${transcript}`);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleVivaNext = () => {
    if (vivaIndex < vivaQuestions.length - 1) {
      const next = vivaIndex + 1;
      setVivaIndex(next);
      setResponse(vivaQuestions[next]?.question || '');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-title-md">auto_awesome</span>
            <h2 className="font-headline text-title-md font-bold text-slate-100">Prayog Mentor</h2>
          </div>
          <p className="text-label-xs text-slate-400 font-mono mt-0.5">Your multilingual coding mentor</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-title-md">close</span>
        </button>
      </div>

      {/* Language selector */}
      <div className="px-4 py-2 border-b border-slate-700/50 flex items-center gap-2 bg-slate-800/20">
        <span className="material-symbols-outlined text-label-sm text-slate-400">translate</span>
        <select
          value={uiLang}
          onChange={(e) => setUiLang(e.target.value)}
          className="flex-1 px-2 py-1 rounded text-xs font-mono bg-slate-800 border border-slate-600 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.native} — {l.label}</option>
          ))}
        </select>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" ref={responseRef}>
        {/* Context chips */}
        {(topic || question || project) && (
          <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b border-slate-700/30">
            {module && <span className="text-label-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-600 truncate max-w-28">{module.title}</span>}
            {topic && <span className="text-label-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-600 truncate max-w-28">{topic.title}</span>}
            {project && <span className="text-label-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-600 truncate max-w-28">{project.title}</span>}
          </div>
        )}

        {/* Action Cards */}
        <div className="p-3 space-y-2">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => callMentor(action.id)}
              disabled={loading}
              className={`w-full group relative p-3 rounded-xl border transition-all text-left ${
                activeAction === action.id && !loading
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800'
              } disabled:opacity-50`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} shadow-sm flex-shrink-0`}>
                  <span className="material-symbols-outlined text-white text-label-md">{action.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">{action.label}</p>
                  <p className="text-label-xs text-slate-400 mt-0.5 font-mono">{action.desc}</p>
                </div>
                {activeAction === action.id && loading && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Response Area */}
        {response && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-xs font-mono text-primary uppercase tracking-wider">
                {ACTIONS.find(a => a.id === activeAction)?.label}
                {activeAction === 'viva' && vivaQuestions.length > 0 && ` (${vivaIndex + 1}/${vivaQuestions.length})`}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => handleTTS(response)} className={`p-1 rounded transition-colors ${isPlaying ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`} title={isPlaying ? 'Pause' : 'Play'}>
                  <span className="material-symbols-outlined text-label-md">{isPlaying ? 'pause' : 'volume_up'}</span>
                </button>
                <button onClick={handleSTT} className={`p-1 rounded transition-colors ${isListening ? 'text-rose-400 bg-rose-500/10 animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`} title="Speech to text">
                  <span className="material-symbols-outlined text-label-md">{isListening ? 'mic' : 'mic_none'}</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{response}</p>
            {activeAction === 'viva' && vivaIndex < vivaQuestions.length - 1 && (
              <button onClick={handleVivaNext} className="mt-3 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition-colors">
                Next Question
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom mic for quick STT */}
      <div className="px-3 py-2 border-t border-slate-700/50 bg-slate-800/20 flex items-center gap-2">
        <button
          onClick={handleSTT}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-mono ${
            isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 border border-slate-600 hover:border-slate-400'
          }`}
        >
          <span className="material-symbols-outlined text-label-sm">{isListening ? 'mic' : 'mic_none'}</span>
          {isListening ? 'Listening...' : 'Ask with voice'}
        </button>
        <span className="text-label-xs text-slate-500 font-mono">Sarvam AI · {uiLang}</span>
      </div>
    </div>
  );
}