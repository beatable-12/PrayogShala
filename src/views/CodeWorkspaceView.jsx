/**
 * src/views/CodeWorkspaceView.jsx
 * Main VS Code-inspired coding workspace
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │ Left Panel (Project)│ Center (Editor)│ Right (AI Tutor) │
 * │                     │                │                   │
 * │                     │                │                   │
 * ├─────────────────────────────────────────────────────────┤
 * │              Bottom Panel (I/O, Results)                │
 * └─────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Play, Send, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import WorkspaceToolbar from '../components/WorkspaceToolbar';
import ProjectPanel from '../components/ProjectPanel';
import MonacoEditorPanel from '../components/MonacoEditorPanel';
import AITutorPanel from '../components/AITutorPanel';
import ExecutionPanel from '../components/ExecutionPanel';

export default function CodeWorkspaceView() {
  const [code, setCode] = useState(`# Write your solution here\n`);
  const [language, setLanguage] = useState('python');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);
  const [input, setInput] = useState('');

  // Auto-save code every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (code) {
        localStorage.setItem(`code_${language}`, code);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [code, language]);

  // Load saved code on mount or language change
  useEffect(() => {
    const saved = localStorage.getItem(`code_${language}`);
    if (saved) {
      setCode(saved);
    } else {
      setCode(getDefaultCode(language));
    }
  }, [language]);

  // Handle bottom panel resize
  const handleMouseDown = () => setIsDragging(true);
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 100) {
        setBottomPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getDefaultCode = (lang) => {
    const templates = {
      python: `def solution(arr):\n    \"\"\"Your solution here\"\"\"\n    pass\n\n# Test\nif __name__ == "__main__":\n    print(solution([1, 2, 3]))`,
      javascript: `function solution(arr) {\n  // Your solution here\n  return arr;\n}\n\n// Test\nconsole.log(solution([1, 2, 3]));`,
      java: `public class Solution {\n  public static void main(String[] args) {\n    // Your solution here\n  }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Your solution here\n  return 0;\n}`,
      c: `#include <stdio.h>\n\nint main() {\n  // Your solution here\n  return 0;\n}`,
    };
    return templates[lang] || `// Write your ${lang} code here\n`;
  };

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    try {
      // Call backend to execute code via Judge0
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          stdin: input,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setExecutionResult(result.data.submission);
        setOutput(result.data.submission.stdout || '');
        setErrors(result.data.submission.stderr || '');
      } else {
        setErrors(result.message);
      }
    } catch (error) {
      setErrors(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: 'current_topic_id', // Should come from route params
          code,
          language,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setExecutionResult(result.data.submission);
      }
    } catch (error) {
      setErrors(`Submission error: ${error.message}`);
    }
  };

  return (
    <div className={`h-screen flex flex-col transition-colors ${isDarkTheme ? 'dark bg-slate-950 text-slate-50' : 'bg-white text-slate-950'}`}>
      {/* Toolbar */}
      <WorkspaceToolbar
        language={language}
        onLanguageChange={setLanguage}
        isDarkTheme={isDarkTheme}
        onThemeChange={setIsDarkTheme}
        onExecute={handleExecuteCode}
        onSubmit={handleSubmitProject}
        isExecuting={isExecuting}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Project Info */}
        <div className={`w-80 border-r ${isDarkTheme ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'} overflow-y-auto`}>
          <ProjectPanel isDarkTheme={isDarkTheme} />
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MonacoEditorPanel
            code={code}
            onCodeChange={setCode}
            language={language}
            isDarkTheme={isDarkTheme}
          />

          {/* Bottom Panel - I/O & Execution Results */}
          <div
            className={`border-t ${isDarkTheme ? 'border-slate-700' : 'border-slate-200'} overflow-hidden`}
            style={{ height: `${bottomPanelHeight}px` }}
          >
            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={`h-1 ${isDarkTheme ? 'bg-slate-700 hover:bg-blue-600' : 'bg-slate-300 hover:bg-blue-400'} cursor-ns-resize transition-colors`}
            />
            <ExecutionPanel
              output={output}
              errors={errors}
              executionResult={executionResult}
              input={input}
              onInputChange={setInput}
              isDarkTheme={isDarkTheme}
            />
          </div>
        </div>

        {/* Right Panel - AI Tutor */}
        {rightPanelOpen && (
          <div className={`w-96 border-l ${isDarkTheme ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'} overflow-y-auto`}>
            <AITutorPanel language={language} code={code} isDarkTheme={isDarkTheme} />
          </div>
        )}
      </div>
    </div>
  );
}
