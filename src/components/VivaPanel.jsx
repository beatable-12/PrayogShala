import React, { useState, useRef, useEffect } from 'react';

const VIVA_QUESTIONS = [
  { question: 'What algorithm did you use to solve this problem? Can you explain its time complexity?', category: 'concept', difficulty: 'easy' },
  { question: 'How would your solution handle edge cases like empty input or very large datasets?', category: 'edge_cases', difficulty: 'medium' },
  { question: 'Can you think of an alternative approach? How would it compare in terms of time and space?', category: 'optimization', difficulty: 'medium' },
];

const SCORE_THRESHOLD = 5;

export default function VivaPanel({ topic, onComplete, isDarkTheme }) {
  const [phase, setPhase] = useState('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startViva = () => {
    setPhase('qa');
    const q = VIVA_QUESTIONS[0];
    setMessages([{ role: 'sarvam', content: q.question, category: q.category }]);
  };

  const submitAnswer = () => {
    if (!answer.trim()) return;

    const userMsg = { role: 'student', content: answer };
    const score = Math.floor(Math.random() * 5) + 4;
    const passed = score >= SCORE_THRESHOLD;
    const nextIdx = currentQ + 1;

    let feedback = passed
      ? `Good answer! You scored ${score}/10. You covered the key points well.`
      : `Score: ${score}/10. Consider reviewing the fundamentals of this concept.`;

    const qMsg = { role: 'sarvam', content: feedback, score, isFeedback: true };
    const newMessages = [...messages, userMsg, qMsg];
    setMessages(newMessages);
    setAnswer('');

    if (nextIdx < VIVA_QUESTIONS.length) {
      setCurrentQ(nextIdx);
      const nextQ = VIVA_QUESTIONS[nextIdx];
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'sarvam', content: nextQ.question, category: nextQ.category }]);
      }, 800);
    } else {
      const totalScore = newMessages.filter(m => m.score).reduce((s, m) => s + m.score, 0);
      const count = newMessages.filter(m => m.score).length;
      const avg = count > 0 ? Math.round(totalScore / count) : 0;
      const passedViva = avg >= SCORE_THRESHOLD;

      setTimeout(() => {
        setPhase('complete');
        setResult({ totalScore: avg, passed: passedViva, count });
      }, 1000);
    }
  };

  if (phase === 'intro') {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-6 ${isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'}`}>
        <span className="material-symbols-outlined text-headline-2xl text-primary mb-4">record_voice_over</span>
        <h2 className="font-headline text-title-lg font-bold mb-2">AI Viva Session</h2>
        <p className={`text-sm text-center mb-6 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
          You will be asked {VIVA_QUESTIONS.length} questions about your solution.
          Answer each question to demonstrate your understanding.
        </p>
        <button
          onClick={startViva}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-on-primary rounded-lg font-mono text-label-md hover:shadow-lg transition-all"
        >
          Start Viva
        </button>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-6 ${isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'}`}>
        <span className={`material-symbols-outlined text-headline-2xl mb-4 ${result?.passed ? 'text-emerald-500' : 'text-amber-500'}`}>
          {result?.passed ? 'check_circle' : 'pending'}
        </span>
        <h2 className="font-headline text-title-lg font-bold mb-2">Viva Completed</h2>
        <p className={`text-sm text-center mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
          You scored <strong className={result?.passed ? 'text-emerald-500' : 'text-amber-500'}>{result?.totalScore}/10</strong> across {result?.count} questions.
        </p>
        <p className={`text-sm mb-6 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
          {result?.passed ? 'Congratulations! You passed the viva.' : 'Review the concepts and try again.'}
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-on-primary rounded-lg font-mono text-label-md hover:shadow-lg transition-all"
        >
          {result?.passed ? 'Generate Skill Report' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'}`}>
      <div className={`p-4 border-b ${isDarkTheme ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className="font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">record_voice_over</span>
          Viva Session — Question {currentQ + 1} of {VIVA_QUESTIONS.length}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.role === 'student'
                ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : msg.isFeedback
                ? isDarkTheme ? 'bg-emerald-900/50 text-emerald-100' : 'bg-emerald-50 text-emerald-900'
                : isDarkTheme ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-900'
            }`}>
              <p className="text-sm">{msg.content}</p>
              {msg.score != null && (
                <p className={`text-xs mt-1 font-semibold ${msg.score >= SCORE_THRESHOLD ? 'text-emerald-300' : 'text-amber-300'}`}>
                  Score: {msg.score}/10
                </p>
              )}
              {msg.category && (
                <p className={`text-xs mt-0.5 opacity-60 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                  {msg.category}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={`border-t p-4 ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer(); }}
            placeholder="Type your answer..."
            className={`flex-1 px-3 py-2 rounded text-sm border focus:outline-none focus:ring-2 focus:ring-primary ${
              isDarkTheme ? 'bg-slate-900 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <button
            onClick={submitAnswer}
            disabled={!answer.trim()}
            className="px-4 py-2 bg-primary text-on-primary rounded font-mono text-label-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}