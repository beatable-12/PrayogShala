import Submission from '../models/Submission.js';
import * as judge0 from './judge0Service.js';

export const executeCode = async ({ userId, topicId, projectId, sourceCode, language }) => {
  const submission = await Submission.create({
    userId,
    topicId,
    projectId: projectId || null,
    sourceCode,
    language,
    status: 'pending',
    stdout: '',
    stderr: '',
    compileOutput: '',
    executionTime: 0,
    memoryUsed: 0,
  });

  try {
    const result = await judge0.runAndWait(sourceCode, language);

    submission.judge0Token = result.token;
    submission.status = result.status;
    submission.stdout = result.stdout;
    submission.stderr = result.stderr;
    submission.compileOutput = result.compileOutput;
    submission.executionTime = result.executionTime;
    submission.memoryUsed = result.memoryUsed;
    await submission.save();

    return submission;
  } catch (error) {
    submission.status = 'failed';
    submission.stderr = error.message;
    await submission.save();
    throw error;
  }
};

export const getExecutionResult = async (submissionId, userId) => {
  const submission = await Submission.findOne({ _id: submissionId, userId })
    .populate('topicId', 'title slug difficulty')
    .populate('projectId', 'title status');

  if (!submission) {
    const error = new Error('Submission not found.');
    error.statusCode = 404;
    throw error;
  }

  return submission;
};
