/**
 * src/components/MonacoEditorPanel.jsx
 * Monaco Editor integration with syntax highlighting and code completion
 * 
 * Features:
 * - Multiple language support
 * - Theme switching (dark/light)
 * - Code folding
 * - Minimap
 * - Line numbers
 * - Bracket matching
 * - Auto-formatting
 */

import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function MonacoEditorPanel({
  code,
  onCodeChange,
  language,
  isDarkTheme,
}) {
  const editorRef = useRef(null);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = (value) => {
    if (value !== undefined) {
      onCodeChange(value);
    }
  };

  const languageMap = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
  };

  const editorTheme = isDarkTheme ? 'vs-dark' : 'vs-light';

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        onMount={handleEditorMount}
        value={code}
        onChange={handleChange}
        language={languageMap[language] || 'python'}
        theme={editorTheme}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorStyle: 'line',
          rulers: [80, 120],
          bracketPairColorization: { enabled: true },
          'bracketPairColorization.independentColorPoolPerBracketType': true,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'smart',
          suggestOnTriggerCharacters: true,
          tabSize: 2,
          insertSpaces: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
