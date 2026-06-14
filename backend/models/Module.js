import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Module description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    icon: {
      type: String,
      default: 'extension',
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

moduleSchema.index({ order: 1 });
moduleSchema.index({ isPublished: 1, order: 1 });

const Module = mongoose.model('Module', moduleSchema);
export default Module;
