import mongoose from 'mongoose';

/**
 * models/SkillReport.js
 *
 * The verified digital credential issued to a student after completing
 * a full learning flow: Sarvam Explanation → Concept Validation → 
 * Project Build → Judge0 Execution → Viva Voce.
 *
 * Fields:
 *  - user            : Student the report belongs to
 *  - topic           : The topic this report certifies
 *  - submission      : The accepted code submission
 *  - viva            : The passed viva session
 *  - overallScore    : Composite score across all stages (0–100)
 *  - breakdown       : Per-stage score details
 *  - certificateId   : Unique verifiable public ID
 *  - languageUsed    : The native language the student learned in
 *  - isVerified      : True once all criteria are met
 *  - issuedAt        : Timestamp of certificate issuance
 */
const skillReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    viva: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Viva',
      required: true,
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    breakdown: {
      conceptValidation: { type: Number, default: 0 }, // Quiz score (0–100)
      codeExecution: { type: Number, default: 0 },     // Judge0 test score (0–100)
      vivaScore: { type: Number, default: 0 },         // Gemini viva score (0–100)
    },
    certificateId: {
      type: String,
      unique: true,
      required: true,
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

// Compute overall score as weighted average before saving
skillReportSchema.pre('save', function (next) {
  const { conceptValidation, codeExecution, vivaScore } = this.breakdown;
  // Weights: Quiz 20%, Code 40%, Viva 40%
  this.overallScore = Math.round(
    conceptValidation * 0.2 + codeExecution * 0.4 + vivaScore * 0.4
  );
  if (this.overallScore >= 60 && !this.issuedAt) {
    this.isVerified = true;
    this.issuedAt = new Date();
  }
  next();
});

const SkillReport = mongoose.model('SkillReport', skillReportSchema);
export default SkillReport;
