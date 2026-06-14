/**
 * src/components/SubmissionModal.jsx
 * Modal dialog for displaying submission details and results
 * Shows in fullscreen-like modal overlay
 */

import React from 'react';

export default function SubmissionModal({
  isOpen,
  onClose,
  submission,
  isPolling = false,
  isDarkTheme = true,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full h-full md:w-3/4 md:h-3/4 rounded-lg shadow-2xl flex flex-col ${
          isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'
        }`}
      >
        {/* Header */}
        <div
          className={`border-b px-6 py-4 flex items-center justify-between ${
            isDarkTheme ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <h2 className="text-xl font-bold">Submission Results</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${
              isDarkTheme ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-6 py-4 flex justify-end gap-3 ${
            isDarkTheme ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkTheme
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-50'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-950'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
