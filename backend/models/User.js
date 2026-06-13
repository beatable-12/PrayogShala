import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * models/User.js
 *
 * Represents a registered learner on PrayogShala.
 *
 * Fields:
 *  - name           : Full display name
 *  - email          : Unique login identifier
 *  - password       : Bcrypt hashed. Never stored as plain text.
 *  - role           : 'student' (default) or 'admin'
 *  - preferredLang  : Native language for Sarvam AI explanations
 *  - xp             : Total experience points accumulated
 *  - unlockedTopics : Array of Topic ObjectIds this user has unlocked
 *  - completedTopics: Array of Topic ObjectIds this user has fully completed
 *
 * Instance Methods:
 *  - matchPassword(candidate) → Compares raw password against stored hash
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    preferredLang: {
      type: String,
      enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi'],
      default: 'English',
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    unlockedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    completedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Pre-save hook: Hash password before saving to database
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified (prevents re-hashing on other updates)
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: Compare candidate password with stored hash
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
