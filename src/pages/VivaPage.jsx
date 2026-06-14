import React, { useState, useRef, useEffect, useCallback } from 'react';

const CATEGORY_META = {
  concept: { label: 'Basic Understanding', icon: 'lightbulb', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  implementation: { label: 'Implementation Choice', icon: 'construction', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  optimization: { label: 'Complexity & Optimization', icon: 'bar_chart', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  edge_cases: { label: 'Edge Cases', icon: 'warning', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
};

const FALLBACK_QUESTIONS = [
  { id: 'fq-1', order: 1, question: 'Explain the core logic of your solution. What approach did you take and why?', category: 'concept', difficulty: 'easy' },
  { id: 'fq-2', order: 2, question: 'Why did you choose the specific data structures you used? What alternatives did you consider?', category: 'implementation', difficulty: 'medium' },
  { id: 'fq-3', order: 3, question: 'Analyze the time and space complexity of your solution. Where are the bottlenecks?', category: 'optimization', difficulty: 'medium' },
  { id: 'fq-4', order: 4, question: 'If the input size increased 100x, how would your solution perform? What would you optimize?', category: 'optimization', difficulty: 'hard' },
  { id: 'fq-5', order: 5, question: 'What edge cases did you consider? How does your solution handle empty input, duplicates, or extreme values?', category: 'edge_cases', difficulty: 'hard' },
];

const QUESTION_LABELS = {
  1: 'Basic Understanding',
  2: 'Implementation Choice',
  3: 'Complexity Analysis',
  4: 'Optimization',
  5: 'Edge Cases',
};

export default function VivaPage({ project, code: externalCode, onComplete, onBack, setXp }) {
  const [sessionId, setSessionId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [codeAnalysis, setCodeAnalysis] = useState(null);
  const answerRef = useRef(null);

  const startViva = useCallback(async () => {
    setLoading(true);
    const storedCode = externalCode || localStorage.getItem('prayogshala_last_code') || '';

    try {
      const res = await fetch('http://localhost:5000/api/viva/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: storedCode,
          topicTitle: project?.title || project?.topicTitle || 'the current topic',
          projectTitle: project?.title || 'Project',
          runtime: 0,
          memory: 0,
          status: 'accepted',
        }),
      });
      const data = await res.json();
      const d = data?.data || data;
      if (d?.vivaSessionId && d?.firstQuestion) {
        setSessionId(d.vivaSessionId);
        setQuestions([d.firstQuestion, ...FALLBACK_QUESTIONS.slice(1)]);
        setCodeAnalysis(d.codeAnalysis);
      } else {
        useFallbackQuestions();
      }
    } catch {
      useFallbackQuestions();
    }
    setStarted(true);
    setLoading(false);
  }, [project]);

  const useFallbackQuestions = () => {
    setQuestions(FALLBACK_QUESTIONS);
    setCodeAnalysis(null);
    setSessionId('local');
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    setFeedback(null);

    const currentQ = questions[currentIndex];

    try {
      const res = await fetch(`http://localhost:5000/api/viva/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      const d = data?.data || data;

      const newAnswer = { question: currentQ.question, answer, score: d?.answerScore || 5 };
      setAnswers(prev => [...prev, newAnswer]);
      setFeedback({
        score: d?.answerScore || 5,
        message: d?.answerFeedback || 'Answer recorded.',
      });

      if (d?.nextQuestion && currentIndex < 4) {
        const updated = [...questions];
        updated[currentIndex + 1] = d.nextQuestion;
        setQuestions(updated);
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setFeedback(null);
          setAnswer('');
          answerRef.current?.focus();
        }, 1500);
      } else {
        // Complete
        const finalScore = d?.finalScore || newAnswer.score * 2;
        setTimeout(async () => {
          try {
            const res2 = await fetch(`http://localhost:5000/api/viva/${sessionId}/complete`, { method: 'PATCH' });
            const d2 = await res2.json();
            const fb = d2?.data?.feedback;
            setResult({
              totalScore: finalScore * 2,
              feedback: fb?.summary || 'Viva session completed.',
              strengths: fb?.strengths || [],
              improvements: fb?.improvements || [],
              codeAnalysis: d2?.data?.codeAnalysis || codeAnalysis,
            });
          } catch {
            setResult({
              totalScore: finalScore * 2,
              feedback: 'Viva session completed.',
              strengths: ['Completed all questions'],
              improvements: ['Review your answers for deeper understanding'],
              codeAnalysis,
            });
          }
        }, 500);
      }
    } catch {
      // Offline fallback
      const score = 5 + Math.floor(Math.random() * 4);
      const newAnswer = { question: currentQ.question, answer, score };
      setAnswers(prev => [...prev, newAnswer]);
      setFeedback({ score, message: score >= 7 ? 'Good answer!' : 'Consider adding more technical depth.' });

      if (currentIndex < 4) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setFeedback(null);
          setAnswer('');
          answerRef.current?.focus();
        }, 1500);
      } else {
        setTimeout(() => {
          const total = [...answers, newAnswer].reduce((s, a) => s + a.score, 0);
          const avg = total / 5;
          setResult({
            totalScore: Math.round(avg * 10),
            feedback: avg >= 7 ? 'Strong performance! You have a solid understanding.' : 'Good attempt. Focus on complexity analysis and edge cases.',
            strengths: ['Completed all questions', 'Showed good effort'],
            improvements: avg >= 7 ? ['Try more challenging projects'] : ['Review complexity analysis', 'Practice edge cases'],
            codeAnalysis,
          });
        }, 500);
      }
    }
    setLoading(false);
  };

  const handleFinish = () => {
    onComplete?.(result?.totalScore || 70);
  };

  // Result screen
  if (result) {
    const breakdown = result.codeAnalysis;
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100">
        <div className="max-w-3xl mx-auto p-8 pt-16">
          <div className="text-center mb-8">
            <span className={`material-symbols-outlined text-6xl mb-4 ${result.totalScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {result.totalScore >= 70 ? 'emoji_events' : 'trending_up'}
            </span>
            <h1 className="text-3xl font-bold mb-2">Viva Complete!</h1>
            <p className="text-slate-400 mb-1">Your code review session has ended.</p>
          </div>

          {/* Score */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-emerald-400">{result.totalScore}</span>
              <span className="text-slate-400 text-lg">/100</span>
            </div>
            <p className="text-slate-300 text-center mb-6">{result.feedback}</p>
            {breakdown && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 font-mono uppercase">Algorithms</p>
                  <p className="text-sm font-semibold mt-1">{(breakdown.algorithmsUsed || []).join(', ') || '—'}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 font-mono uppercase">Data Structures</p>
                  <p className="text-sm font-semibold mt-1">{(breakdown.dataStructuresUsed || []).join(', ') || '—'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Strengths
              </h3>
              <ul className="space-y-1">
                {(result.strengths || ['Good effort']).map((s, i) => (
                  <li key={i} className="text-sm text-slate-300">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                Improvements
              </h3>
              <ul className="space-y-1">
                {(result.improvements || ['Keep practicing']).map((s, i) => (
                  <li key={i} className="text-sm text-slate-300">• {s}</li>
                ))}
              </ul>
            </div>
          </div>

          <button onClick={handleFinish} className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all">
            Continue to Profile
          </button>
        </div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100">
        <div className="text-center p-8 max-w-lg">
          <span className="material-symbols-outlined text-6xl text-primary mb-4">record_voice_over</span>
          <h1 className="text-3xl font-bold mb-2">AI Code Viva</h1>
          <p className="text-slate-400 mb-2">A personalized interview based on YOUR code.</p>
          <p className="text-sm text-slate-500 mb-6">5 questions · Code-aware · Instant feedback</p>
          <button onClick={startViva} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? 'Analyzing your code...' : 'Start Viva'}
          </button>
        </div>
      </div>
    );
  }

  // Active viva
  const currentQ = questions[currentIndex] || FALLBACK_QUESTIONS[currentIndex];
  const category = CATEGORY_META[currentQ?.category] || CATEGORY_META.concept;
  const progress = currentIndex + 1;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto p-6 pt-12">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4 text-sm">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Project
        </button>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                i < progress ? 'bg-emerald-500' : i === progress ? 'bg-primary' : 'bg-slate-700'
              }`} />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400">Question {progress} of 5</span>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${category.color}`}>
              <span className="material-symbols-outlined text-label-xs align-middle mr-0.5">{category.icon}</span>
              {QUESTION_LABELS[currentIndex + 1] || category.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              currentQ?.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : currentQ?.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>{currentQ?.difficulty || 'medium'}</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-title-md">record_voice_over</span>
            </div>
            <p className="text-lg leading-relaxed">{currentQ?.question}</p>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 p-4 rounded-xl border animate-fade-in ${
            feedback.score >= 7
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-sm">{feedback.score >= 7 ? 'check_circle' : 'info'}</span>
              <span className="font-semibold text-sm">Score: {feedback.score}/10</span>
            </div>
            <p className="text-sm">{feedback.message}</p>
          </div>
        )}

        {/* Code context */}
        {codeAnalysis && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
            <div className="flex flex-wrap gap-2">
              {codeAnalysis.algorithmsUsed?.map((a, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">{a}</span>
              ))}
              {codeAnalysis.dataStructuresUsed?.map((d, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">{d}</span>
              ))}
              {codeAnalysis.timeComplexity && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">{codeAnalysis.timeComplexity}</span>
              )}
            </div>
          </div>
        )}

        {/* Answer Input */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <textarea
            ref={answerRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !loading) { e.preventDefault(); handleSubmitAnswer(); } }}
            placeholder="Type your answer here..."
            className="w-full min-h-[120px] bg-slate-800 border border-slate-600 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 font-mono resize-none focus:outline-none focus:border-primary mb-4"
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {loading ? 'Evaluating...' : progress === 5 ? 'Submit Final Answer' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}