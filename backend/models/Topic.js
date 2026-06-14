import mongoose from 'mongoose';

const validationQuizSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String }],
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
    starterCode: { type: String, default: '' },
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

topicSchema.index({ module: 1, order: 1 });
topicSchema.index({ isPublished: 1, module: 1, order: 1 });

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
