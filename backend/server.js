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
  submitCodeHandler,
  getSubmissions,
  getSubmissionById,
  pollSubmission,
} from './controllers/submissionController.js';
import {
  startVivaSession,
  submitAnswer,
  completeViva,
  getVivaById,
  getUserVivas,
} from './controllers/vivaController.js';
import {
  generateReport,
  getReportById,
  getUserReports,
  verifyReport,
  getAllReports,
} from './controllers/skillReportController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

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
  [
    body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('preferredLang').optional().isIn(['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi']),
  ],
  validateRequest,
  register
);

app.post(
  '/api/auth/login',
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

app.post('/api/submissions', protect, submitCodeHandler);
app.get('/api/submissions', protect, getSubmissions);
app.get('/api/submissions/:id', protect, getSubmissionById);
app.get('/api/submissions/:id/poll', protect, pollSubmission);

// ============================================
// VIVA ROUTES
// ============================================

app.post('/api/viva/start', protect, startVivaSession);
app.post('/api/viva/:id/answer', protect, submitAnswer);
app.patch('/api/viva/:id/complete', protect, completeViva);
app.get('/api/viva', protect, getUserVivas);
app.get('/api/viva/:id', protect, getVivaById);

// ============================================
// SKILL REPORT ROUTES
// ============================================

app.post('/api/skill-reports', protect, generateReport);
app.get('/api/skill-reports', protect, getUserReports);
app.get('/api/skill-reports/:id', protect, getReportById);
app.get('/api/skill-reports/verify/:certificateId', verifyReport); // Public
app.get('/api/admin/skill-reports', protect, adminOnly, getAllReports); // Admin only

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

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
