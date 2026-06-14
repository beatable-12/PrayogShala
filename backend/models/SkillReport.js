import mongoose from 'mongoose';
import crypto from 'crypto';

const breakdownSchema = new mongoose.Schema(
  {
    conceptValidation: { type: Number, default: 0, min: 0, max: 100 },
    codeExecution: { type: Number, default: 0, min: 0, max: 100 },
    vivaScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const topicMasterySchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    topicTitle: { type: String, default: '' },
    difficulty: { type: String, default: 'EASY' },
    score: { type: Number, default: 0, min: 0, max: 100 },
    submissionsCount: { type: Number, default: 0 },
    bestSubmissionScore: { type: Number, default: 0 },
    vivaScore: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const skillReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    },
    vivaSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Viva',
      default: null,
    },
    reportType: {
      type: String,
      enum: ['per_topic', 'comprehensive'],
      default: 'comprehensive',
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    breakdown: {
      type: breakdownSchema,
      default: () => ({}),
    },
    topicMastery: [topicMasterySchema],
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true,
    },
    languageUsed: {
      type: String,
      default: 'English',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    issuedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

skillReportSchema.index({ userId: 1, topicId: 1 }, { unique: true, sparse: true });
skillReportSchema.index({ userId: 1, reportType: 1 });
skillReportSchema.index({ isVerified: 1, issuedAt: -1 });

skillReportSchema.pre('save', function (next) {
  if (this.breakdown) {
    const { conceptValidation, codeExecution, vivaScore } = this.breakdown;
    this.overallScore = Math.round(
      conceptValidation * 0.2 + codeExecution * 0.4 + vivaScore * 0.4
    );
  }

  if (!this.readinessScore) {
    this.readinessScore = this.overallScore;
  }

  if (!this.certificateId && this.overallScore >= 60) {
    const prefix = 'PRS';
    const rand = crypto.randomBytes(12).toString('hex').toUpperCase();
    this.certificateId = `${prefix}-${rand.slice(0, 8)}-${rand.slice(8, 16)}-${rand.slice(16, 24)}`;
  }

  if (this.overallScore >= 60 && !this.issuedAt) {
    this.isVerified = true;
    this.issuedAt = new Date();
  }

  next();
});

const SkillReport = mongoose.model('SkillReport', skillReportSchema);
export default SkillReport;
