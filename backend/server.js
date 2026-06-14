import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { protect, adminOnly } from './middleware/authMiddleware.js';
import { validateRequest } from './middleware/validateMiddleware.js';

// ============================================
// CONTROLLERS
// ============================================
import {
  register,
  login,
  getMe,
  updateMe,
  logout,
} from './controllers/authController.js';
import {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from './controllers/moduleController.js';
import {
  getAllTopics,
  getTopicBySlug,
  explainTopic,
  speakTopic,
  validateAnswer,
  createTopic,
  updateTopic,
  deleteTopic,
} from './controllers/topicController.js';
import {
  createSubmission,
  getSubmissionById,
  getUserSubmissions,
} from './controllers/submissionController.js';
import {
  execute,
  getResult,
} from './controllers/executionController.js';
import {
  explain,
  mentorExplain,
  mentorApproach,
  mentorComplexity,
  mentorHint,
  mentorDebug,
  mentorReview,
  mentorViva,
  textToSpeech,
} from './controllers/sarvamController.js';
import {
  getProjectByTopic,
  getProjectByIndex,
  getAllBankProjects,
  unlockProject,
  completeMilestone,
  completeProject,
  getProjectProgress,
} from './controllers/projectController.js';
import { generateMilestones } from './controllers/milestoneController.js';
import {
  startVivaSession,
  submitAnswer,
  completeViva,
  getVivaById,
  getVivaResult,
  getUserVivas,
} from './controllers/vivaController.js';
import {
  generateReport,
  getReportById,
  getSkillReport,
  getUserReports,
  verifyReport,
  getAllReports,
} from './controllers/skillReportController.js';

// TODO: Implement AI controllers — see aiController.js for contract definitions
// import {
//   explainConcept,
//   generateHint,
//   reviewCode,
//   analyzeCode,
//   generateVivaQuestion,
//   evaluateVivaAnswer,
//   translateContent,
//   textToSpeech,
//   detectLanguage,
//   generateProject,
//   generateMilestones,
// } from './controllers/aiController.js';

// Load environment variables
dotenv.config();

const app = express();
const DEFAULT_PORT = Number.parseInt(process.env.PORT || '5000', 10);

// ============================================
// MIDDLEWARE - SECURITY & PARSING
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true 
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// HTTP request logging
app.use(morgan('combined'));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
});

const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many code executions, please wait a moment.',
});

const vivaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many viva requests, please wait a moment.',
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many AI requests, please wait a moment.',
});

app.use('/api/', globalLimiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API is running', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// AUTH ROUTES
// ============================================

app.post(
  '/api/auth/register',
  authLimiter,
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('preferredLang').optional().isIn(['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi']),
  ],
  validateRequest,
  register
);

app.post(
  '/api/auth/login',
  authLimiter,
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  login
);

app.get('/api/auth/me', protect, getMe);

app.patch(
  '/api/auth/me',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('preferredLang').optional().isIn(['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi']),
  ],
  validateRequest,
  updateMe
);

app.post('/api/auth/logout', protect, logout);

// ============================================
// MODULE ROUTES
// ============================================

app.get('/api/modules', getAllModules);
app.get('/api/modules/:id', getModuleById);
app.post('/api/modules', protect, adminOnly, createModule);
app.put('/api/modules/:id', protect, adminOnly, updateModule);
app.delete('/api/modules/:id', protect, adminOnly, deleteModule);

// ============================================
// TOPIC ROUTES
// ============================================

app.get('/api/topics', getAllTopics);
app.get('/api/topics/:slug', getTopicBySlug);
app.post('/api/topics/:slug/explain', protect, explainTopic);
app.post('/api/topics/:slug/speak', protect, speakTopic);
app.post('/api/topics/:slug/validate', protect, validateAnswer);
app.post('/api/topics', protect, adminOnly, createTopic);
app.put('/api/topics/:id', protect, adminOnly, updateTopic);
app.delete('/api/topics/:id', protect, adminOnly, deleteTopic);

// ============================================
// SUBMISSION ROUTES
// ============================================

app.post('/api/submissions', protect, createSubmission);
app.get('/api/submissions/:id', protect, getSubmissionById);
app.get('/api/submissions/user/:userId', protect, getUserSubmissions);

app.post('/api/execute', protect, executionLimiter, execute);
app.get('/api/execute/:id', protect, getResult);

// ============================================
// PROJECT GENERATION ROUTES
// ============================================

// Project Bank routes
app.get('/api/projects/bank', protect, getAllBankProjects);
app.get('/api/projects/bank/:index', protect, getProjectByIndex);
app.get('/api/projects/topic/:topicSlug', protect, getProjectByTopic);
app.post('/api/projects/unlock', protect, unlockProject);
app.put('/api/projects/milestone', protect, completeMilestone);
app.put('/api/projects/complete', protect, completeProject);
app.get('/api/projects/progress', protect, getProjectProgress);

// ============================================
// SARVAM TUTOR ROUTES
// ============================================

app.post('/api/sarvam/explain', protect, aiLimiter, explain);

// Prayog Mentor — 7 action endpoints
app.post('/api/sarvam/mentor/explain', protect, aiLimiter, mentorExplain);
app.post('/api/sarvam/mentor/approach', protect, aiLimiter, mentorApproach);
app.post('/api/sarvam/mentor/complexity', protect, aiLimiter, mentorComplexity);
app.post('/api/sarvam/mentor/hint', protect, aiLimiter, mentorHint);
app.post('/api/sarvam/mentor/debug', protect, aiLimiter, mentorDebug);
app.post('/api/sarvam/mentor/review', protect, aiLimiter, mentorReview);
app.post('/api/sarvam/mentor/viva', protect, aiLimiter, mentorViva);

// TTS
app.post('/api/sarvam/tts', protect, aiLimiter, textToSpeech);

// ============================================
// VIVA ROUTES
// ============================================

app.post('/api/viva/start', protect, vivaLimiter, startVivaSession);
app.post('/api/viva/:id/answer', protect, vivaLimiter, submitAnswer);
app.patch('/api/viva/:id/complete', protect, vivaLimiter, completeViva);
app.get('/api/viva', protect, getUserVivas);
app.get('/api/viva/:id', protect, getVivaById);
app.get('/api/viva/:id/result', protect, getVivaResult);

// ============================================
// SKILL REPORT ROUTES
// ============================================

app.post('/api/skill-reports', protect, generateReport);
app.get('/api/skill-reports', protect, getUserReports);
app.get('/api/skill-reports/verify/:certificateId', verifyReport); // Public — must be before :id
app.get('/api/skill-reports/:id', protect, getReportById);
app.get('/api/admin/skill-reports', protect, adminOnly, getAllReports); // Admin only
app.get('/api/skill-report/:userId', protect, getSkillReport);

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const listenOnPort = (port) => new Promise((resolve, reject) => {
      const server = app.listen(port, () => resolve(server));

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          resolve(null);
          return;
        }

        reject(error);
      });
    });

    let currentPort = DEFAULT_PORT;
    let server = null;

    while (!server) {
      // Move to the next port if the requested one is already occupied.
      server = await listenOnPort(currentPort);

      if (!server) {
        currentPort += 1;
      }
    }

    if (currentPort !== DEFAULT_PORT) {
      console.warn(`⚠️ Port ${DEFAULT_PORT} is busy, using ${currentPort} instead.`);
    }

    console.log(`✅ Server running on port ${currentPort}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 API Health: http://localhost:${currentPort}/api/health`);
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
