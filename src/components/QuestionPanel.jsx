import React from 'react';

const TOPIC_QUESTIONS = {
  'Introduction to Arrays': {
    title: 'Array Operations',
    difficulty: 'EASY',
    description: 'Given an array of integers, implement functions to:\n1. Find the maximum element\n2. Reverse the array in-place\n3. Check if the array is sorted\n\nWrite clean, efficient code with O(n) time complexity where possible.',
    examples: [
      { input: 'arr = [3, 7, 1, 9, 4]', output: 'max = 9, reversed = [4, 9, 1, 7, 3], sorted = false' },
      { input: 'arr = [1, 2, 3, 4, 5]', output: 'max = 5, reversed = [5, 4, 3, 2, 1], sorted = true' },
    ],
    constraints: ['1 <= arr.length <= 10^5', '-10^9 <= arr[i] <= 10^9'],
  },
  'Hash Maps & Sets': {
    title: 'Frequency Counter',
    difficulty: 'EASY',
    description: 'Given an array of integers, find the most frequent element. If there are multiple elements with the same highest frequency, return the smallest among them.\n\nConstraints:\n- Use a hash map to track frequencies\n- O(n) time complexity required',
    examples: [
      { input: 'nums = [1, 3, 2, 1, 4, 1]', output: '1 (frequency: 3)' },
      { input: 'nums = [2, 2, 3, 3, 5]', output: '2 (frequency: 2, smallest of ties)' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
  },
  'Two Pointer Technique': {
    title: 'Pair with Target Sum',
    difficulty: 'MEDIUM',
    description: 'Given a sorted array of integers and a target sum, find if there exists a pair of elements that add up to the target.\n\nUse the two-pointer technique to achieve O(n) time complexity.',
    examples: [
      { input: 'arr = [1, 2, 3, 4, 6], target = 6', output: 'True (1 + 5 = 6 → indices 0 and 4)' },
      { input: 'arr = [2, 5, 9, 11], target = 7', output: 'False' },
    ],
    constraints: ['2 <= arr.length <= 10^5', '-10^9 <= arr[i] <= 10^9, arr is sorted in ascending order'],
  },
};

const DEFAULT_QUESTION = {
  title: 'Coding Challenge',
  difficulty: 'MEDIUM',
  description: 'Implement the required solution for this challenge. Write efficient code and consider edge cases.\n\nRun your code to test it, then submit when you are ready.',
  examples: [
    { input: 'Sample input', output: 'Expected output' },
  ],
  constraints: ['Standard constraints apply'],
};

export default function QuestionPanel({ topic, isDarkTheme }) {
  const question = TOPIC_QUESTIONS[topic?.title] || DEFAULT_QUESTION;

  return (
    <div className={`h-full overflow-y-auto ${isDarkTheme ? 'bg-slate-900 text-slate-50' : 'bg-white text-slate-950'}`}>
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-bold text-lg">{question.title}</h2>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
            question.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            : question.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
          }`}>
            {question.difficulty}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line opacity-90">
          {question.description}
        </p>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-label-md">description</span>
            Examples
          </h3>
          <div className="space-y-3">
            {question.examples.map((ex, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${isDarkTheme ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                <p className="font-mono text-xs mb-1"><span className="font-semibold">Input:</span> {ex.input}</p>
                <p className="font-mono text-xs mb-1"><span className="font-semibold">Output:</span> {ex.output}</p>
              </div>
            ))}
          </div>
        </div>

        {question.constraints && (
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-label-md">warning</span>
              Constraints
            </h3>
            <ul className="space-y-1.5">
              {question.constraints.map((c, i) => (
                <li key={i} className="text-xs font-mono opacity-80 flex items-start gap-2">
                  <span className="material-symbols-outlined text-label-sm mt-0.5">chevron_right</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}