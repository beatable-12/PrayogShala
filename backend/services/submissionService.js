import Submission from '../models/Submission.js';
import Topic from '../models/Topic.js';
import Project from '../models/Project.js';

export const createSubmission = async ({ userId, topicId, projectId, sourceCode, language }) => {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    const error = new Error('Topic not found.');
    error.statusCode = 404;
    throw error;
  }

  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      throw error;
    }
  }

  const validLanguages = ['python', 'javascript', 'java', 'cpp'];
  const lang = language || 'python';
  if (!validLanguages.includes(lang)) {
    const error = new Error(`Unsupported language: ${lang}. Supported: ${validLanguages.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const submission = await Submission.create({
    userId,
    topicId,
    projectId: projectId || null,
    sourceCode,
    language: lang,
    status: 'pending',
  });

  return submission;
};

export const getSubmissionById = async (submissionId, userId) => {
  const submission = await Submission.findOne({
    _id: submissionId,
    userId,
  }).populate('topicId', 'title slug difficulty')
    .populate('projectId', 'title status');

  if (!submission) {
    const error = new Error('Submission not found.');
    error.statusCode = 404;
    throw error;
  }

  return submission;
};

export const getUserSubmissions = async ({ userId, topicId, projectId, status, page = 1, limit = 20 }) => {
  const filter = { userId };

  if (topicId) filter.topicId = topicId;
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate('topicId', 'title slug difficulty')
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Submission.countDocuments(filter),
  ]);

  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
