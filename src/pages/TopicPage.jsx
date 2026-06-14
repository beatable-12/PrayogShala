import React, { useState, useCallback, useEffect } from 'react';
import MonacoEditorPanel from '../components/MonacoEditorPanel';
import ExecutionPanel from '../components/ExecutionPanel';
import { useCodeAutoSave, useCodeLanguageSync } from '../hooks/useCodeAutoSave';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { getDefaultCode } from '../utils/codeTemplates';

const TOPIC_QUESTIONS = {
  'Two Sum': [
    { title: 'Two Sum', description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nEach input has exactly one solution. You may not use the same element twice.', examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }] },
    { title: 'Two Sum II', description: 'Given a 1-indexed sorted array and a target, find two numbers that sum to target. Your solution must use only constant extra space.', examples: [{ input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]' }] },
  ],
  'Group Anagrams': [
    { title: 'Group Anagrams', description: 'Given an array of strings strs, group the anagrams together.', examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }] },
    { title: 'Valid Anagram', description: 'Given two strings s and t, return true if t is an anagram of s.', examples: [{ input: 's = "anagram", t = "nagaram"', output: 'true' }] },
  ],
};

const TOPIC_QUESTIONS_FALLBACK = [
  { title: 'Question 1', description: 'Implement the solution for this problem.\n\nWrite clean, efficient code and handle edge cases.', examples: [{ input: 'Sample input', output: 'Expected output' }] },
  { title: 'Question 2', description: 'Solve the follow-up variant of this problem.\n\nOptimize for time and space complexity.', examples: [{ input: 'Sample input', output: 'Expected output' }] },
];

export default function TopicPage({ topic, onQuestionsComplete, onBack, setXp, onCodeChange, onToggleMentor, mentorOpen }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completed, setCompleted] = useState([false, false]);
  const [code, setCode] = useState('# Write your solution here\n');
  const [language, setLanguage] = useState('python');
  const [isDarkTheme] = useState(true);
  const [input, setInput] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => { onCodeChange?.(code); }, [code]);

  const questions = TOPIC_QUESTIONS[topic?.title] || TOPIC_QUESTIONS_FALLBACK;
  const currentQ = questions[questionIndex] || questions[0];

  useCodeAutoSave(code, language);
  useCodeLanguageSync(language, setCode, useCallback((lang) => getDefaultCode(lang), []));

  const { isExecuting, executionResult, output, errors, handleExecuteCode, handleSubmitProject } = useCodeExecution({ code, language, input });

  const handleSubmit = async () => {
    await handleSubmitProject();
    const newCompleted = [...completed];
    newCompleted[questionIndex] = true;
    setCompleted(newCompleted);
    if (setXp) setXp(prev => prev + 100);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setShowUnlock(true);
    }
  };

  const handleOpenProject = async () => {
    setUnlocking(true);
    try {
      const topicSlug = topic?.title?.toLowerCase().replace(/\s+/g, '-');
      await fetch('http://localhost:5000/api/projects/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: topicSlug }),
      });
    } catch { /* unlock works offline too */ }
    setXp(prev => prev + 200);
    onQuestionsComplete();
  };

  if (showUnlock) {
    const projectName = topic?.title === 'Two Sum' ? 'Library Management System'
      : topic?.title === 'Group Anagrams' ? 'Contact Group Manager'
      : topic?.title === 'Valid Palindrome' ? 'Room Booking Scheduler'
      : topic?.title === 'Three Sum' ? 'Expense Splitter'
      : topic?.title === 'Maximum Subarray' ? 'Website Traffic Analyzer'
      : topic?.title === 'Longest Substring' ? 'Log Analyzer'
      : topic?.title === 'Valid Parentheses' ? 'Browser History Manager'
      : topic?.title === 'Min Stack' ? 'Undo-Redo Text Editor'
      : topic?.title === 'Binary Tree Inorder' ? 'File Explorer System'
      : topic?.title === 'Course Schedule' ? 'Task Dependency Manager'
      : topic?.title === 'Climbing Stairs' ? 'Budget Optimizer'
      : topic?.title === 'Coin Change' ? 'Vending Machine Optimizer'
      : topic?.title === 'Binary Search' ? 'Book Search Engine'
      : topic?.title === 'Linked List' ? 'Music Playlist Manager'
      : topic?.title === 'Heap / Priority Queue' ? 'Task Priority Scheduler'
      : topic?.title === 'Trie / Autocomplete' ? 'Autocomplete Search Engine'
      : `${topic?.title} Project`;

    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center p-8 max-w-lg animate-fade-in">
          <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">lock_open</span>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Project Unlocked!</h2>
          <p className="text-slate-400 mb-1">You completed both questions.</p>
          <p className="text-emerald-400 font-semibold text-lg mb-6">{projectName}</p>
          <button
            onClick={handleOpenProject}
            disabled={unlocking}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-lg disabled:opacity-50"
          >
            {unlocking ? 'Unlocking...' : 'Open Project →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-50">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-semibold">{topic?.title}</h1>
            <p className="text-xs text-slate-400">Question {questionIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-xs text-slate-400">
            {completed.map((c, i) => (
              <span key={i} className={`px-2 py-0.5 rounded ${c ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                Q{i + 1} {c ? '✓' : ''}
              </span>
            ))}
          </span>
          <button onClick={onToggleMentor} className={`px-2 py-1 rounded text-xs font-mono font-semibold border transition-all ${mentorOpen ? 'bg-primary/20 text-primary border-primary/40' : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-400'}`}>
            <span className="material-symbols-outlined text-label-sm align-middle mr-1">auto_awesome</span>
            Mentor
          </button>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="px-2 py-1 rounded text-xs bg-slate-800 border border-slate-700 text-slate-200">
            {['python', 'javascript', 'java', 'cpp', 'c'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 flex-shrink-0 overflow-y-auto bg-slate-900 border-r border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              currentQ.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }`}>{currentQ.difficulty || 'EASY'}</span>
            <span className="text-xs text-slate-400">{topic?.title}</span>
          </div>
          <h2 className="text-lg font-bold mb-3">{currentQ.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-6">{currentQ.description}</p>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Examples</h3>
            {currentQ.examples?.map((ex, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800 text-sm">
                <p className="text-xs font-mono"><span className="text-slate-400">Input:</span> {ex.input}</p>
                <p className="text-xs font-mono"><span className="text-slate-400">Output:</span> {ex.output}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            <MonacoEditorPanel code={code} language={language} isDarkTheme={true} onCodeChange={setCode} onExecute={handleExecuteCode} />
          </div>
          <div className="h-1.5 bg-slate-700/30 cursor-row-resize hover:bg-blue-500/50 hover:h-2 transition-all flex-shrink-0" />
          <div className="h-48 flex-shrink-0">
            <ExecutionPanel isExecuting={isExecuting} executionResult={executionResult} output={output} errors={errors} input={input} onInputChange={setInput} onExecute={handleExecuteCode} language={language} isDarkTheme={true} />
          </div>
        </div>

        <div className="w-24 flex-shrink-0 bg-slate-900 border-l border-slate-700 flex flex-col items-center gap-3 p-3">
          <button onClick={handleExecuteCode} disabled={isExecuting} className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all">
            Run
          </button>
          <button onClick={handleSubmit} className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}