/**
 * services/judge0Service.js
 *
 * Proxy wrapper for the Judge0 CE (Community Edition) sandbox API.
 * Handles code submission, polling for results, and status normalization.
 *
 * Methods:
 *  - submitCode(code, languageId, stdin)  → Submits code, returns Judge0 token
 *  - getResult(token)                     → Polls for execution result by token
 *  - runAndWait(code, languageId, stdin)  → Submit + poll loop (up to 10 retries)
 *
 * Judge0 Language IDs:
 *  Python 3   → 71
 *  JavaScript → 63
 *  Java       → 62
 *  C++        → 54
 *
 * Judge0 Status IDs:
 *  1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer,
 *  5=Time Limit, 6=Compilation Error, 11=Runtime Error (SIGSEGV)
 */

const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
};

const STATUS_MAP = {
  1: 'pending',
  2: 'processing',
  3: 'accepted',
  4: 'wrong_answer',
  5: 'time_limit_exceeded',
  6: 'compilation_error',
  11: 'runtime_error',
  12: 'runtime_error',
  13: 'runtime_error',
};

const toBase64 = (str) => Buffer.from(str || '').toString('base64');
const fromBase64 = (str) => (str ? Buffer.from(str, 'base64').toString('utf-8') : '');

export const submitCode = async (code, languageId, stdin = '') => {
  const response = await fetch(
    `${process.env.JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=false`,
    {
      method: 'POST',
      headers: JUDGE0_HEADERS,
      body: JSON.stringify({
        source_code: toBase64(code),
        language_id: languageId,
        stdin: toBase64(stdin),
        cpu_time_limit: 5,   // seconds
        memory_limit: 128000, // KB
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Judge0 submit error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.token;
};

export const getResult = async (token) => {
  const response = await fetch(
    `${process.env.JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true`,
    { method: 'GET', headers: JUDGE0_HEADERS }
  );

  if (!response.ok) {
    throw new Error(`Judge0 fetch error ${response.status}`);
  }

  const data = await response.json();

  return {
    token,
    statusId: data.status?.id,
    status: STATUS_MAP[data.status?.id] || 'failed',
    statusDescription: data.status?.description,
    stdout: fromBase64(data.stdout),
    stderr: fromBase64(data.stderr),
    compileOutput: fromBase64(data.compile_output),
    executionTime: parseFloat(data.time || '0') * 1000, // convert to ms
    memoryUsed: data.memory || 0,
  };
};

export const runAndWait = async (code, languageId, stdin = '', maxRetries = 10) => {
  const token = await submitCode(code, languageId, stdin);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Wait 1 second between polls
    await new Promise((r) => setTimeout(r, 1000));

    const result = await getResult(token);

    // Status 1 (In Queue) or 2 (Processing) means keep polling
    if (result.statusId !== 1 && result.statusId !== 2) {
      return result; // Execution complete
    }
  }

  throw new Error('Judge0 execution timed out after maximum retries.');
};
