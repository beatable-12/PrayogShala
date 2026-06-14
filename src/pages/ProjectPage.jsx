import React, { useState, useCallback, useEffect } from 'react';
import MonacoEditorPanel from '../components/MonacoEditorPanel';
import ExecutionPanel from '../components/ExecutionPanel';
import { useCodeAutoSave, useCodeLanguageSync } from '../hooks/useCodeAutoSave';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { getDefaultCode } from '../utils/codeTemplates';

const PROJECT_BANK = {
  'Two Sum': {
    title: 'Library Management System',
    description: 'Build a CLI-based Library Management System that allows librarians to manage books, track issues, and handle returns efficiently using arrays.',
    learningObjectives: ['Implement CRUD operations using arrays', 'Practice searching and filtering techniques', 'Apply modular programming concepts'],
    skillsCovered: ['Arrays', 'Searching', 'CRUD Operations'],
    milestones: [
      { title: 'Create Book Class', description: 'Define the Book class with fields: book_id, title, author, is_issued, issued_to.' },
      { title: 'Add Book Functionality', description: 'Implement add_book() that creates a new Book and adds it to the library collection.' },
      { title: 'Search Book', description: 'Implement search_by_title() and search_by_author() using linear search.' },
      { title: 'Issue Book', description: 'Implement issue_book(book_id, student_name) that marks a book as issued if available.' },
      { title: 'Return Book', description: 'Implement return_book(book_id) that marks a book as returned.' },
      { title: 'View Books', description: 'Implement display_all_books() showing all books with their status.' },
    ],
  },
  'Group Anagrams': {
    title: 'Contact Group Manager',
    description: 'Build a Contact Group Manager that automatically groups similar contacts using hashing for efficient categorization.',
    learningObjectives: ['Use hash maps for categorization', 'Implement grouping algorithms', 'Build a practical contact management system'],
    skillsCovered: ['Hashing', 'Hash Maps', 'Grouping'],
    milestones: [
      { title: 'Create Contact Model', description: 'Define Contact class with name, phone, email fields.' },
      { title: 'Add Contact to Group', description: 'Implement add_contact(name, phone, email, group_name).' },
      { title: 'List All Groups', description: 'Implement list_groups() that returns all available group names.' },
      { title: 'Search Contacts', description: 'Implement search_contacts(query) that searches across all groups.' },
      { title: 'Merge Groups', description: 'Implement merge_groups(group1, group2) that combines two groups.' },
    ],
  },
};

const FALLBACK = {
  title: 'Project Workspace',
  description: 'Implement the project based on the concepts you learned.',
  learningObjectives: ['Apply learned concepts', 'Build a complete solution', 'Test edge cases'],
  skillsCovered: ['Problem Solving', 'Implementation'],
  milestones: [
    { title: 'Setup & Structure', description: 'Set up the project structure with correct imports and function signatures.' },
    { title: 'Core Logic', description: 'Implement the core functionality for this project.' },
    { title: 'Testing', description: 'Test your solution with sample inputs and edge cases.' },
    { title: 'Final Review', description: 'Optimize and clean up your solution.' },
  ],
};

