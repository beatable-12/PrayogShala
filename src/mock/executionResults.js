export const MOCK_EXECUTION_RESULTS = {
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

export const STUDENT_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCORC75NEe7NBU1z87AuQNtXyTdif3ZPyQXc1Z0goA0Cye65uq3n8uzU9zCtA90aikovzMPz4hhskY48uTJwJgLwhIatKKsHpnHiFfe41Cc0xa6NyzgjeznlATd_QtvyMQjuCyOmmLxQFCJ39tTWPmQCsQiU-nQeTT7hEt-19Hh1IyT-S0UevoSnYKZ8nbGzDybTu8gkZv86FFLnYMvQoJwv3CRRLetMJKIofMQGCrW4ED2tdQcEtHA';

export const INITIAL_XP = 1000;
