/**
 * src/components/SubmissionResultsPanel.jsx
 * Display submission results after code execution
 * Shows test case results, execution stats, and next steps
 * 
 * Props:
 * - submission: Current submission with execution results
 * - isPolling: Whether still waiting for results
 * - isDarkTheme: Dark/light theme toggle
 * - onStartViva: Callback to begin viva session if passed
 */

import React, { useMemo } from 'react';

export default function SubmissionResultsPanel({
  submission,
  isPolling = false,
  isDarkTheme = true,
  onStartViva = null,
}) {
  if (!submission) {
    return (
      <div
        className={`p-6 flex items-center justify-center h-full ${
          isDarkTheme ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'
        }`}
      >
        <p>Submit code to see results</p>
      </div>
    );
  }

  const isAccepted = submission.isAccepted;
  const testPassPercentage = submission.testsTotal
    ? Math.round((submission.testsPassed / submission.testsTotal) * 100)
    : 0;

  const statusColor = {
    accepted: 'text-green-500',
    wrong_answer: 'text-red-500',
    time_limit_exceeded: 'text-orange-500',
    compilation_error: 'text-red-600',
    runtime_error: 'text-red-600',
    processing: 'text-blue-500',
    pending: 'text-blue-400',
    failed: 'text-red-500',
  }[submission.status] || 'text-slate-400';

  return (
    <div
      className={`p-6 h-full overflow-y-auto ${
        isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'
      }`}
    >
      {/* Status */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Submission Status</h2>
        <div className={`text-2xl font-bold ${statusColor} mb-2`}>
          {submission.status.toUpperCase().replace(/_/g, ' ')}
        </div>
        <p className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>
          Submitted at {new Date(submission.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Polling indicator */}
      {isPolling && (
        <div className="mb-6 p-4 border border-blue-500 rounded-lg bg-blue-500/10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            <span className="text-blue-400">Waiting for execution results...</span>
          </div>
        </div>
      )}

      {/* Test Results */}
      {submission.testsTotal > 0 && !isPolling && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Cases</h3>
          <div
            className={`p-4 rounded-lg ${
              isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span>Tests Passed</span>
              <span className={`font-bold ${isAccepted ? 'text-green-500' : 'text-red-500'}`}>
                {submission.testsPassed}/{submission.testsTotal}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${isAccepted ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${testPassPercentage}%` }}
              />
            </div>
            <p className={`text-sm mt-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
              {testPassPercentage}% Passed
            </p>
          </div>
        </div>
      )}

      {/* Execution Stats */}
      {submission.executionTime > 0 && !isPolling && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Execution Stats</h3>
          <div
            className={`grid grid-cols-2 gap-3 ${
              isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'
            } p-4 rounded-lg`}
          >
            <div>
              <p className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>
                Execution Time
              </p>
              <p className="text-lg font-mono font-bold">
                {submission.executionTime}ms
              </p>
            </div>
            <div>
              <p className={isDarkTheme ? 'text-slate-400' : 'text-slate-600'}>
                Memory Used
              </p>
              <p className="text-lg font-mono font-bold">
                {(submission.memoryUsed / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Output/Errors */}
      {(submission.stdout || submission.stderr) && !isPolling && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Output</h3>
          <pre
            className={`p-4 rounded-lg font-mono text-sm overflow-x-auto ${
              isDarkTheme
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            {submission.stdout || submission.stderr || 'No output'}
          </pre>
        </div>
      )}

      {/* Score */}
      {submission.score >= 0 && !isPolling && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Score</h3>
          <div
            className={`text-4xl font-bold ${isAccepted ? 'text-green-500' : 'text-orange-500'}`}
          >
            {submission.score}/100
          </div>
        </div>
      )}

      {/* Next Steps */}
      {isAccepted && !isPolling && onStartViva && (
        <div className="mb-6">
          <button
            onClick={onStartViva}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Start Viva Session →
          </button>
        </div>
      )}

      {!isAccepted && !isPolling && (
        <div
          className={`p-4 rounded-lg border-l-4 ${
            isDarkTheme
              ? 'bg-red-500/10 border-red-500 text-red-300'
              : 'bg-red-50 border-red-500 text-red-700'
          }`}
        >
          <p className="font-semibold mb-1">Not Accepted Yet</p>
          <p>Review errors and submit again to proceed.</p>
        </div>
      )}
    </div>
  );
}
