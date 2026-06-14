import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['sarvam', 'student'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 10,
    },
    category: {
      type: String,
      enum: ['concept', 'implementation', 'optimization', 'edge_cases'],
      default: null,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
    },
    codeAnalysis: {
      algorithmsUsed: [String],
      dataStructuresUsed: [String],
      optimizations: [String],
      timeComplexity: { type: String, default: '' },
      spaceComplexity: { type: String, default: '' },
      weaknesses: [String],
      suggestions: [String],
    },
    executionContext: {
      runtime: { type: Number, default: 0 },
      memory: { type: Number, default: 0 },
      status: { type: String, default: '' },
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

vivaSchema.index({ userId: 1, status: 1, createdAt: -1 });
vivaSchema.index({ userId: 1, submissionId: 1 }, { unique: true, sparse: true });
vivaSchema.index({ status: 1, createdAt: -1 });

vivaSchema.pre('save', function (next) {
  if (this.status === 'completed') {
    this.isPassed = this.totalScore >= this.passingThreshold;
  }
  next();
});

const Viva = mongoose.model('Viva', vivaSchema);
export default Viva;
