import { LANGUAGE_IDS } from '../models/Submission.js';
import { fetchWithTimeout } from '../utils/fetchWithTimeout.js';

const JUDGE0_BASE = process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
};

const STATUS_MAP = {
  1: 'processing',
  2: 'processing',
  3: 'accepted',
  4: 'wrong_answer',
  5: 'time_limit_exceeded',
  6: 'compilation_error',
  7: 'runtime_error',
  8: 'runtime_error',
  9: 'runtime_error',
  10: 'runtime_error',
  11: 'runtime_error',
  12: 'runtime_error',
  13: 'failed',
  14: 'processing',
};

const toBase64 = (str) => Buffer.from(str || '', 'utf-8').toString('base64');
const fromBase64 = (str) => (str ? Buffer.from(str, 'base64').toString('utf-8') : '');

const mapLanguage = (language) => {
  const id = LANGUAGE_IDS[language];
  if (!id) throw new Error(`Unsupported language: ${language}`);
  return id;
};

const MAX_CODE_SIZE = 64 * 1024; // 64KB

export const submitCode = async (sourceCode, language, stdin = '') => {
  const languageId = mapLanguage(language);

  if (Buffer.byteLength(sourceCode, 'utf-8') > MAX_CODE_SIZE) {
    throw new Error(`Source code exceeds maximum size of 64KB (${(Buffer.byteLength(sourceCode, 'utf-8') / 1024).toFixed(1)}KB)`);
  }

  const response = await fetch(
    `${JUDGE0_BASE}/submissions?base64_encoded=true&wait=false`,
    {
      method: 'POST',
      headers: JUDGE0_HEADERS,
      body: JSON.stringify({
        source_code: toBase64(sourceCode),
        language_id: languageId,
        stdin: toBase64(stdin),
        cpu_time_limit: 5,
        memory_limit: 128000,
      }),
    },
    30000
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Judge0 submission error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.token;
};

export const getResult = async (token) => {
  const response = await fetch(
    `${JUDGE0_BASE}/submissions/${token}?base64_encoded=true`,
    { method: 'GET', headers: JUDGE0_HEADERS },
    30000
  );

  if (!response.ok) {
    throw new Error(`Judge0 fetch error ${response.status} for token ${token}`);
  }

  const data = await response.json();

  return {
    token,
    statusId: data.status?.id,
    status: STATUS_MAP[data.status?.id] || 'failed',
    statusDescription: data.status?.description || '',
    stdout: fromBase64(data.stdout),
    stderr: fromBase64(data.stderr),
    compileOutput: fromBase64(data.compile_output),
    executionTime: parseFloat(data.time || '0') * 1000,
    memoryUsed: data.memory || 0,
  };
};

export const runAndWait = async (sourceCode, language, stdin = '', maxRetries = 30) => {
  const token = await submitCode(sourceCode, language, stdin);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const delay = Math.min(1000 * Math.pow(1.5, attempt), 5000);
    await new Promise((r) => setTimeout(r, delay));

    const result = await getResult(token);

    if (result.statusId !== 1 && result.statusId !== 2) {
      return result;
    }
  }

  throw new Error('Judge0 execution timed out. Max polling retries exceeded.');
};
