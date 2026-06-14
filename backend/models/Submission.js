import mongoose from 'mongoose';

export const LANGUAGE_IDS = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
};

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code is required'],
      maxlength: [131072, 'Source code cannot exceed 128 KB'],
    },
    language: {
      type: String,
      enum: ['python', 'javascript', 'java', 'cpp'],
      default: 'python',
    },
    judge0Token: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'accepted',
        'wrong_answer',
        'time_limit_exceeded',
        'compilation_error',
        'runtime_error',
        'failed',
      ],
      default: 'pending',
    },
    stdout: { type: String, default: '' },
    stderr: { type: String, default: '' },
    compileOutput: { type: String, default: '' },
    executionTime: { type: Number, default: 0 },
    memoryUsed: { type: Number, default: 0 },
    testsPassed: { type: Number, default: 0 },
    testsTotal: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 100 },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, topicId: 1, createdAt: -1 });
submissionSchema.index({ projectId: 1, createdAt: -1 });
submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ judge0Token: 1 });

submissionSchema.pre('save', function (next) {
  if (this.testsTotal > 0) {
    this.score = Math.round((this.testsPassed / this.testsTotal) * 100);
    this.isAccepted = this.testsPassed === this.testsTotal;
  }
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