export default function ProjectPage({ project, topic, onComplete, onBack, setXp, onCodeChange, onToggleMentor, mentorOpen }) {
  const [code, setCode] = useState(getDefaultCode('python'));
  const [language, setLanguage] = useState('python');
  const [isDarkTheme] = useState(true);
  const [input, setInput] = useState('');
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState(new Set());
  const [showOverview, setShowOverview] = useState(true);

  useEffect(() => { onCodeChange?.(code); }, [code]);

  useCodeAutoSave(code, language);
  useCodeLanguageSync(language, setCode, useCallback((lang) => getDefaultCode(lang), []));

  const { isExecuting, executionResult, output, errors, handleExecuteCode, handleSubmitProject } = useCodeExecution({ code, language, input });

  const bank = PROJECT_BANK[topic?.title] || FALLBACK;
  const milestones = bank.milestones;
  const current = milestones[milestoneIndex] || milestones[0];
  const progress = milestones.length > 0 ? Math.round((completedMilestones.size / milestones.length) * 100) : 0;

  const handleMilestoneComplete = async () => {
    const result = await handleSubmitProject();
    if (result?.success !== false) {
      const next = new Set(completedMilestones);
      next.add(milestoneIndex);
      setCompletedMilestones(next);
      if (setXp) setXp(p => p + 150);
      if (milestoneIndex < milestones.length - 1) setMilestoneIndex(milestoneIndex + 1);
    }
  };

  if (showOverview) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-50">
        <div className="max-w-3xl mx-auto p-8 pt-12">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 text-sm">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Questions
          </button>

          <div className="mb-8">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono uppercase">Project</span>
            <h1 className="text-3xl font-bold mt-3 mb-2">{bank.title}</h1>
            <p className="text-slate-400 leading-relaxed">{bank.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Learning Objectives</h3>
              <ul className="space-y-1.5">
                {bank.learningObjectives.map((obj, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills Covered</h3>
              <div className="flex flex-wrap gap-2">
                {bank.skillsCovered.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">{skill}</span>
                ))}
              </div>
              <div className="mt-4">
                <span className="text-xs text-slate-400 font-mono">{milestones.length} milestones</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-8">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-sm">checklist</span>
              Milestones Checklist
            </h3>
            <div className="space-y-2 mb-4">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    completedMilestones.has(i) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                  }`}>
                    {completedMilestones.has(i) && <span className="material-symbols-outlined text-white text-xs">check</span>}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{m.title}</p>
                    <p className="text-xs text-slate-400">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-mono text-slate-400">{progress}%</span>
            </div>
          </div>

          <div className="flex gap-3">
            {progress >= 70 && (
              <button onClick={onComplete} className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                Start Viva
              </button>
            )}
            <button onClick={() => setShowOverview(false)} className={`${progress >= 70 ? 'flex-1' : 'w-full'} px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all`}>
              Launch Workspace
            </button>
          </div>
          {progress >= 70 && progress < 100 && (
            <p className="mt-3 text-xs text-amber-400/70 text-center">
              ⚠ Project is {progress}% complete. Viva questions will be based on your current code.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-50">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowOverview(true)} className="text-slate-400 hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-sm font-semibold">{bank.title}</h1>
            <p className="text-xs text-slate-400">Milestone {milestoneIndex + 1}/{milestones.length} — {current?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 mr-1">
            {milestones.map((_, i) => (
              <div key={i} className={`w-4 h-1.5 rounded-full transition-all ${
                completedMilestones.has(i) ? 'bg-emerald-500' : i === milestoneIndex ? 'bg-blue-500' : 'bg-slate-600'
              }`} />
            ))}
          </div>
          {progress >= 70 && (
            <div className="relative group">
              <button onClick={onComplete} className="px-2 py-1 rounded text-xs font-mono font-semibold border transition-all bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30">
                <span className="material-symbols-outlined text-label-sm align-middle mr-1">record_voice_over</span>
                Start Viva
              </button>
              {progress < 100 && (
                <div className="absolute right-0 top-full mt-1 w-56 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  Project is {progress}% complete. Viva questions will be based on your current code.
                </div>
              )}
            </div>
          )}
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
        <div className="w-80 flex-shrink-0 bg-slate-900 border-r border-slate-700 p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Milestone {milestoneIndex + 1}</span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs font-mono text-slate-400">{progress}% done</span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <h2 className="text-lg font-bold mb-2">{current?.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">{current?.description}</p>

          <div className="space-y-1.5 mb-6">
            {milestones.map((m, i) => (
              <button key={i} onClick={() => setMilestoneIndex(i)} className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                i === milestoneIndex ? 'bg-blue-500/10 border-blue-500/30' : completedMilestones.has(i) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-500'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    completedMilestones.has(i) ? 'bg-emerald-500 border-emerald-500' : i === milestoneIndex ? 'border-blue-400' : 'border-slate-500'
                  }`}>
                    {completedMilestones.has(i) && <span className="material-symbols-outlined text-white text-xs">check</span>}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${i === milestoneIndex ? 'text-blue-300' : completedMilestones.has(i) ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {m.title}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button onClick={handleMilestoneComplete} className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
            {completedMilestones.has(milestoneIndex) ? '✓ Completed' : 'Mark Complete & Submit'}
          </button>
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
          <button onClick={handleMilestoneComplete} className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}