import mongoose from 'mongoose';

/**
 * models/Module.js
 *
 * A Module is a high-level learning category (e.g., "Arrays & Hashing").
 * It groups multiple Topics under a single curriculum chapter.
 *
 * Fields:
 *  - title       : Display name (e.g., "Arrays & Hashing")
 *  - description : Short curriculum summary
 *  - order       : Integer defining the sidebar display sequence
 *  - icon        : Material Symbol icon name for the UI
 *  - topics      : References to all Topic documents belonging to this module
 *  - isPublished : Hides draft modules from students
 */
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

const Module = mongoose.model('Module', moduleSchema);
export default Module;
