/**
 * src/components/ExecutionPanel.jsx
 * Bottom panel showing input/output, test cases, and execution results
 * 
 * Tabs:
 * - Input: Provide stdin
 * - Output: Show stdout
 * - Errors: Show compilation/runtime errors
 * - Test Cases: Show which tests passed/failed
 * - Results: Show execution stats (time, memory)
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { CheckCircle2, XCircle, AlertCircle, Clock, Zap, Activity } from 'lucide-react';

export default function ExecutionPanel({
  output,
  errors,
  executionResult,
  input,
  onInputChange,
  isDarkTheme,
}) {
  const [activeTab, setActiveTab] = useState('output');

  const TabButton = ({ value, label, icon: Icon }) => (
    <TabsTrigger
      value={value}
      className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
        activeTab === value
          ? isDarkTheme
            ? 'bg-blue-900 text-blue-100 border-b-2 border-blue-500'
            : 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
          : isDarkTheme
          ? 'text-slate-400 hover:text-slate-200'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <Icon size={16} />
      {label}
    </TabsTrigger>
  );

  const MockResults = {
    status: 'accepted',
    stdout: 'Output from your program\n',
    stderr: '',
    executionTime: 45,
    memoryUsed: 8,
    testsPassed: 5,
    testsTotal: 5,
    testCases: [
      { input: '[1, 2, 3]', output: '[1, 2, 3]', passed: true },
      { input: '[3, 2, 1]', output: '[3, 2, 1]', passed: true },
      { input: '[]', output: '[]', passed: true },
      { input: '[1]', output: '[1]', passed: true },
      { input: '[-1, 0, 1]', output: '[-1, 0, 1]', passed: true },
    ],
  };

  const results = executionResult || MockResults;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      {/* Tab List */}
      <TabsList className={`px-4 pt-2 border-b ${isDarkTheme ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <TabButton value="output" label="Output" icon={Activity} />
        <TabButton value="input" label="Input" icon={Zap} />
        <TabButton value="tests" label="Tests" icon={CheckCircle2} />
        <TabButton value="results" label="Results" icon={Clock} />
        {errors && <TabButton value="errors" label="Errors" icon={AlertCircle} />}
      </TabsList>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Output Tab */}
        <TabsContent value="output" className="h-full overflow-auto">
          <pre className={`p-4 text-sm font-mono whitespace-pre-wrap break-words ${
            isDarkTheme ? 'bg-slate-950 text-slate-50' : 'bg-white text-slate-950'
          }`}>
            {output || <span className={isDarkTheme ? 'text-slate-500' : 'text-slate-400'}>No output yet. Run your code to see results.</span>}
          </pre>
        </TabsContent>

        {/* Input Tab */}
        <TabsContent value="input" className="h-full overflow-auto">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter input here (one line per input)..."
            className={`w-full h-full p-4 font-mono text-sm resize-none border-none focus:outline-none ${
              isDarkTheme
                ? 'bg-slate-950 text-slate-50 placeholder-slate-600'
                : 'bg-white text-slate-950 placeholder-slate-400'
            }`}
          />
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className={`h-full overflow-auto p-4 space-y-3 ${isDarkTheme ? 'bg-slate-950' : 'bg-white'}`}>
          {results.testCases ? (
            <>
              <div className={`p-3 rounded-lg ${results.testsPassed === results.testsTotal ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'}`}>
                <p className="font-semibold">
                  {results.testsPassed}/{results.testsTotal} tests passed
                </p>
              </div>
              <div className="space-y-2">
                {results.testCases.map((test, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      test.passed
                        ? isDarkTheme
                          ? 'border-green-900 bg-green-950 text-green-100'
                          : 'border-green-300 bg-green-50 text-green-900'
                        : isDarkTheme
                        ? 'border-red-900 bg-red-950 text-red-100'
                        : 'border-red-300 bg-red-50 text-red-900'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {test.passed ? (
                        <CheckCircle2 size={18} className="flex-shrink-0" />
                      ) : (
                        <XCircle size={18} className="flex-shrink-0" />
                      )}
                      <span className="font-semibold">Test {idx + 1}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><span className="font-medium">Input:</span> {test.input}</p>
                      <p><span className="font-medium">Expected:</span> {test.output}</p>
                      {!test.passed && <p><span className="font-medium">Got:</span> (different)</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={isDarkTheme ? 'text-slate-500' : 'text-slate-400'}>No test results yet.</p>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className={`h-full overflow-auto p-4 ${isDarkTheme ? 'bg-slate-950' : 'bg-white'}`}>
          {executionResult ? (
            <div className="space-y-4">
              {/* Status */}
              <div className={`p-4 rounded-lg ${
                results.status === 'accepted'
                  ? 'bg-green-900 text-green-100'
                  : results.status === 'wrong_answer'
                  ? 'bg-red-900 text-red-100'
                  : 'bg-yellow-900 text-yellow-100'
              }`}>
                <p className="font-semibold text-lg capitalize">
                  {results.status === 'accepted' ? '✓ Accepted' : results.status === 'wrong_answer' ? '✗ Wrong Answer' : `⚠ ${results.status}`}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <p className={`text-xs font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                    EXECUTION TIME
                  </p>
                  <p className="text-lg font-bold">{results.executionTime}ms</p>
                </div>

                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <p className={`text-xs font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                    MEMORY USED
                  </p>
                  <p className="text-lg font-bold">{results.memoryUsed}MB</p>
                </div>

                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <p className={`text-xs font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                    TESTS PASSED
                  </p>
                  <p className="text-lg font-bold">
                    {results.testsPassed}/{results.testsTotal}
                  </p>
                </div>

                <div className={`p-3 rounded-lg ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <p className={`text-xs font-semibold ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                    SCORE
                  </p>
                  <p className="text-lg font-bold">
                    {Math.round((results.testsPassed / results.testsTotal) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className={isDarkTheme ? 'text-slate-500' : 'text-slate-400'}>Run your code to see execution results.</p>
          )}
        </TabsContent>

        {/* Errors Tab */}
        {errors && (
          <TabsContent value="errors" className="h-full overflow-auto">
            <pre className={`p-4 text-sm font-mono whitespace-pre-wrap break-words text-red-100 ${
              isDarkTheme ? 'bg-red-950' : 'bg-red-50'
            }`}>
              {errors}
            </pre>
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}
