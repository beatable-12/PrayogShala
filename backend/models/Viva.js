import mongoose from 'mongoose';

/**
 * models/Viva.js
 *
 * Stores a complete AI Code-Aware Viva Voce session.
 * Gemini reads the student's submitted code and generates contextual questions.
 * Student answers are evaluated and graded by Gemini.
 *
 * Fields:
 *  - user       : Student taking the viva
 *  - submission : The code submission being evaluated
 *  - topic      : Topic this viva is for
 *  - messages   : Ordered array of question/answer exchanges
 *  - totalScore : Final aggregated score (0–100)
 *  - feedback   : Gemini's overall assessment paragraph
 *  - status     : 'in_progress' until all questions answered, then 'completed'
 *  - isPassed   : True if totalScore >= passingThreshold (default 60)
 */
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['gemini', 'student'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    score: {
      type: Number, // Score for this individual answer (0–10), null for gemini messages
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const vivaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    messages: [messageSchema],
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    passingThreshold: {
      type: Number,
      default: 60,
    },
  },
  { timestamps: true }
);

// Set isPassed based on totalScore before saving
vivaSchema.pre('save', function (next) {
  if (this.status === 'completed') {
    this.isPassed = this.totalScore >= this.passingThreshold;
  }
  next();
});

const Viva = mongoose.model('Viva', vivaSchema);
export default Viva;
