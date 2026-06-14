import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isRequired: { type: Boolean, default: true },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isRequired: { type: Boolean, default: true },
    estimatedDays: { type: Number, default: 1 },
    deliverables: { type: [String], default: [] },
    subtasks: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    starterCode: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['python', 'javascript', 'java', 'cpp'],
      default: 'python',
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'EASY',
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    skillsCovered: {
      type: [String],
      default: [],
    },
    topicTitle: {
      type: String,
      default: '',
    },
    subtasks: [subtaskSchema],
    testCases: [testCaseSchema],
    milestones: [milestoneSchema],
    completionChecklist: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

projectSchema.index({ userId: 1, status: 1, createdAt: -1 });
projectSchema.index({ topicId: 1 });
projectSchema.index({ userId: 1, difficulty: 1 });

projectSchema.pre('save', function (next) {
  if (this.status === 'completed') {
    this.progress = 100;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
