/**
 * src/components/AITutorPanel.jsx
 * Right sidebar with AI tutor assistance
 * 
 * Features:
 * - Ask for hints
 * - Ask for explanations
 * - Get debugging help
 * - Code analysis
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Lightbulb, HelpCircle, Bug, Zap } from 'lucide-react';

export default function AITutorPanel({ language, code, isDarkTheme }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: 'Hello! I\'m your AI tutor. I can help you with hints, explanations, and debugging. What would you like help with?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Sarvam AI or Gemini API for tutor responses
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/topics/explain`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: input,
            code,
            language,
          }),
        }
      );

      const data = await response.json();
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: data.explanation || 'I\'ll help you with that!',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Sorry, I couldn\'t process that. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const QuickAction = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors w-full ${
        isDarkTheme
          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className={`h-full flex flex-col ${isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" />
          AI Tutor
        </h3>
        <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
          Get help with coding problems
        </p>
      </div>

      {/* Quick Actions */}
      <div className={`p-3 border-b space-y-2 ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <QuickAction
          icon={Lightbulb}
          label="Give me a hint"
          onClick={() => {
            setInput('Can you give me a hint for this problem?');
          }}
        />
        <QuickAction
          icon={HelpCircle}
          label="Explain the concept"
          onClick={() => {
            setInput('Can you explain the concept behind this?');
          }}
        />
        <QuickAction
          icon={Bug}
          label="Help me debug"
          onClick={() => {
            setInput('Why is my code not working?');
          }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? isDarkTheme
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkTheme
                  ? 'bg-slate-800 text-slate-100'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t p-4 ${isDarkTheme ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder="Ask for help..."
            className={`flex-1 px-3 py-2 rounded text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkTheme
                ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded transition-colors ${
              isDarkTheme
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700'
                : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-slate-400'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
