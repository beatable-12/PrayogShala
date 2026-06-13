import mongoose from 'mongoose';

/**
 * models/Topic.js
 *
 * A Topic is a single learnable unit (e.g., "Two Pointers").
 * It contains:
 *  - The concept explanation text (used by Sarvam AI for translation)
 *  - A validation quiz question (MCQ or code-fill)
 *  - A linked project to unlock upon passing validation
 *  - XP reward for completion
 *
 * Fields:
 *  - module          : Parent Module reference
 *  - title           : Display name (e.g., "Two Pointers")
 *  - slug            : URL-friendly identifier
 *  - conceptText     : English explanation passed to Sarvam for translation
 *  - difficulty      : EASY / MEDIUM / HARD badge
 *  - xpReward        : XP granted when topic is completed
 *  - validationQuiz  : Embedded quiz document for concept checking
 *  - projectTemplate : Starter code and tasks for Project Forge
 *  - order           : Display order within the parent module
 */
const validationQuizSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String }], // For MCQ — empty for code-fill types
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    type: {
      type: String,
      enum: ['mcq', 'code-fill', 'true-false'],
      default: 'mcq',
    },
  },
  { _id: false }
);

const projectTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    starterCode: { type: String, default: '' }, // Pre-filled code for Monaco Editor
    language: {
      type: String,
      enum: ['python', 'javascript', 'java', 'cpp'],
      default: 'python',
    },
    subtasks: [
      {
        order: Number,
        title: String,
        description: String,
        isRequired: { type: Boolean, default: true },
      },
    ],
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false },
      },
    ],
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    conceptText: {
      type: String,
      required: [true, 'Concept explanation text is required'],
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'EASY',
    },
    xpReward: {
      type: Number,
      default: 250,
    },
    estimatedMinutes: {
      type: Number,
      default: 15,
    },
    validationQuiz: validationQuizSchema,
    projectTemplate: projectTemplateSchema,
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
