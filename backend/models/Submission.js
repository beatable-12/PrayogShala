import mongoose from 'mongoose';

/**
 * models/Submission.js
 *
 * Records every code submission a student makes in the Monaco Editor.
 * Stores Judge0 execution results and auto-grading scores.
 *
 * Fields:
 *  - user          : Student who submitted
 *  - topic         : Which topic this submission belongs to
 *  - code          : The raw source code submitted
 *  - language      : Programming language (maps to Judge0 language IDs)
 *  - judge0Token   : Token returned by Judge0 for async polling
 *  - status        : Current execution status
 *  - stdout        : Standard output from program execution
 *  - stderr        : Standard error / compilation errors
 *  - executionTime : Time taken in milliseconds
 *  - memoryUsed    : Memory used in KB
 *  - testsPassed   : Number of test cases passed
 *  - testsTotal    : Total number of test cases run
 *  - score         : Auto-computed percentage score
 *  - isAccepted    : True when all required test cases pass
 */

// Maps language name to Judge0 language_id
export const LANGUAGE_IDS = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
};

const submissionSchema = new mongoose.Schema(
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
    code: {
      type: String,
      required: [true, 'Submitted code is required'],
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
    executionTime: { type: Number, default: 0 }, // milliseconds
    memoryUsed: { type: Number, default: 0 },     // KB
    testsPassed: { type: Number, default: 0 },
    testsTotal: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 100 },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-compute score before saving
submissionSchema.pre('save', function (next) {
  if (this.testsTotal > 0) {
    this.score = Math.round((this.testsPassed / this.testsTotal) * 100);
    this.isAccepted = this.testsPassed === this.testsTotal;
  }
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
