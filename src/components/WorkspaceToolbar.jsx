/**
 * src/components/WorkspaceToolbar.jsx
 * Toolbar with language selector, theme toggle, execute/submit buttons
 */

import React from 'react';
import { Play, Send, Eye, EyeOff, Sun, Moon, Settings } from 'lucide-react';

export default function WorkspaceToolbar({
  language,
  onLanguageChange,
  isDarkTheme,
  onThemeChange,
  onExecute,
  onSubmit,
  isExecuting,
  onToggleRightPanel,
}) {
  const languages = ['python', 'javascript', 'java', 'cpp', 'c'];

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkTheme ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
      {/* Left: Language Selector */}
      <div className="flex items-center gap-4">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isDarkTheme
              ? 'bg-slate-800 text-slate-100 border border-slate-700 hover:border-blue-500'
              : 'bg-white text-slate-900 border border-slate-300 hover:border-blue-500'
          }`}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>

        <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
          ✓ Auto-save
        </span>
      </div>

      {/* Center: Title */}
      <h1 className="text-lg font-semibold">Code Workspace</h1>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Execute Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
            isDarkTheme
              ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-700'
              : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-slate-400'
          }`}
          title="Run code (Ctrl+Enter)"
        >
          <Play size={16} />
          {isExecuting ? 'Running...' : 'Run'}
        </button>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
            isDarkTheme
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title="Submit solution"
        >
          <Send size={16} />
          Submit
        </button>

        {/* Toggle AI Panel */}
        <button
          onClick={onToggleRightPanel}
          className={`p-2 rounded transition-colors ${
            isDarkTheme
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
          title="Toggle AI Tutor"
        >
          <Eye size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => onThemeChange(!isDarkTheme)}
          className={`p-2 rounded transition-colors ${
            isDarkTheme
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
          title={`Switch to ${isDarkTheme ? 'light' : 'dark'} mode`}
        >
          {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}
