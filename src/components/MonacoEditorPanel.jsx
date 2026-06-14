import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function MonacoEditorPanel({
  code,
  onCodeChange,
  language,
  isDarkTheme,
  onExecute,
}) {
  const languageMap = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
  };

  const handleEditorMount = (editor, monaco) => {
    editor.focus();
    editor.addAction({
      id: 'execute-code',
      label: 'Execute Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        if (onExecute) onExecute();
      },
    });
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        onMount={handleEditorMount}
        value={code}
        onChange={(value) => {
          if (value !== undefined) onCodeChange(value);
        }}
        language={languageMap[language] || 'python'}
        theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorStyle: 'line',
          bracketPairColorization: { enabled: true },
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'smart',
          tabSize: 2,
          insertSpaces: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}